export interface PrebuiltLimit {
  name: string;
  category: string;
  level: string;
}

export const LIMIT_CATEGORIES = [
  "Physical",
  "Emotional",
  "Sexual",
  "Social",
  "Digital",
  "Financial",
  "Time",
  "Psychological",
] as const;

export const PREBUILT_LIMITS: PrebuiltLimit[] = [
  // Physical
  { name: "No face slapping", category: "Physical", level: "hard" },
  { name: "No breath play or choking", category: "Physical", level: "hard" },
  { name: "No blood drawing or cutting", category: "Physical", level: "hard" },
  { name: "No branding or permanent marks", category: "Physical", level: "hard" },
  { name: "No hitting with closed fist", category: "Physical", level: "hard" },
  { name: "No kicking", category: "Physical", level: "hard" },
  { name: "Light spanking only — open hand", category: "Physical", level: "soft" },
  { name: "No impact on spine or kidneys", category: "Physical", level: "hard" },
  { name: "No suspension bondage", category: "Physical", level: "soft" },
  { name: "No extreme temperature play", category: "Physical", level: "soft" },
  { name: "No needle play", category: "Physical", level: "hard" },
  { name: "No electrical play above the waist", category: "Physical", level: "soft" },
  { name: "No food restriction or forced eating", category: "Physical", level: "soft" },
  { name: "No sleep deprivation", category: "Physical", level: "hard" },
  { name: "Gentle bondage only — quick-release restraints", category: "Physical", level: "soft" },

  // Emotional
  { name: "No silent treatment as punishment", category: "Emotional", level: "hard" },
  { name: "No public humiliation", category: "Emotional", level: "hard" },
  { name: "No name-calling outside of agreed terms", category: "Emotional", level: "hard" },
  { name: "No threats of abandonment", category: "Emotional", level: "hard" },
  { name: "No gaslighting or reality-denial", category: "Emotional", level: "hard" },
  { name: "No withholding aftercare", category: "Emotional", level: "hard" },
  { name: "No using personal insecurities as punishment", category: "Emotional", level: "hard" },
  { name: "No comparisons to previous partners", category: "Emotional", level: "hard" },
  { name: "No punishment when emotionally distressed", category: "Emotional", level: "soft" },
  { name: "No degradation outside of scenes", category: "Emotional", level: "soft" },
  { name: "Always allow safe word without guilt", category: "Emotional", level: "hard" },
  { name: "No weaponizing mental health", category: "Emotional", level: "hard" },

  // Sexual
  { name: "No anal play", category: "Sexual", level: "hard" },
  { name: "No sharing or involving third parties", category: "Sexual", level: "hard" },
  { name: "No filming or photography during scenes", category: "Sexual", level: "soft" },
  { name: "No orgasm denial beyond 3 days", category: "Sexual", level: "soft" },
  { name: "No public sexual acts", category: "Sexual", level: "hard" },
  { name: "No forced nudity outside the home", category: "Sexual", level: "hard" },
  { name: "No sex while under the influence", category: "Sexual", level: "soft" },
  { name: "No unprotected play with others", category: "Sexual", level: "hard" },
  { name: "No watersports", category: "Sexual", level: "hard" },
  { name: "No scat play", category: "Sexual", level: "hard" },
  { name: "Condoms required with any new activities", category: "Sexual", level: "soft" },
  { name: "No sexual contact during menstruation (if preferred)", category: "Sexual", level: "soft" },

  // Social
  { name: "No play in front of friends or family", category: "Social", level: "hard" },
  { name: "No visible marks in public", category: "Social", level: "soft" },
  { name: "No D/s titles in front of vanilla friends", category: "Social", level: "soft" },
  { name: "No restricting contact with family", category: "Social", level: "hard" },
  { name: "No isolating from friends", category: "Social", level: "hard" },
  { name: "No public collar without discussion", category: "Social", level: "soft" },
  { name: "No outing the dynamic to others without consent", category: "Social", level: "hard" },
  { name: "No forced socialization when needing alone time", category: "Social", level: "soft" },
  { name: "No restricting work relationships", category: "Social", level: "hard" },
  { name: "No embarrassing partner in public settings", category: "Social", level: "hard" },

  // Digital
  { name: "No reading private messages without permission", category: "Digital", level: "hard" },
  { name: "No posting about dynamic on social media", category: "Digital", level: "soft" },
  { name: "No sharing intimate photos or videos", category: "Digital", level: "hard" },
  { name: "No GPS tracking without consent", category: "Digital", level: "hard" },
  { name: "No monitoring browsing history secretly", category: "Digital", level: "soft" },
  { name: "No deleting contacts or apps", category: "Digital", level: "hard" },
  { name: "No impersonating on social media", category: "Digital", level: "hard" },
  { name: "No screen time restrictions during work hours", category: "Digital", level: "soft" },
  { name: "No accessing locked/private notes", category: "Digital", level: "soft" },
  { name: "No recording calls or conversations secretly", category: "Digital", level: "hard" },

  // Financial
  { name: "No financial punishment beyond agreed amounts", category: "Financial", level: "hard" },
  { name: "No controlling access to personal bank accounts", category: "Financial", level: "hard" },
  { name: "No large purchases as punishment", category: "Financial", level: "hard" },
  { name: "No gambling with shared finances", category: "Financial", level: "hard" },
  { name: "No restricting access to personal income", category: "Financial", level: "hard" },
  { name: "Spending limits require mutual agreement", category: "Financial", level: "soft" },
  { name: "No financial secrets — transparency required", category: "Financial", level: "soft" },
  { name: "No using money as leverage for consent", category: "Financial", level: "hard" },

  // Time
  { name: "No scenes during work hours", category: "Time", level: "soft" },
  { name: "No tasks that interfere with job responsibilities", category: "Time", level: "hard" },
  { name: "Guaranteed personal time — minimum 1 hour daily", category: "Time", level: "soft" },
  { name: "No late-night sessions on work nights", category: "Time", level: "soft" },
  { name: "Weekday bedtime must be respected", category: "Time", level: "soft" },
  { name: "No canceling pre-planned events for scenes", category: "Time", level: "soft" },
  { name: "Morning routine must not be disrupted", category: "Time", level: "soft" },
  { name: "No tasks during family visits", category: "Time", level: "hard" },

  // Psychological
  { name: "No age play", category: "Psychological", level: "hard" },
  { name: "No pet play involving dehumanization", category: "Psychological", level: "soft" },
  { name: "No race play", category: "Psychological", level: "hard" },
  { name: "No forced feminization/masculinization without consent", category: "Psychological", level: "hard" },
  { name: "No religious play or blasphemy play", category: "Psychological", level: "hard" },
  { name: "No CNC without extensive negotiation and planning", category: "Psychological", level: "soft" },
  { name: "No using real fears or phobias in scenes", category: "Psychological", level: "hard" },
  { name: "No mind games outside of agreed scenes", category: "Psychological", level: "hard" },
  { name: "No hypnosis without explicit consent each time", category: "Psychological", level: "soft" },
  { name: "No punishment that triggers past trauma", category: "Psychological", level: "hard" },
];