export interface PrebuiltTrainingProgram {
  title: string;
  description: string;
  durationDays: number;
  category: string;
  days: { dayNumber: number; title: string; objectives: string }[];
}

export const TRAINING_CATEGORIES = [
  "foundations",
  "obedience",
  "endurance",
  "service",
  "discipline",
  "advanced",
  "mindset",
  "intimacy",
] as const;

export const PREBUILT_TRAINING_PROGRAMS: PrebuiltTrainingProgram[] = [
  {
    title: "Obedience Foundations",
    description: "A 7-day introduction to the core principles of obedience and structure.",
    durationDays: 7,
    category: "foundations",
    days: [
      { dayNumber: 1, title: "Day 1: Awareness", objectives: "Practice mindful awareness of your actions and reactions throughout the day. Note every time you hesitate before following an instruction." },
      { dayNumber: 2, title: "Day 2: Posture & Presence", objectives: "Maintain proper posture at all times. Stand tall, sit straight, kneel with intention. Your body language communicates respect." },
      { dayNumber: 3, title: "Day 3: Active Listening", objectives: "Listen fully before responding. Repeat back instructions to confirm understanding. No interrupting." },
      { dayNumber: 4, title: "Day 4: Prompt Response", objectives: "Respond promptly to all requests without hesitation or delay. Time yourself — aim for under 3 seconds." },
      { dayNumber: 5, title: "Day 5: Patience", objectives: "Practice patience in moments of waiting. Accept timing that is not your own. No sighing, fidgeting, or rushing." },
      { dayNumber: 6, title: "Day 6: Consistency", objectives: "Maintain all previous lessons consistently throughout the day. No backsliding on earlier foundations." },
      { dayNumber: 7, title: "Day 7: Integration", objectives: "Integrate all foundations into a unified daily practice. Write a reflection on your growth this week." },
    ],
  },
  {
    title: "Domestic Service Mastery",
    description: "14-day program to perfect household service skills and anticipatory care.",
    durationDays: 14,
    category: "service",
    days: [
      { dayNumber: 1, title: "Day 1: Kitchen Basics", objectives: "Master your Dom's preferred beverages. Prepare each perfectly. Learn exact temperatures, sweetness levels, and presentation." },
      { dayNumber: 2, title: "Day 2: Bed Making", objectives: "Learn hospital corners. Practice until the bed is inspection-ready every time. Sheet tension should be coin-bounce tight." },
      { dayNumber: 3, title: "Day 3: Wardrobe Care", objectives: "Organize Dom's closet by category and color. Learn proper hanging, folding, and storage for each garment type." },
      { dayNumber: 4, title: "Day 4: Table Setting", objectives: "Master formal and casual table settings. Practice setting a full place setting from memory under 2 minutes." },
      { dayNumber: 5, title: "Day 5: Meal Preparation", objectives: "Prepare a full meal based on Dom's preferences. Focus on timing — all dishes ready simultaneously." },
      { dayNumber: 6, title: "Day 6: Cleaning Standards", objectives: "Deep clean one room to inspection standards. Learn which products to use on which surfaces. No streaks, no dust." },
      { dayNumber: 7, title: "Day 7: Laundry Mastery", objectives: "Sort, wash, dry, fold, iron, and put away a full load. Know fabric care symbols. Perfect creases on dress shirts." },
      { dayNumber: 8, title: "Day 8: Anticipation", objectives: "Predict needs before they are spoken. Have water ready when Dom is thirsty. Offer a blanket before they're cold." },
      { dayNumber: 9, title: "Day 9: Guest Preparation", objectives: "Prepare the home as if important guests are arriving. Every detail from fresh flowers to spotless bathrooms." },
      { dayNumber: 10, title: "Day 10: Personal Attendance", objectives: "Practice drawing baths, laying out clothes, preparing toiletries. Be a perfect valet for the entire evening." },
      { dayNumber: 11, title: "Day 11: Errand Running", objectives: "Handle all errands efficiently. Grocery shop from a list with zero forgotten items. Return with exact change." },
      { dayNumber: 12, title: "Day 12: Entertaining", objectives: "Serve drinks and appetizers to Dom and guests. Practice tray service, refills without being asked, and discreet clearing." },
      { dayNumber: 13, title: "Day 13: Full Day Service", objectives: "Complete an entire day of service from morning wake-up routine through evening wind-down. No reminders needed." },
      { dayNumber: 14, title: "Day 14: Service Reflection", objectives: "Review all 13 days. Identify strongest and weakest areas. Write a commitment to maintaining your highest standards." },
    ],
  },
  {
    title: "Mental Discipline Program",
    description: "10-day intensive to build mental fortitude, focus, and emotional regulation.",
    durationDays: 10,
    category: "discipline",
    days: [
      { dayNumber: 1, title: "Day 1: Breath Control", objectives: "Practice box breathing 5 times today: 4 seconds in, 4 hold, 4 out, 4 hold. 10 cycles each session." },
      { dayNumber: 2, title: "Day 2: Impulse Awareness", objectives: "Track every impulse to speak out of turn, act without permission, or break protocol. Write each one down." },
      { dayNumber: 3, title: "Day 3: Delayed Gratification", objectives: "Choose three pleasures you would normally indulge immediately. Delay each by at least 1 hour." },
      { dayNumber: 4, title: "Day 4: Focus Training", objectives: "Complete a single task for 30 minutes without distraction. No phone, no music, no breaks. Pure focus." },
      { dayNumber: 5, title: "Day 5: Emotional Naming", objectives: "Whenever you feel a strong emotion, stop and name it precisely. Write: 'I feel [emotion] because [reason].'" },
      { dayNumber: 6, title: "Day 6: Discomfort Tolerance", objectives: "Deliberately sit with mild discomfort 3 times today — cold water, kneeling on hard surface, holding a stretch." },
      { dayNumber: 7, title: "Day 7: Silence Practice", objectives: "Observe 2 hours of voluntary silence. No speaking, no texting friends. Only essential Dom communication." },
      { dayNumber: 8, title: "Day 8: Gratitude Under Stress", objectives: "When something frustrating happens, immediately find and write down 3 things to be grateful for." },
      { dayNumber: 9, title: "Day 9: Perfect Execution", objectives: "Choose 5 routine tasks. Execute each with absolute perfection — no shortcuts, no 'good enough.'" },
      { dayNumber: 10, title: "Day 10: Integration Test", objectives: "Apply all 9 previous disciplines simultaneously throughout the day. Journal your experience that night." },
    ],
  },
  {
    title: "Endurance & Resilience Builder",
    description: "7-day program to progressively build physical and mental endurance.",
    durationDays: 7,
    category: "endurance",
    days: [
      { dayNumber: 1, title: "Day 1: Baseline", objectives: "Establish baselines: max kneeling time, plank hold, wall sit, and stress position. Record all numbers." },
      { dayNumber: 2, title: "Day 2: +10%", objectives: "Beat each baseline by 10%. Focus on breathing through discomfort. No giving up early." },
      { dayNumber: 3, title: "Day 3: Mental Layer", objectives: "Repeat Day 2 holds but add a mental task — count backwards from 100, recite protocols during holds." },
      { dayNumber: 4, title: "Day 4: Recovery & Stretching", objectives: "Active recovery day. Deep stretching session, foam rolling, and a 20-minute yoga flow. Flexibility matters." },
      { dayNumber: 5, title: "Day 5: +20%", objectives: "Beat original baselines by 20%. Your body has adapted — push through the mental barrier." },
      { dayNumber: 6, title: "Day 6: Combo Challenge", objectives: "Chain all exercises back-to-back with only 30-second rests between. Total endurance test." },
      { dayNumber: 7, title: "Day 7: Final Test", objectives: "Attempt to double your Day 1 baselines. Record finals. Reflect on growth and submit results for review." },
    ],
  },
  {
    title: "Deepening Submission",
    description: "A 14-day program to deepen trust, surrender, and connection with your partner.",
    durationDays: 14,
    category: "mindset",
    days: [
      { dayNumber: 1, title: "Day 1: Trust Building", objectives: "Practice a trust exercise — close your eyes and let your partner guide you through the home. Reflect on feelings." },
      { dayNumber: 2, title: "Day 2: Vulnerability", objectives: "Share one thing you've never told your partner. Practice being seen without armor." },
      { dayNumber: 3, title: "Day 3: Surrender", objectives: "Let your partner make every decision today — meals, schedule, outfit. Notice your urge to control." },
      { dayNumber: 4, title: "Day 4: Gratitude", objectives: "Write a detailed letter of gratitude to your Dom. Include specific moments that deepened your bond." },
      { dayNumber: 5, title: "Day 5: Active Service", objectives: "Anticipate and fulfill 5 needs before they are expressed. The highest form of service is invisible service." },
      { dayNumber: 6, title: "Day 6: Devotion Expression", objectives: "Create something for your Dom — a poem, a drawing, a prepared experience. Put your heart into it." },
      { dayNumber: 7, title: "Day 7: Endurance of Will", objectives: "Accept a challenge that pushes your limits. Focus on doing it for your Dom, not yourself." },
      { dayNumber: 8, title: "Day 8: Communication", objectives: "Have an honest conversation about your dynamic. What works, what needs work, what you desire more of." },
      { dayNumber: 9, title: "Day 9: Anticipation", objectives: "Practice reading your partner's mood and body language. Respond to unspoken needs all day." },
      { dayNumber: 10, title: "Day 10: Ritual Creation", objectives: "Design a new daily ritual together. Something meaningful that reinforces your connection." },
      { dayNumber: 11, title: "Day 11: Discipline Acceptance", objectives: "Accept correction gracefully today. No defensiveness, no excuses. Pure receptivity." },
      { dayNumber: 12, title: "Day 12: Connection", objectives: "Spend 30 minutes in physical contact without screens or distractions. Just presence." },
      { dayNumber: 13, title: "Day 13: Reflection", objectives: "Review the past 12 days. Write about how your submission has deepened. What surprised you?" },
      { dayNumber: 14, title: "Day 14: Commitment Renewal", objectives: "Formally renew your commitment to your dynamic. Kneel and speak your dedication aloud." },
    ],
  },
  {
    title: "Complete Protocol Training",
    description: "A comprehensive 30-day protocol covering all aspects of structured submission.",
    durationDays: 30,
    category: "advanced",
    days: Array.from({ length: 30 }, (_, i) => {
      const themes = [
        "Introduction & Intention Setting", "Proper Address & Titles", "Standing Positions & Posture",
        "Kneeling Forms & Transitions", "Greeting Protocols", "Dismissal & Exit Protocols",
        "Verbal Response Patterns", "Eye Contact Rules", "Walking & Movement Protocol",
        "Clothing & Presentation Standards", "Morning Service Routine", "Evening Service Routine",
        "Meal Preparation & Service", "Drink Service Protocol", "Personal Attendance & Grooming",
        "Cleaning to Inspection Standard", "Anticipatory Service Skills", "Communication Under Stress",
        "Punishment Acceptance Protocol", "Reward & Gratitude Protocol", "Guest Behavior Standards",
        "Public vs Private Protocols", "Travel & Outside Protocols", "Digital Communication Standards",
        "Conflict Resolution Protocol", "Safe Word & Limits Review", "Scene Preparation & Cleanup",
        "Aftercare Responsibilities", "Full Protocol Integration Day", "Graduation & Commitment Ceremony",
      ];
      return {
        dayNumber: i + 1,
        title: `Day ${i + 1}: ${themes[i]}`,
        objectives: `Master the protocol for ${themes[i].toLowerCase()}. Practice throughout the day and journal your experience that evening.`,
      };
    }),
  },
  {
    title: "Intimacy & Sensuality Program",
    description: "7-day program to deepen physical intimacy, body awareness, and sensual connection.",
    durationDays: 7,
    category: "intimacy",
    days: [
      { dayNumber: 1, title: "Day 1: Body Awareness", objectives: "Spend 20 minutes exploring your own body with curiosity, not judgment. Notice what feels good, sensitive, neutral." },
      { dayNumber: 2, title: "Day 2: Sensory Mapping", objectives: "Have your partner touch you with different textures — silk, leather, ice, warmth. Map your responses together." },
      { dayNumber: 3, title: "Day 3: Eye Gazing", objectives: "Sit facing your partner. Maintain eye contact for 5 minutes without speaking. Breathe together." },
      { dayNumber: 4, title: "Day 4: Massage Exchange", objectives: "Give and receive a 30-minute full body massage. Focus on connection, not performance." },
      { dayNumber: 5, title: "Day 5: Vulnerability Practice", objectives: "Share your deepest desire that you haven't expressed. Listen to your partner's without judgment." },
      { dayNumber: 6, title: "Day 6: Slow Session", objectives: "Everything at half speed today. Every touch, every kiss, every word — deliberate and savored." },
      { dayNumber: 7, title: "Day 7: Integration", objectives: "Combine all previous days' learnings into one connected evening together. No rushing, no agenda." },
    ],
  },
  {
    title: "Obedience Intensive",
    description: "5-day rapid obedience training with escalating difficulty and structured drills.",
    durationDays: 5,
    category: "obedience",
    days: [
      { dayNumber: 1, title: "Day 1: Response Time", objectives: "All day: respond to every command within 3 seconds. Track failures. Target: under 5 failures for the day." },
      { dayNumber: 2, title: "Day 2: Precision", objectives: "Every task must be done exactly as instructed. No interpretation, no shortcuts. If unclear, ask before acting." },
      { dayNumber: 3, title: "Day 3: Endurance Obedience", objectives: "Maintain obedient posture and behavior for 8 continuous hours. No breaks in protocol, even when tired." },
      { dayNumber: 4, title: "Day 4: Multi-Task Compliance", objectives: "Follow 3 standing orders simultaneously while completing new tasks as they are given. No dropping protocols." },
      { dayNumber: 5, title: "Day 5: The Final Test", objectives: "Your Dom will test you with rapid commands, trick questions, and challenges. Apply everything you've learned." },
    ],
  },
];