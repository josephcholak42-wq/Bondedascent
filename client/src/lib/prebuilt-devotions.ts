export interface PrebuiltDevotion {
  name: string;
  category: string;
  type: string;
}

export const DEVOTION_CATEGORIES = [
  "Acts of Service",
  "Written",
  "Physical",
  "Creative",
  "Sacrifice",
  "Praise",
  "Ritual",
  "Gift",
] as const;

export const PREBUILT_DEVOTIONS: PrebuiltDevotion[] = [
  // Acts of Service
  { name: "Prepare their favorite meal without being asked", category: "Acts of Service", type: "gratitude" },
  { name: "Draw a warm bath with candles and oils", category: "Acts of Service", type: "gratitude" },
  { name: "Lay out their clothes for the next day", category: "Acts of Service", type: "gratitude" },
  { name: "Polish their shoes until they shine", category: "Acts of Service", type: "gratitude" },
  { name: "Prepare their coffee exactly how they like it every morning", category: "Acts of Service", type: "gratitude" },
  { name: "Iron and hang all their clothes for the week", category: "Acts of Service", type: "gratitude" },
  { name: "Deep clean the entire bathroom as an offering", category: "Acts of Service", type: "gratitude" },
  { name: "Wash and detail their car inside and out", category: "Acts of Service", type: "gratitude" },
  { name: "Pack their lunch with a hidden note inside", category: "Acts of Service", type: "gratitude" },
  { name: "Run their errands without being told", category: "Acts of Service", type: "gratitude" },

  // Written
  { name: "Write a love letter expressing your devotion", category: "Written", type: "affirmation" },
  { name: "Compose a poem about what they mean to you", category: "Written", type: "affirmation" },
  { name: "Journal about your favorite moment together this week", category: "Written", type: "affirmation" },
  { name: "Write 10 reasons why you're grateful for them", category: "Written", type: "gratitude" },
  { name: "Create a list of promises you make to them", category: "Written", type: "affirmation" },
  { name: "Write about how they've changed you for the better", category: "Written", type: "affirmation" },
  { name: "Compose a morning affirmation dedicated to them", category: "Written", type: "affirmation" },
  { name: "Write a confession of your deepest feelings", category: "Written", type: "affirmation" },
  { name: "Create a timeline of your favorite memories together", category: "Written", type: "gratitude" },
  { name: "Write a letter from your future self thanking them", category: "Written", type: "affirmation" },

  // Physical
  { name: "Kneel and kiss their feet when they come home", category: "Physical", type: "prayer" },
  { name: "Give them an unrequested back massage", category: "Physical", type: "gratitude" },
  { name: "Brush their hair gently for 20 minutes", category: "Physical", type: "gratitude" },
  { name: "Wash their feet with warm water and dry them", category: "Physical", type: "prayer" },
  { name: "Hold their hand for an entire walk without letting go", category: "Physical", type: "affirmation" },
  { name: "Trace affirmations on their skin with your fingertip", category: "Physical", type: "affirmation" },
  { name: "Warm their towel before they shower", category: "Physical", type: "gratitude" },
  { name: "Carry them to bed and tuck them in", category: "Physical", type: "gratitude" },
  { name: "Kiss every scar or mark on their body with reverence", category: "Physical", type: "prayer" },
  { name: "Maintain eye contact for 5 minutes while holding hands", category: "Physical", type: "mantra" },

  // Creative
  { name: "Paint or draw a portrait of them", category: "Creative", type: "affirmation" },
  { name: "Create a playlist of songs that remind you of them", category: "Creative", type: "affirmation" },
  { name: "Make a scrapbook of your relationship", category: "Creative", type: "gratitude" },
  { name: "Write and perform a song for them", category: "Creative", type: "affirmation" },
  { name: "Design a custom collar charm or piece of jewelry", category: "Creative", type: "affirmation" },
  { name: "Create a photo collage of your favorite moments", category: "Creative", type: "gratitude" },
  { name: "Record a voice message listing things you adore about them", category: "Creative", type: "affirmation" },
  { name: "Choreograph a dance that represents your dynamic", category: "Creative", type: "affirmation" },
  { name: "Create a custom piece of art for their space", category: "Creative", type: "affirmation" },
  { name: "Make a video montage of your relationship highlights", category: "Creative", type: "gratitude" },

  // Sacrifice
  { name: "Give up your favorite comfort for a week in their honor", category: "Sacrifice", type: "prayer" },
  { name: "Wake up an hour early to prepare everything for them", category: "Sacrifice", type: "gratitude" },
  { name: "Skip a social event to spend quality time with them", category: "Sacrifice", type: "gratitude" },
  { name: "Give up screen time for an entire weekend", category: "Sacrifice", type: "prayer" },
  { name: "Fast for a day as a show of commitment", category: "Sacrifice", type: "prayer" },
  { name: "Donate to a cause they care about in their name", category: "Sacrifice", type: "gratitude" },
  { name: "Give them the last piece of your favorite food", category: "Sacrifice", type: "gratitude" },
  { name: "Take on their least favorite chore for a month", category: "Sacrifice", type: "gratitude" },
  { name: "Sleep on the floor beside their bed as a devotion", category: "Sacrifice", type: "prayer" },
  { name: "Give up a personal hobby day to fulfill their wish", category: "Sacrifice", type: "gratitude" },

  // Praise
  { name: "Recite 5 things you admire about them each morning", category: "Praise", type: "mantra" },
  { name: "Publicly acknowledge their importance in your life", category: "Praise", type: "affirmation" },
  { name: "Tell them specifically how they make you a better person", category: "Praise", type: "affirmation" },
  { name: "Express gratitude for a specific rule or boundary they set", category: "Praise", type: "gratitude" },
  { name: "Acknowledge their strength and leadership out loud", category: "Praise", type: "affirmation" },
  { name: "Thank them for every correction and guidance", category: "Praise", type: "gratitude" },
  { name: "Compliment them in detail — be specific about what you love", category: "Praise", type: "affirmation" },
  { name: "Tell them how safe they make you feel", category: "Praise", type: "affirmation" },
  { name: "Express how their dominance brings you peace", category: "Praise", type: "affirmation" },
  { name: "Verbally reaffirm your submission and commitment", category: "Praise", type: "mantra" },

  // Ritual
  { name: "Morning kneeling — 5 minutes of silent devotion", category: "Ritual", type: "prayer" },
  { name: "Light a candle and meditate on your connection", category: "Ritual", type: "prayer" },
  { name: "Recite your personal mantra of submission 10 times", category: "Ritual", type: "mantra" },
  { name: "Perform a collar ceremony — ask to be re-collared", category: "Ritual", type: "prayer" },
  { name: "Evening reflection — journal what you're grateful for today", category: "Ritual", type: "gratitude" },
  { name: "Sunrise devotion — greet the day with thoughts of them", category: "Ritual", type: "prayer" },
  { name: "Weekly renewal — restate your vows and promises", category: "Ritual", type: "mantra" },
  { name: "Present yourself in inspection position each morning", category: "Ritual", type: "prayer" },
  { name: "Kiss their collar before putting it on each day", category: "Ritual", type: "prayer" },
  { name: "Bedtime prayer — thank them for the day's guidance", category: "Ritual", type: "prayer" },

  // Gift
  { name: "Surprise them with fresh flowers for no reason", category: "Gift", type: "gratitude" },
  { name: "Buy them their favorite treat on the way home", category: "Gift", type: "gratitude" },
  { name: "Gift them a book you think they'd love", category: "Gift", type: "gratitude" },
  { name: "Create a coupon book of services you'll perform", category: "Gift", type: "gratitude" },
  { name: "Find a meaningful trinket that represents your bond", category: "Gift", type: "affirmation" },
  { name: "Order their favorite meal as a surprise delivery", category: "Gift", type: "gratitude" },
  { name: "Gift them new accessories for your dynamic", category: "Gift", type: "affirmation" },
  { name: "Frame a photo of a special moment together", category: "Gift", type: "gratitude" },
  { name: "Buy supplies for their favorite hobby", category: "Gift", type: "gratitude" },
  { name: "Create a custom gift that shows deep knowledge of their preferences", category: "Gift", type: "gratitude" },
];