export interface PrebuiltObedienceTrial {
  title: string;
  category: string;
  timeLimitSeconds: number;
  steps: string[];
  difficulty: number;
}

export const OBEDIENCE_TRIAL_CATEGORIES = [
  "Protocol",
  "Service",
  "Discipline",
  "Posture",
  "Verbal",
  "Endurance",
  "Precision",
  "Devotion",
] as const;

export const PREBUILT_OBEDIENCE_TRIALS: PrebuiltObedienceTrial[] = [
  { title: "Silent Service Trial", category: "Service", timeLimitSeconds: 900, difficulty: 3, steps: ["Kneel at assigned position without prompting", "Serve water on a tray without spilling", "Clear the table silently", "Return to kneeling position and await dismissal"] },
  { title: "Posture Perfection", category: "Posture", timeLimitSeconds: 600, difficulty: 4, steps: ["Stand at attention with hands behind back for 2 minutes", "Walk heel-to-toe across the room balancing a book on head", "Kneel with back straight, chin up for 3 minutes", "Transition smoothly between standing and kneeling 5 times"] },
  { title: "Verbal Obedience Drill", category: "Verbal", timeLimitSeconds: 480, difficulty: 3, steps: ["Repeat back every instruction word-for-word before executing", "Address with proper title in every sentence", "Respond 'Yes Sir/Ma'am' to 10 rapid-fire commands", "Recite the 5 daily rules from memory without error"] },
  { title: "Speed Protocol", category: "Protocol", timeLimitSeconds: 300, difficulty: 5, steps: ["Present collar within 30 seconds of command", "Change into assigned outfit within 2 minutes", "Set the table for two in under 3 minutes", "Kneel in presentation position within 5 seconds of signal"] },
  { title: "Blindfolded Obedience", category: "Discipline", timeLimitSeconds: 600, difficulty: 6, steps: ["Put on blindfold and stand still for 60 seconds", "Follow verbal directions to walk to 3 specific spots", "Retrieve a named object by touch alone", "Kneel and present the object correctly", "Remove blindfold only when instructed"] },
  { title: "Morning Inspection Readiness", category: "Protocol", timeLimitSeconds: 480, difficulty: 3, steps: ["Make bed with hospital corners", "Lay out today's outfit for approval", "Prepare morning beverage exactly to specification", "Stand at attention for inspection"] },
  { title: "Patience Under Pressure", category: "Endurance", timeLimitSeconds: 900, difficulty: 7, steps: ["Hold stress position (arms extended) for 90 seconds", "Maintain eye contact without blinking for 30 seconds", "Kneel on hard floor without shifting for 3 minutes", "Remain perfectly still during 2 minutes of teasing", "Thank your Dom for each challenge completed"] },
  { title: "Precision Task Chain", category: "Precision", timeLimitSeconds: 600, difficulty: 5, steps: ["Fold 5 items of clothing to exact specifications", "Pour liquid to an exact marked line 3 times", "Arrange objects in the exact order shown for 5 seconds", "Write a sentence in perfect handwriting within 60 seconds", "Tie a specific knot correctly on first attempt"] },
  { title: "Devotion Declaration", category: "Devotion", timeLimitSeconds: 480, difficulty: 2, steps: ["Write a 3-sentence devotion statement", "Read it aloud while kneeling", "Kiss your Dom's hand or feet", "Recite your favorite rule and explain why it matters"] },
  { title: "Multi-Task Service", category: "Service", timeLimitSeconds: 720, difficulty: 6, steps: ["Answer the door and greet properly", "Take and hang coat within 10 seconds", "Offer a drink on a tray while kneeling", "Remove shoes and replace with slippers", "Ask about their day and listen without interrupting", "Prepare a snack and present it beautifully"] },
  { title: "The Gauntlet", category: "Discipline", timeLimitSeconds: 1200, difficulty: 8, steps: ["Wall sit for 90 seconds", "20 push-ups with proper form", "Kneel and recite all active protocols", "Hold ice cube in each hand for 60 seconds", "Stand at attention for 3 minutes without moving", "Write 'I will obey' 20 times legibly in under 3 minutes", "Final kneeling presentation and gratitude speech"] },
  { title: "Rapid Response Drill", category: "Protocol", timeLimitSeconds: 300, difficulty: 6, steps: ["Respond to 'kneel' command in under 2 seconds", "Respond to 'stand' command in under 2 seconds", "Respond to 'present' command in under 3 seconds", "Respond to 'eyes down' command instantly", "Respond to 'fetch [object]' and return in under 30 seconds", "Complete 3 commands given in rapid succession"] },
  { title: "Eloquent Submission", category: "Verbal", timeLimitSeconds: 600, difficulty: 4, steps: ["Explain in 3 sentences why you submit", "List 5 qualities you admire in your Dom", "Apologize for a recent shortcoming sincerely", "Make a specific promise for improvement", "Thank your Dom for 3 specific things from today"] },
  { title: "Domestic Perfection Trial", category: "Service", timeLimitSeconds: 900, difficulty: 5, steps: ["Clean and organize one surface to inspection standards", "Prepare a simple meal or snack perfectly plated", "Set ambient lighting and music to Dom's preferences", "Draw a bath at exact preferred temperature", "Present yourself for final inspection"] },
  { title: "The Endurance Kneel", category: "Endurance", timeLimitSeconds: 900, difficulty: 7, steps: ["Kneel on hard surface with hands on thighs", "Maintain position for 5 minutes without shifting", "Respond verbally to 5 questions while maintaining posture", "Hold a small weight in each outstretched hand for 60 seconds", "Return to perfect kneeling position and hold for 2 more minutes"] },
  { title: "Trust Fall Protocol", category: "Devotion", timeLimitSeconds: 600, difficulty: 5, steps: ["Close eyes and trust Dom to guide you across the room", "Allow Dom to position your body without resistance", "Accept 3 unknown sensations without flinching", "Maintain relaxed breathing throughout", "Express gratitude for each moment of trust"] },
  { title: "The Perfectionist", category: "Precision", timeLimitSeconds: 720, difficulty: 8, steps: ["Set a formal place setting with exact utensil spacing", "Iron a shirt to crease-free perfection", "Write your Dom's name in calligraphy 3 times", "Arrange flowers in a vase symmetrically", "Polish shoes to a mirror finish", "Present all completed items for scoring"] },
  { title: "Protocol Recitation", category: "Protocol", timeLimitSeconds: 420, difficulty: 4, steps: ["Recite all morning protocols in order", "Recite all evening protocols in order", "Name every active standing order", "Explain the consequence for each rule violation", "Demonstrate the proper greeting sequence"] },
  { title: "Stress Inoculation", category: "Endurance", timeLimitSeconds: 600, difficulty: 9, steps: ["Hold plank position for 60 seconds", "Immediately transition to wall sit for 60 seconds", "Stand on one foot with eyes closed for 30 seconds", "Hold arms straight out with books for 45 seconds", "Kneel and give a coherent gratitude speech despite fatigue"] },
  { title: "The Serving Sequence", category: "Service", timeLimitSeconds: 600, difficulty: 4, steps: ["Approach with tray held at chest height", "Kneel smoothly without spilling", "Present item with both hands, eyes lowered", "Wait for acknowledgment before releasing", "Rise gracefully and retreat 3 steps backward", "Return to standing position at assigned post"] },
  { title: "Blacksite Compliance Trial", category: "Discipline", timeLimitSeconds: 1500, difficulty: 10, steps: ["Maintain silence and eye discipline for first 3 minutes", "Execute 15 rapid commands with sub-3-second compliance", "Hold kneeling posture for 6 minutes while reciting active rules", "Complete service task chain without correction", "Accept consequence drill without argument", "Deliver formal accountability statement and request release"] },
];