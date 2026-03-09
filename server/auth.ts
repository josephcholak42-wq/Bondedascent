import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { type Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { type User } from "@shared/schema";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { sendToUser } from "./sse";
import { sendPushToUser } from "./push";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const buf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(Buffer.from(hashed, "hex"), buf);
}

const resetAttempts = new Map<string, { count: number; lastAttempt: number }>();
const RESET_MAX_ATTEMPTS = 5;
const RESET_WINDOW_MS = 15 * 60 * 1000;

export function setupAuth(app: Express) {
  const PgStore = connectPgSimple(session);

  let sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    sessionSecret = randomBytes(64).toString("hex");
    console.warn("WARNING: SESSION_SECRET environment variable is not set. Using a randomly generated secret. Sessions will not persist across server restarts. Set SESSION_SECRET for production use.");
  }

  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: new PgStore({
      pool,
      createTableIfMissing: true,
    }),
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid credentials" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || null);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const { username, password, email, role } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const hashedPassword = await hashPassword(password);
      const selectedRole = role || "sub";
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email: email || null,
        role: selectedRole,
        originalRole: selectedRole,
      });

      req.login(user, (err) => {
        if (err) return next(err);
        const { password: _, ...safeUser } = user;
        return res.status(201).json(safeUser);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: User | false, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Invalid credentials" });

      req.login(user, (err) => {
        if (err) return next(err);
        const { password: _, ...safeUser } = user;
        return res.json(safeUser);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const { password: _, ...safeUser } = req.user as User;
    res.json(safeUser);
  });

  app.post("/api/auth/forgot-password", async (req, res, next) => {
    try {
      const { username } = req.body;
      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }

      const user = await storage.getUserByUsername(username);
      if (user) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        const { pool: dbPool } = await import("./db");
        await dbPool.query(
          "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
          [user.id, code, expiresAt]
        );

        if (user.partnerId) {
          const notifText = `Password reset code for ${username}: ${code} (expires in 15 min)`;
          await storage.createNotification({ userId: user.partnerId, text: notifText, type: "alert" });
          sendToUser(user.partnerId, "notification", { text: notifText, type: "alert" });
          sendPushToUser(user.partnerId, "BondedAscent Alert", notifText, "alert").catch(() => {});
        }

        console.log(`[RESET CODE] User "${username}" reset code generated (expires in 15 min)`);
      }

      res.json({ message: "If an account exists with that username, a reset code has been sent to your partner." });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/auth/reset-password", async (req, res, next) => {
    try {
      const { token, code, newPassword } = req.body;
      const resetCode = code || token;
      if (!resetCode || !newPassword) {
        return res.status(400).json({ message: "Reset code and new password are required" });
      }

      if (newPassword.length < 4) {
        return res.status(400).json({ message: "Password must be at least 4 characters" });
      }

      const clientIp = req.ip || "unknown";
      const now = Date.now();
      const attempts = resetAttempts.get(clientIp);
      if (attempts) {
        if (now - attempts.lastAttempt < RESET_WINDOW_MS && attempts.count >= RESET_MAX_ATTEMPTS) {
          return res.status(429).json({ message: "Too many reset attempts. Please try again later." });
        }
        if (now - attempts.lastAttempt >= RESET_WINDOW_MS) {
          resetAttempts.set(clientIp, { count: 1, lastAttempt: now });
        } else {
          attempts.count++;
          attempts.lastAttempt = now;
        }
      } else {
        resetAttempts.set(clientIp, { count: 1, lastAttempt: now });
      }

      const { pool: dbPool } = await import("./db");
      const result = await dbPool.query(
        "SELECT * FROM password_reset_tokens WHERE token = $1 AND used = false AND expires_at > NOW()",
        [resetCode]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({ message: "Invalid or expired reset code" });
      }

      const resetToken = result.rows[0];
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUserPassword(resetToken.user_id, hashedPassword);

      await dbPool.query(
        "UPDATE password_reset_tokens SET used = true WHERE id = $1",
        [resetToken.id]
      );

      res.json({ message: "Password has been reset successfully" });
    } catch (err) {
      next(err);
    }
  });
}
