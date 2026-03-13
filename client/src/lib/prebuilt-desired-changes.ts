export interface PrebuiltDesiredChange {
  name: string;
  category: string;
  description: string;
}

export const DESIRED_CHANGE_CATEGORIES = [
  "Behavior",
  "Attitude",
  "Skill",
  "Habit",
  "Communication",
  "Appearance",
  "Mindset",
  "Routine",
] as const;

export const PREBUILT_DESIRED_CHANGES: PrebuiltDesiredChange[] = [
  // Behavior
  { name: "Ask permission before leaving the house", category: "Behavior", description: "Always communicate and seek approval before going out" },
  { name: "Greet properly when Dom arrives home", category: "Behavior", description: "Meet at the door with a proper greeting every time" },
  { name: "Keep eyes lowered in Dom's presence until told otherwise", category: "Behavior", description: "Practice submissive eye contact protocols" },
  { name: "No interrupting when Dom is speaking", category: "Behavior", description: "Wait until Dom finishes before responding" },
  { name: "Always say 'thank you' after receiving correction", category: "Behavior", description: "Express gratitude for guidance and discipline" },
  { name: "Kneel when presenting something to Dom", category: "Behavior", description: "Offer items from a kneeling position" },
  { name: "Wait to eat until Dom begins their meal", category: "Behavior", description: "Show respect by not eating before Dom" },
  { name: "Stand when Dom enters or leaves a room", category: "Behavior", description: "Acknowledge Dom's presence with physical respect" },
  { name: "Use proper titles at all times at home", category: "Behavior", description: "Consistently use agreed-upon honorifics" },
  { name: "Ask before sitting on furniture", category: "Behavior", description: "Seek permission before using shared furniture" },

  // Attitude
  { name: "Accept corrections without arguing", category: "Attitude", description: "Receive feedback gracefully and without defensiveness" },
  { name: "Maintain a positive and willing attitude during tasks", category: "Attitude", description: "Approach assignments with enthusiasm, not reluctance" },
  { name: "Express gratitude daily for the dynamic", category: "Attitude", description: "Regularly acknowledge the value of the relationship" },
  { name: "Stop complaining about assigned tasks", category: "Attitude", description: "Complete tasks without verbal or nonverbal complaints" },
  { name: "Be more patient during long scenes", category: "Attitude", description: "Practice endurance and patience without frustration" },
  { name: "Show enthusiasm when given new protocols", category: "Attitude", description: "Embrace new rules with excitement rather than resistance" },
  { name: "Be more vulnerable and open emotionally", category: "Attitude", description: "Share feelings freely without holding back" },
  { name: "Trust Dom's decisions without second-guessing", category: "Attitude", description: "Practice letting go and trusting the leadership" },
  { name: "Approach punishment as growth, not resentment", category: "Attitude", description: "View discipline as an opportunity to improve" },
  { name: "Maintain composure under pressure", category: "Attitude", description: "Stay calm and collected in challenging situations" },

  // Skill
  { name: "Learn to give a proper massage", category: "Skill", description: "Study massage techniques and practice regularly" },
  { name: "Improve cooking skills — master 5 new recipes", category: "Skill", description: "Learn to cook Dom's favorite meals" },
  { name: "Learn proper rope bondage safety", category: "Skill", description: "Study and understand safety protocols for bondage" },
  { name: "Master the art of anticipating Dom's needs", category: "Skill", description: "Learn to predict what Dom wants before being asked" },
  { name: "Learn to iron clothes perfectly", category: "Skill", description: "Produce wrinkle-free results every time" },
  { name: "Develop better oral skills", category: "Skill", description: "Practice and improve intimate techniques" },
  { name: "Learn basic first aid for scene safety", category: "Skill", description: "Be prepared to handle minor injuries during play" },
  { name: "Master a new domestic skill each month", category: "Skill", description: "Continuously expand household abilities" },
  { name: "Learn to properly present and serve food", category: "Skill", description: "Practice elegant table setting and food service" },
  { name: "Improve posture and body positioning", category: "Skill", description: "Master proper kneeling, standing, and presentation poses" },

  // Habit
  { name: "Wake up 30 minutes before Dom every day", category: "Habit", description: "Establish a morning routine that prioritizes service" },
  { name: "Make the bed immediately upon waking", category: "Habit", description: "Start each day with a completed task" },
  { name: "Drink 8 glasses of water daily", category: "Habit", description: "Maintain proper hydration as a self-care habit" },
  { name: "Exercise at least 30 minutes daily", category: "Habit", description: "Maintain physical fitness and health" },
  { name: "Journal every evening before bed", category: "Habit", description: "Reflect on the day and track personal growth" },
  { name: "Lay out clothes for the next day each night", category: "Habit", description: "Prepare clothing the evening before" },
  { name: "Practice mindfulness for 10 minutes daily", category: "Habit", description: "Build mental clarity through regular meditation" },
  { name: "Keep phone charged and accessible at all times", category: "Habit", description: "Always be reachable when Dom needs to communicate" },
  { name: "Send a good morning text to Dom every day", category: "Habit", description: "Start each day with a devotional message" },
  { name: "Maintain a consistent sleep schedule", category: "Habit", description: "Go to bed and wake up at the same time daily" },

  // Communication
  { name: "Respond to messages within 5 minutes", category: "Communication", description: "Prioritize prompt communication with Dom" },
  { name: "Use full sentences when addressing Dom", category: "Communication", description: "No one-word answers or lazy communication" },
  { name: "Provide daily check-in reports", category: "Communication", description: "Share a summary of the day's activities and feelings" },
  { name: "Express needs clearly instead of hinting", category: "Communication", description: "Communicate desires and needs directly" },
  { name: "Ask clarifying questions instead of guessing", category: "Communication", description: "Seek understanding rather than assuming" },
  { name: "Use proper grammar in all written communication", category: "Communication", description: "Maintain respect through proper writing" },
  { name: "Share feelings openly during check-ins", category: "Communication", description: "Be honest and transparent about emotional state" },
  { name: "Report rule violations immediately without hiding", category: "Communication", description: "Confess mistakes promptly and honestly" },
  { name: "Provide aftercare feedback after every scene", category: "Communication", description: "Communicate what worked and what didn't" },
  { name: "Use the traffic light system consistently", category: "Communication", description: "Communicate comfort levels clearly during play" },

  // Appearance
  { name: "Maintain grooming standards at all times", category: "Appearance", description: "Keep hair, nails, and skin well-maintained" },
  { name: "Wear approved outfits on designated days", category: "Appearance", description: "Follow the dress code on specified days" },
  { name: "Keep nails manicured and at approved length", category: "Appearance", description: "Maintain neat, clean nails always" },
  { name: "Wear collar whenever at home", category: "Appearance", description: "Always wear the collar as a symbol of devotion" },
  { name: "Maintain a tidy and clean appearance at all times", category: "Appearance", description: "Never appear unkempt or disheveled" },
  { name: "Wear matching underwear sets on special days", category: "Appearance", description: "Present coordinated undergarments when specified" },
  { name: "Keep hair styled as Dom prefers", category: "Appearance", description: "Maintain the hairstyle Dom finds most pleasing" },
  { name: "Maintain skin care routine daily", category: "Appearance", description: "Follow a consistent skincare regimen" },
  { name: "Wear light makeup or none as Dom specifies", category: "Appearance", description: "Follow makeup guidelines set by Dom" },
  { name: "Present for inspection before going out", category: "Appearance", description: "Allow Dom to approve appearance before leaving" },

  // Mindset
  { name: "Practice letting go of control in daily decisions", category: "Mindset", description: "Trust Dom to make decisions and release anxiety" },
  { name: "Reframe punishments as learning opportunities", category: "Mindset", description: "Shift perspective on discipline from negative to growth" },
  { name: "Embrace vulnerability as a strength", category: "Mindset", description: "See openness and surrender as power, not weakness" },
  { name: "Stop comparing yourself to others", category: "Mindset", description: "Focus on your own growth journey" },
  { name: "Develop a service-oriented mindset", category: "Mindset", description: "Find joy and purpose in serving Dom" },
  { name: "Practice being present in the moment", category: "Mindset", description: "Stop worrying about the future or dwelling on the past" },
  { name: "Accept imperfection while striving for excellence", category: "Mindset", description: "Balance self-improvement with self-compassion" },
  { name: "See structure and rules as freedom, not restriction", category: "Mindset", description: "Appreciate how boundaries create safety" },
  { name: "Cultivate inner peace through submission", category: "Mindset", description: "Find calm and centeredness in your role" },
  { name: "Release the need to always be right", category: "Mindset", description: "Prioritize harmony over being correct" },

  // Routine
  { name: "Follow morning protocol consistently", category: "Routine", description: "Complete all morning tasks in the correct order" },
  { name: "Evening wind-down routine — no screens 1 hour before bed", category: "Routine", description: "Establish a calming pre-sleep routine" },
  { name: "Weekly deep-cleaning of shared spaces", category: "Routine", description: "Maintain a schedule for thorough cleaning" },
  { name: "Prepare outfit and accessories the night before", category: "Routine", description: "Eliminate morning decision fatigue" },
  { name: "Weekly reflection and goal-setting session", category: "Routine", description: "Review progress and set new objectives regularly" },
  { name: "Daily gratitude practice — 3 things each morning", category: "Routine", description: "Start each day with thankfulness" },
  { name: "Consistent meal prep on Sundays", category: "Routine", description: "Prepare meals for the week ahead" },
  { name: "Monthly relationship check-in with Dom", category: "Routine", description: "Scheduled time to discuss the dynamic openly" },
  { name: "Daily self-care block — minimum 30 minutes", category: "Routine", description: "Dedicated time for personal wellness" },
  { name: "End-of-day review — tasks completed, lessons learned", category: "Routine", description: "Reflect on accomplishments and areas for growth" },
  { name: "Adopt blackout protocol response within 2 seconds", category: "Behavior", description: "Respond to emergency protocol words instantly without negotiation or delay" },
  { name: "Accept high-intensity corrections without collapse", category: "Attitude", description: "Develop emotional regulation during severe accountability moments" },
  { name: "Master long-duration restraint readiness", category: "Skill", description: "Build body conditioning and calm focus for extended controlled scenes" },
  { name: "Complete nightly accountability ledger", category: "Routine", description: "Log deviations, triggers, and corrective actions with uncompromising honesty" },
];