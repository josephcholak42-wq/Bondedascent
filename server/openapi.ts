export function getOpenApiSpec(baseUrl: string) {
  return {
    openapi: "3.1.0",
    info: {
      title: "BondedAscent API",
      version: "1.0.0",
      description: "API for BondedAscent protocol management application. Authenticate using either session cookies or API keys (Bearer token or X-API-Key header).",
    },
    servers: [{ url: baseUrl, description: "Current server" }],
    security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          description: "API key passed as Bearer token. Format: ba_xxxxx",
        },
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "X-API-Key",
          description: "API key passed via X-API-Key header. Format: ba_xxxxx",
        },
      },
    },
    paths: {
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login with username and password",
          operationId: "login",
          requestBody: { content: { "application/json": { schema: { type: "object", required: ["username", "password"], properties: { username: { type: "string" }, password: { type: "string" } } } } } },
          responses: { "200": { description: "Returns the authenticated user" }, "401": { description: "Invalid credentials" } },
          security: [],
        },
      },
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          operationId: "register",
          requestBody: { content: { "application/json": { schema: { type: "object", required: ["username", "password"], properties: { username: { type: "string" }, password: { type: "string" }, role: { type: "string", enum: ["dom", "sub"] } } } } } },
          responses: { "200": { description: "Returns the created user" } },
          security: [],
        },
      },
      "/api/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Get the currently authenticated user",
          operationId: "getCurrentUser",
          responses: { "200": { description: "Current user data" }, "401": { description: "Not authenticated" } },
        },
      },
      "/api/api-keys": {
        get: {
          tags: ["API Keys"],
          summary: "List all active API keys for the authenticated user",
          operationId: "listApiKeys",
          responses: { "200": { description: "Array of API key metadata (hash/full key not included)" } },
        },
        post: {
          tags: ["API Keys"],
          summary: "Generate a new API key",
          operationId: "createApiKey",
          requestBody: { content: { "application/json": { schema: { type: "object", required: ["name"], properties: { name: { type: "string", description: "A friendly name for this key" }, scopes: { type: "array", items: { type: "string" }, description: "Permission scopes (default: ['all'])" }, expiresInDays: { type: "integer", description: "Days until expiry (optional)" } } } } } },
          responses: { "201": { description: "Returns the API key (shown only once)" } },
        },
      },
      "/api/api-keys/{id}": {
        delete: {
          tags: ["API Keys"],
          summary: "Revoke an API key",
          operationId: "revokeApiKey",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Key revoked" } },
        },
      },
      "/api/dashboard-init": {
        get: { tags: ["Dashboard"], summary: "Get initial dashboard data for the authenticated user", operationId: "dashboardInit", responses: { "200": { description: "Dashboard initialization data including user, partner, tasks, etc." } } },
      },
      "/api/tasks": {
        get: { tags: ["Tasks"], summary: "Get all tasks for the user/pair", operationId: "getTasks", responses: { "200": { description: "Array of tasks" } } },
        post: { tags: ["Tasks"], summary: "Create a new task", operationId: "createTask", requestBody: { content: { "application/json": { schema: { type: "object", required: ["text"], properties: { text: { type: "string" }, userId: { type: "string" } } } } } }, responses: { "201": { description: "Created task" } } },
      },
      "/api/tasks/{id}": {
        patch: { tags: ["Tasks"], summary: "Update a task", operationId: "updateTask", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { text: { type: "string" }, done: { type: "boolean" } } } } } }, responses: { "200": { description: "Updated task" } } },
        delete: { tags: ["Tasks"], summary: "Delete a task", operationId: "deleteTask", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Task deleted" } } },
      },
      "/api/tasks/{id}/toggle": {
        patch: { tags: ["Tasks"], summary: "Toggle task completion", operationId: "toggleTask", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Toggled task" } } },
      },
      "/api/checkins": {
        get: { tags: ["Check-ins"], summary: "Get check-ins for the user/pair", operationId: "getCheckins", responses: { "200": { description: "Array of check-ins" } } },
        post: { tags: ["Check-ins"], summary: "Submit a check-in", operationId: "createCheckin", requestBody: { content: { "application/json": { schema: { type: "object", required: ["mood", "obedience"], properties: { mood: { type: "integer", minimum: 1, maximum: 10 }, obedience: { type: "integer", minimum: 1, maximum: 10 }, notes: { type: "string" } } } } } }, responses: { "201": { description: "Created check-in" } } },
      },
      "/api/dares": {
        get: { tags: ["Dares"], summary: "Get dares for the user/pair", operationId: "getDares", responses: { "200": { description: "Array of dares" } } },
      },
      "/api/dares/spin": {
        post: { tags: ["Dares"], summary: "Spin for a random dare", operationId: "spinDare", responses: { "200": { description: "Generated dare" } } },
      },
      "/api/rewards": {
        get: { tags: ["Rewards"], summary: "Get rewards", operationId: "getRewards", responses: { "200": { description: "Array of rewards" } } },
        post: { tags: ["Rewards"], summary: "Create a reward", operationId: "createReward", requestBody: { content: { "application/json": { schema: { type: "object", required: ["name"], properties: { name: { type: "string" }, description: { type: "string" }, category: { type: "string" }, userId: { type: "string" } } } } } }, responses: { "201": { description: "Created reward" } } },
      },
      "/api/punishments": {
        get: { tags: ["Punishments"], summary: "Get punishments", operationId: "getPunishments", responses: { "200": { description: "Array of punishments" } } },
        post: { tags: ["Punishments"], summary: "Create a punishment", operationId: "createPunishment", requestBody: { content: { "application/json": { schema: { type: "object", required: ["name"], properties: { name: { type: "string" }, category: { type: "string" }, duration: { type: "string" }, userId: { type: "string" } } } } } }, responses: { "201": { description: "Created punishment" } } },
      },
      "/api/journal": {
        get: { tags: ["Journal"], summary: "Get journal entries", operationId: "getJournal", responses: { "200": { description: "Array of journal entries" } } },
        post: { tags: ["Journal"], summary: "Create a journal entry", operationId: "createJournal", requestBody: { content: { "application/json": { schema: { type: "object", required: ["content"], properties: { content: { type: "string" }, isShared: { type: "boolean" } } } } } }, responses: { "201": { description: "Created entry" } } },
      },
      "/api/notifications": {
        get: { tags: ["Notifications"], summary: "Get notifications", operationId: "getNotifications", responses: { "200": { description: "Array of notifications" } } },
      },
      "/api/activity": {
        get: { tags: ["Activity"], summary: "Get activity log", operationId: "getActivity", responses: { "200": { description: "Array of activity entries" } } },
        post: { tags: ["Activity"], summary: "Log an activity", operationId: "logActivity", requestBody: { content: { "application/json": { schema: { type: "object", required: ["action"], properties: { action: { type: "string" }, detail: { type: "string" } } } } } }, responses: { "201": { description: "Logged activity" } } },
      },
      "/api/rituals": {
        get: { tags: ["Rituals"], summary: "Get rituals", operationId: "getRituals", responses: { "200": { description: "Array of rituals" } } },
        post: { tags: ["Rituals"], summary: "Create a ritual", operationId: "createRitual", requestBody: { content: { "application/json": { schema: { type: "object", required: ["title", "frequency"], properties: { title: { type: "string" }, description: { type: "string" }, frequency: { type: "string", enum: ["daily", "weekly", "monthly"] }, timeOfDay: { type: "string" } } } } } }, responses: { "201": { description: "Created ritual" } } },
      },
      "/api/rituals/{id}/complete": {
        post: { tags: ["Rituals"], summary: "Complete a ritual", operationId: "completeRitual", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Ritual marked complete" } } },
      },
      "/api/limits": {
        get: { tags: ["Limits"], summary: "Get limits", operationId: "getLimits", responses: { "200": { description: "Array of limits" } } },
        post: { tags: ["Limits"], summary: "Create a limit", operationId: "createLimit", requestBody: { content: { "application/json": { schema: { type: "object", required: ["name", "type"], properties: { name: { type: "string" }, type: { type: "string" }, description: { type: "string" } } } } } }, responses: { "201": { description: "Created limit" } } },
      },
      "/api/secrets": {
        get: { tags: ["Secrets"], summary: "Get secrets", operationId: "getSecrets", responses: { "200": { description: "Array of secrets" } } },
        post: { tags: ["Secrets"], summary: "Create a secret", operationId: "createSecret", requestBody: { content: { "application/json": { schema: { type: "object", required: ["content"], properties: { content: { type: "string" } } } } } }, responses: { "201": { description: "Created secret" } } },
      },
      "/api/wagers": {
        get: { tags: ["Wagers"], summary: "Get wagers", operationId: "getWagers", responses: { "200": { description: "Array of wagers" } } },
        post: { tags: ["Wagers"], summary: "Propose a wager", operationId: "createWager", requestBody: { content: { "application/json": { schema: { type: "object", required: ["description", "stakes"], properties: { description: { type: "string" }, stakes: { type: "string" } } } } } }, responses: { "201": { description: "Created wager" } } },
      },
      "/api/ratings": {
        get: { tags: ["Ratings"], summary: "Get ratings", operationId: "getRatings", responses: { "200": { description: "Array of ratings" } } },
        post: { tags: ["Ratings"], summary: "Give a rating", operationId: "createRating", requestBody: { content: { "application/json": { schema: { type: "object", required: ["category", "score"], properties: { category: { type: "string" }, score: { type: "integer", minimum: 1, maximum: 10 }, notes: { type: "string" } } } } } }, responses: { "201": { description: "Created rating" } } },
      },
      "/api/devotions": {
        get: { tags: ["Devotions"], summary: "Get devotions", operationId: "getDevotions", responses: { "200": { description: "Array of devotions" } } },
        post: { tags: ["Devotions"], summary: "Create a devotion", operationId: "createDevotion", requestBody: { content: { "application/json": { schema: { type: "object", required: ["content"], properties: { content: { type: "string" } } } } } }, responses: { "201": { description: "Created devotion" } } },
      },
      "/api/conflicts": {
        get: { tags: ["Conflicts"], summary: "Get conflicts", operationId: "getConflicts", responses: { "200": { description: "Array of conflicts" } } },
        post: { tags: ["Conflicts"], summary: "Open a conflict", operationId: "createConflict", requestBody: { content: { "application/json": { schema: { type: "object", required: ["description"], properties: { description: { type: "string" } } } } } }, responses: { "201": { description: "Created conflict" } } },
      },
      "/api/whispers": {
        get: { tags: ["Whispers"], summary: "Get whisper messages", operationId: "getWhispers", responses: { "200": { description: "Array of whispers" } } },
        post: { tags: ["Whispers"], summary: "Send a whisper", operationId: "sendWhisper", requestBody: { content: { "application/json": { schema: { type: "object", required: ["content"], properties: { content: { type: "string" }, type: { type: "string" } } } } } }, responses: { "201": { description: "Sent whisper" } } },
      },
      "/api/standing-orders": {
        get: { tags: ["Standing Orders"], summary: "Get standing orders", operationId: "getStandingOrders", responses: { "200": { description: "Array of standing orders" } } },
        post: { tags: ["Standing Orders"], summary: "Create a standing order", operationId: "createStandingOrder", requestBody: { content: { "application/json": { schema: { type: "object", required: ["text"], properties: { text: { type: "string" } } } } } }, responses: { "201": { description: "Created standing order" } } },
      },
      "/api/permission-requests": {
        get: { tags: ["Permissions"], summary: "Get permission requests", operationId: "getPermissionRequests", responses: { "200": { description: "Array of permission requests" } } },
        post: { tags: ["Permissions"], summary: "Submit a permission request", operationId: "createPermissionRequest", requestBody: { content: { "application/json": { schema: { type: "object", required: ["text"], properties: { text: { type: "string" } } } } } }, responses: { "201": { description: "Created permission request" } } },
      },
      "/api/countdown-events": {
        get: { tags: ["Countdowns"], summary: "Get countdown events", operationId: "getCountdownEvents", responses: { "200": { description: "Array of countdown events" } } },
        post: { tags: ["Countdowns"], summary: "Create a countdown event", operationId: "createCountdownEvent", requestBody: { content: { "application/json": { schema: { type: "object", required: ["title", "targetDate"], properties: { title: { type: "string" }, targetDate: { type: "string", format: "date-time" } } } } } }, responses: { "201": { description: "Created countdown event" } } },
      },
      "/api/desired-changes": {
        get: { tags: ["Desired Changes"], summary: "Get desired changes", operationId: "getDesiredChanges", responses: { "200": { description: "Array of desired changes" } } },
        post: { tags: ["Desired Changes"], summary: "Record a desired change", operationId: "createDesiredChange", requestBody: { content: { "application/json": { schema: { type: "object", required: ["description"], properties: { description: { type: "string" } } } } } }, responses: { "201": { description: "Created desired change" } } },
      },
      "/api/achievements": {
        get: { tags: ["Achievements"], summary: "Get achievements", operationId: "getAchievements", responses: { "200": { description: "Array of achievements" } } },
      },
      "/api/play-sessions": {
        get: { tags: ["Sessions"], summary: "Get play sessions", operationId: "getPlaySessions", responses: { "200": { description: "Array of play sessions" } } },
        post: { tags: ["Sessions"], summary: "Create a play session", operationId: "createPlaySession", requestBody: { content: { "application/json": { schema: { type: "object", properties: { title: { type: "string" }, notes: { type: "string" }, intensity: { type: "integer" }, scheduledFor: { type: "string", format: "date-time" } } } } } }, responses: { "201": { description: "Created session" } } },
      },
      "/api/streaks": {
        get: { tags: ["Streaks"], summary: "Get user streaks", operationId: "getStreaks", responses: { "200": { description: "Array of streaks" } } },
      },
      "/api/streaks/flames": {
        get: { tags: ["Streaks"], summary: "Get streak flame levels", operationId: "getStreakFlames", responses: { "200": { description: "Flame data" } } },
      },
      "/api/altar": {
        get: { tags: ["Altar"], summary: "Get daily altar state", operationId: "getAltar", responses: { "200": { description: "Altar data" } } },
      },
      "/api/altar/kneel": {
        post: { tags: ["Altar"], summary: "Kneel at the daily altar", operationId: "kneelAltar", responses: { "200": { description: "Altar offering claimed" } } },
      },
      "/api/user/stats": {
        get: { tags: ["User"], summary: "Get user statistics", operationId: "getUserStats", responses: { "200": { description: "User stats" } } },
      },
      "/api/pair/partner": {
        get: { tags: ["Pair"], summary: "Get partner data", operationId: "getPartner", responses: { "200": { description: "Partner user data" } } },
      },
      "/api/pair/partner/stats": {
        get: { tags: ["Pair"], summary: "Get partner statistics", operationId: "getPartnerStats", responses: { "200": { description: "Partner stats" } } },
      },
      "/api/pair/generate": {
        post: { tags: ["Pair"], summary: "Generate a pairing code", operationId: "generatePairCode", responses: { "200": { description: "Pairing code" } } },
      },
      "/api/pair/join": {
        post: { tags: ["Pair"], summary: "Join a pair using a code", operationId: "joinPair", requestBody: { content: { "application/json": { schema: { type: "object", required: ["code"], properties: { code: { type: "string" } } } } } }, responses: { "200": { description: "Paired successfully" } } },
      },
      "/api/contracts": {
        get: { tags: ["Contracts"], summary: "Get contracts", operationId: "getContracts", responses: { "200": { description: "Array of contracts" } } },
        post: { tags: ["Contracts"], summary: "Create a contract", operationId: "createContract", requestBody: { content: { "application/json": { schema: { type: "object", required: ["title", "content"], properties: { title: { type: "string" }, content: { type: "string" } } } } } }, responses: { "201": { description: "Created contract" } } },
      },
      "/api/sealed-orders": {
        get: { tags: ["Sealed Orders"], summary: "Get sealed orders targeting the user", operationId: "getSealedOrders", responses: { "200": { description: "Array of sealed orders" } } },
        post: { tags: ["Sealed Orders"], summary: "Create a sealed order", operationId: "createSealedOrder", requestBody: { content: { "application/json": { schema: { type: "object", required: ["content"], properties: { content: { type: "string" }, revealAt: { type: "string", format: "date-time" } } } } } }, responses: { "201": { description: "Created sealed order" } } },
      },
      "/api/endurance-challenges": {
        get: { tags: ["Endurance"], summary: "Get endurance challenges", operationId: "getEnduranceChallenges", responses: { "200": { description: "Array of challenges" } } },
        post: { tags: ["Endurance"], summary: "Create an endurance challenge", operationId: "createEnduranceChallenge", requestBody: { content: { "application/json": { schema: { type: "object", required: ["title", "durationDays"], properties: { title: { type: "string" }, durationDays: { type: "integer" } } } } } }, responses: { "201": { description: "Created challenge" } } },
      },
      "/api/simulation/active": {
        get: { tags: ["Simulation"], summary: "Get active Auto-Dom simulation", operationId: "getActiveSimulation", responses: { "200": { description: "Active simulation or null" } } },
      },
      "/api/simulation/activate": {
        post: { tags: ["Simulation"], summary: "Activate Auto-Dom simulation", operationId: "activateSimulation", requestBody: { content: { "application/json": { schema: { type: "object", required: ["level", "mode"], properties: { level: { type: "integer" }, mode: { type: "string" } } } } } }, responses: { "200": { description: "Activated simulation" } } },
      },
      "/api/feature-settings": {
        get: { tags: ["Settings"], summary: "Get feature toggle settings", operationId: "getFeatureSettings", responses: { "200": { description: "Feature settings" } } },
      },
      "/api/unlocks": {
        get: { tags: ["Progression"], summary: "Get ascension path unlock map", operationId: "getUnlocks", responses: { "200": { description: "Unlock map by level" } } },
      },
      "/api/tribunals": {
        get: { tags: ["Tribunals"], summary: "Get tribunal history", operationId: "getTribunals", responses: { "200": { description: "Array of tribunals" } } },
      },
      "/api/tribunals/current": {
        get: { tags: ["Tribunals"], summary: "Get current week's tribunal", operationId: "getCurrentTribunal", responses: { "200": { description: "Current tribunal" } } },
      },
      "/api/analytics": {
        get: { tags: ["Analytics"], summary: "Get personal analytics", operationId: "getAnalytics", responses: { "200": { description: "Analytics data" } } },
      },
      "/api/trends": {
        get: { tags: ["Analytics"], summary: "Get activity trends", operationId: "getTrends", responses: { "200": { description: "Trend data" } } },
      },
    },
  };
}
