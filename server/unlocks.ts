export interface FeatureUnlock {
  feature: string;
  label: string;
  requiredLevel: number;
  category: string;
}

export const UNLOCK_MAP: FeatureUnlock[] = [
  { feature: "tasks", label: "Tasks", requiredLevel: 1, category: "basics" },
  { feature: "check_ins", label: "Check-Ins", requiredLevel: 1, category: "basics" },
  { feature: "journal", label: "Journal", requiredLevel: 1, category: "basics" },
  { feature: "whispers", label: "Whisper Chamber", requiredLevel: 1, category: "basics" },
  { feature: "rituals", label: "Rituals", requiredLevel: 1, category: "basics" },
  { feature: "notifications", label: "Notifications", requiredLevel: 1, category: "basics" },
  { feature: "standing_orders", label: "Standing Orders", requiredLevel: 1, category: "basics" },

  { feature: "dares", label: "Dares", requiredLevel: 3, category: "challenge" },
  { feature: "stickers", label: "Stickers", requiredLevel: 3, category: "challenge" },
  { feature: "ratings", label: "Ratings", requiredLevel: 3, category: "challenge" },
  { feature: "rewards", label: "Rewards", requiredLevel: 3, category: "challenge" },
  { feature: "punishments", label: "Punishments", requiredLevel: 3, category: "challenge" },

  { feature: "interrogation", label: "Interrogation Mode", requiredLevel: 5, category: "advanced" },
  { feature: "wagers", label: "Wagers", requiredLevel: 5, category: "advanced" },
  { feature: "accusations", label: "Accusations", requiredLevel: 5, category: "advanced" },
  { feature: "confessions", label: "Confession Booth", requiredLevel: 5, category: "advanced" },

  { feature: "live_sessions", label: "Live Sessions", requiredLevel: 7, category: "elite" },
  { feature: "punishment_chest", label: "Punishment Chest", requiredLevel: 7, category: "elite" },
  { feature: "reward_chest", label: "Reward Chest", requiredLevel: 7, category: "elite" },
  { feature: "contracts", label: "Contracts", requiredLevel: 7, category: "elite" },

  { feature: "sensation_roulette", label: "Sensation Roulette", requiredLevel: 10, category: "master" },
  { feature: "sealed_orders", label: "Sealed Orders", requiredLevel: 10, category: "master" },
  { feature: "endurance_challenges", label: "Endurance Challenges", requiredLevel: 10, category: "master" },
  { feature: "obedience_trials", label: "Obedience Trials", requiredLevel: 10, category: "master" },

  { feature: "scene_scripts", label: "Scene Scripts", requiredLevel: 15, category: "grandmaster" },
  { feature: "training_programs", label: "Training Programs", requiredLevel: 15, category: "grandmaster" },
  { feature: "body_map", label: "Body Map", requiredLevel: 15, category: "grandmaster" },
];

export function getUnlockedFeatures(level: number): FeatureUnlock[] {
  return UNLOCK_MAP.filter(u => u.requiredLevel <= level);
}

export function getLockedFeatures(level: number): FeatureUnlock[] {
  return UNLOCK_MAP.filter(u => u.requiredLevel > level);
}

export function isFeatureUnlocked(feature: string, level: number): boolean {
  const entry = UNLOCK_MAP.find(u => u.feature === feature);
  if (!entry) return true;
  return level >= entry.requiredLevel;
}

export function getRequiredLevel(feature: string): number | null {
  const entry = UNLOCK_MAP.find(u => u.feature === feature);
  return entry ? entry.requiredLevel : null;
}

export function getNewUnlocks(oldLevel: number, newLevel: number): FeatureUnlock[] {
  return UNLOCK_MAP.filter(u => u.requiredLevel > oldLevel && u.requiredLevel <= newLevel);
}
