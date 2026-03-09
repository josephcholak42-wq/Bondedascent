import type { Response } from "express";

interface SSEClient {
  userId: string;
  res: Response;
  connectedAt: number;
}

const clients: Map<string, SSEClient[]> = new Map();

export function addSSEClient(userId: string, res: Response) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.write(":\n\n");

  const client: SSEClient = { userId, res, connectedAt: Date.now() };
  const existing = clients.get(userId) || [];
  existing.push(client);
  clients.set(userId, existing);

  const keepAlive = setInterval(() => {
    try {
      res.write(":\n\n");
    } catch {
      clearInterval(keepAlive);
    }
  }, 25000);

  res.on("close", () => {
    clearInterval(keepAlive);
    const userClients = clients.get(userId);
    if (userClients) {
      const filtered = userClients.filter((c) => c !== client);
      if (filtered.length === 0) {
        clients.delete(userId);
      } else {
        clients.set(userId, filtered);
      }
    }
  });
}

export function sendToUser(userId: string, event: string, data: any) {
  const userClients = clients.get(userId);
  if (!userClients || userClients.length === 0) return;

  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  const dead: SSEClient[] = [];

  for (const client of userClients) {
    try {
      client.res.write(payload);
    } catch {
      dead.push(client);
    }
  }

  if (dead.length > 0) {
    const alive = userClients.filter((c) => !dead.includes(c));
    if (alive.length === 0) {
      clients.delete(userId);
    } else {
      clients.set(userId, alive);
    }
  }
}

export function sendToUsers(userIds: string[], event: string, data: any) {
  for (const userId of userIds) {
    sendToUser(userId, event, data);
  }
}

export function getConnectedUserCount(): number {
  return clients.size;
}
