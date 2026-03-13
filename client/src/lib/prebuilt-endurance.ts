export interface PrebuiltEnduranceChallenge {
  title: string;
  category: string;
  description: string;
  durationHours: number;
  checkinIntervalMinutes: number;
  xpPerCheckin: number;
  difficulty: number;
}

export const ENDURANCE_CATEGORIES = [
  "Physical",
  "Mental",
  "Denial",
  "Service",
  "Silence",
  "Exposure",
  "Devotion",
  "Survival",
] as const;

export const PREBUILT_ENDURANCE_CHALLENGES: PrebuiltEnduranceChallenge[] = [
  { title: "The Iron Kneel", category: "Physical", description: "Kneel for 5 minutes every hour, checking in with a photo each time", durationHours: 8, checkinIntervalMinutes: 60, xpPerCheckin: 20, difficulty: 5 },
  { title: "Silence is Golden", category: "Silence", description: "No speaking unless directly addressed. Check in hourly to confirm compliance", durationHours: 6, checkinIntervalMinutes: 60, xpPerCheckin: 15, difficulty: 4 },
  { title: "Denial Day", category: "Denial", description: "Complete denial of a specified pleasure for the full duration. Check in every 2 hours", durationHours: 12, checkinIntervalMinutes: 120, xpPerCheckin: 25, difficulty: 6 },
  { title: "Service Marathon", category: "Service", description: "Complete one service task every 30 minutes. Report each task at check-in", durationHours: 4, checkinIntervalMinutes: 30, xpPerCheckin: 15, difficulty: 5 },
  { title: "The Vigil", category: "Devotion", description: "Stay awake and devoted past your normal bedtime. Check in every 30 minutes", durationHours: 3, checkinIntervalMinutes: 30, xpPerCheckin: 20, difficulty: 7 },
  { title: "Posture Patrol", category: "Physical", description: "Maintain perfect posture all day. Check in with photo proof every 90 minutes", durationHours: 10, checkinIntervalMinutes: 90, xpPerCheckin: 15, difficulty: 4 },
  { title: "Edge Walker", category: "Denial", description: "Edge without release on command, checking in at each interval for further instructions", durationHours: 4, checkinIntervalMinutes: 60, xpPerCheckin: 25, difficulty: 8 },
  { title: "Mindfulness Gauntlet", category: "Mental", description: "Write a 3-sentence reflection at each check-in about your headspace and devotion", durationHours: 8, checkinIntervalMinutes: 120, xpPerCheckin: 20, difficulty: 3 },
  { title: "Cold Exposure Protocol", category: "Physical", description: "Take a cold shower at each check-in interval. Report water temperature and duration", durationHours: 6, checkinIntervalMinutes: 120, xpPerCheckin: 30, difficulty: 7 },
  { title: "The Silent Watch", category: "Silence", description: "No phone, no screens, no speaking. Sit with your thoughts and check in by written note", durationHours: 3, checkinIntervalMinutes: 60, xpPerCheckin: 25, difficulty: 6 },
  { title: "Clothing Restriction", category: "Exposure", description: "Wear only what is assigned for the full duration. Check in with confirmation each interval", durationHours: 8, checkinIntervalMinutes: 120, xpPerCheckin: 15, difficulty: 4 },
  { title: "Worship Hours", category: "Devotion", description: "Dedicate each check-in to a written praise of your Dom. Must be unique each time", durationHours: 6, checkinIntervalMinutes: 60, xpPerCheckin: 20, difficulty: 4 },
  { title: "Task Storm", category: "Service", description: "Complete a new household task every 45 minutes with photo proof at check-in", durationHours: 6, checkinIntervalMinutes: 45, xpPerCheckin: 15, difficulty: 5 },
  { title: "The Long Kneel", category: "Physical", description: "3-minute kneeling hold every 30 minutes for 4 hours straight", durationHours: 4, checkinIntervalMinutes: 30, xpPerCheckin: 20, difficulty: 7 },
  { title: "Digital Detox", category: "Mental", description: "No social media or entertainment apps. Only this app allowed. Hourly check-ins", durationHours: 12, checkinIntervalMinutes: 60, xpPerCheckin: 10, difficulty: 3 },
  { title: "Overnight Devotion", category: "Survival", description: "Set alarms through the night to check in and affirm your devotion. Extreme test of will", durationHours: 8, checkinIntervalMinutes: 120, xpPerCheckin: 35, difficulty: 9 },
  { title: "Pain Tolerance Builder", category: "Physical", description: "Progressively harder physical challenges at each gate — planks, wall sits, ice holds", durationHours: 3, checkinIntervalMinutes: 30, xpPerCheckin: 25, difficulty: 8 },
  { title: "Mantra Marathon", category: "Mental", description: "Write your assigned mantra 50 times at each check-in interval", durationHours: 6, checkinIntervalMinutes: 120, xpPerCheckin: 20, difficulty: 5 },
  { title: "The Exposed Day", category: "Exposure", description: "Wear a hidden mark or item only you and your Dom know about. Report feelings at each gate", durationHours: 10, checkinIntervalMinutes: 120, xpPerCheckin: 15, difficulty: 3 },
  { title: "Survival Sprint", category: "Survival", description: "Rapid-fire challenge — complete a task at each 15-minute gate for 2 hours straight", durationHours: 2, checkinIntervalMinutes: 15, xpPerCheckin: 20, difficulty: 8 },
];