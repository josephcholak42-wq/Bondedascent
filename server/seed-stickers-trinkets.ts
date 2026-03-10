import { db } from "./db";
import { adminStickers, trinkets } from "@shared/schema";

const STICKERS = [
  // === OBEDIENCE & SUBMISSION (20) ===
  { name: "Perfect Obedience", emoji: "🎖️", category: "obedience", rarity: "rare", description: "Flawless compliance without hesitation" },
  { name: "Eager to Please", emoji: "🐕", category: "obedience", rarity: "common", description: "Always ready and willing" },
  { name: "Yes Sir", emoji: "🫡", category: "obedience", rarity: "common", description: "Prompt acknowledgment of commands" },
  { name: "Silent Obedience", emoji: "🤐", category: "obedience", rarity: "uncommon", description: "Followed orders without a word" },
  { name: "First-Time Compliance", emoji: "☝️", category: "obedience", rarity: "uncommon", description: "Obeyed on the first command" },
  { name: "Good Pet", emoji: "🐾", category: "obedience", rarity: "common", description: "Behaved like a well-trained pet" },
  { name: "Instant Response", emoji: "⚡", category: "obedience", rarity: "rare", description: "Responded within seconds" },
  { name: "Devoted Servant", emoji: "🧎", category: "obedience", rarity: "uncommon", description: "Showed unwavering devotion" },
  { name: "Submissive Grace", emoji: "🦢", category: "obedience", rarity: "rare", description: "Beautiful submission under pressure" },
  { name: "Eyes Down", emoji: "👀", category: "obedience", rarity: "common", description: "Maintained proper posture" },
  { name: "Kneeling Star", emoji: "⭐", category: "obedience", rarity: "uncommon", description: "Exceptional kneeling protocol" },
  { name: "Collar Worthy", emoji: "⛓️", category: "obedience", rarity: "epic", description: "Proved worthy of collaring" },
  { name: "Trust Fall", emoji: "🫶", category: "obedience", rarity: "uncommon", description: "Complete trust in Dom's guidance" },
  { name: "Protocol Perfect", emoji: "📋", category: "obedience", rarity: "rare", description: "Every protocol followed to the letter" },
  { name: "Anticipation", emoji: "🔮", category: "obedience", rarity: "uncommon", description: "Anticipated Dom's needs before asked" },
  { name: "Graceful Yield", emoji: "🌊", category: "obedience", rarity: "common", description: "Yielded beautifully" },
  { name: "Unquestioning", emoji: "🔒", category: "obedience", rarity: "rare", description: "Zero pushback, pure trust" },
  { name: "Worship Mode", emoji: "🛐", category: "obedience", rarity: "epic", description: "Total worship and adoration" },
  { name: "Leash Ready", emoji: "🔗", category: "obedience", rarity: "common", description: "Always ready to be led" },
  { name: "Surrender", emoji: "🏳️", category: "obedience", rarity: "legendary", description: "Complete and total surrender" },

  // === DISCIPLINE & PUNISHMENT (20) ===
  { name: "Took It Well", emoji: "💪", category: "discipline", rarity: "common", description: "Handled punishment with strength" },
  { name: "No Complaints", emoji: "🤫", category: "discipline", rarity: "uncommon", description: "Accepted punishment silently" },
  { name: "Lesson Learned", emoji: "📖", category: "discipline", rarity: "common", description: "Showed they learned from correction" },
  { name: "Punishment Complete", emoji: "✅", category: "discipline", rarity: "common", description: "Fully completed assigned punishment" },
  { name: "Corner Time Champion", emoji: "🧱", category: "discipline", rarity: "uncommon", description: "Stood in the corner without fidgeting" },
  { name: "Red Badge", emoji: "🔴", category: "discipline", rarity: "rare", description: "Wore marks with pride" },
  { name: "Counting Stars", emoji: "🔢", category: "discipline", rarity: "uncommon", description: "Counted every strike accurately" },
  { name: "Thank You Sir", emoji: "🙏", category: "discipline", rarity: "rare", description: "Thanked Dom for punishment" },
  { name: "Endured It", emoji: "🏔️", category: "discipline", rarity: "rare", description: "Withstood a harsh punishment" },
  { name: "Improved Behavior", emoji: "📈", category: "discipline", rarity: "uncommon", description: "Visible improvement after correction" },
  { name: "Strict Compliance", emoji: "📏", category: "discipline", rarity: "common", description: "Met strict standards" },
  { name: "Accepted Consequences", emoji: "⚖️", category: "discipline", rarity: "uncommon", description: "Took responsibility for actions" },
  { name: "Tears of Growth", emoji: "💧", category: "discipline", rarity: "rare", description: "Emotional breakthrough during discipline" },
  { name: "Marked", emoji: "🔥", category: "discipline", rarity: "epic", description: "Wears Dom's marks proudly" },
  { name: "Steady Under Fire", emoji: "🎯", category: "discipline", rarity: "rare", description: "Remained composed during punishment" },
  { name: "Rule Follower", emoji: "📜", category: "discipline", rarity: "common", description: "Respects all established rules" },
  { name: "Corrected Path", emoji: "🛤️", category: "discipline", rarity: "uncommon", description: "Got back on track after discipline" },
  { name: "Iron Will", emoji: "⚔️", category: "discipline", rarity: "epic", description: "Unbreakable spirit through punishment" },
  { name: "Reform Complete", emoji: "🦋", category: "discipline", rarity: "rare", description: "Fully reformed behavior" },
  { name: "Absolved", emoji: "✨", category: "discipline", rarity: "legendary", description: "Slate wiped clean through penance" },

  // === REWARDS & PRAISE (20) ===
  { name: "Gold Star", emoji: "⭐", category: "praise", rarity: "common", description: "General excellence" },
  { name: "Dom's Favorite", emoji: "👑", category: "praise", rarity: "epic", description: "Currently the favorite" },
  { name: "Extra Treat", emoji: "🍬", category: "praise", rarity: "common", description: "Earned a special treat" },
  { name: "Head Pats", emoji: "🤚", category: "praise", rarity: "common", description: "Gentle praise and affection" },
  { name: "Good Girl/Boy", emoji: "💝", category: "praise", rarity: "uncommon", description: "The highest verbal praise" },
  { name: "Pleasure Earned", emoji: "🌹", category: "praise", rarity: "rare", description: "Earned pleasure through service" },
  { name: "Freedom Pass", emoji: "🎫", category: "praise", rarity: "rare", description: "Temporary freedom as reward" },
  { name: "Spoiled", emoji: "💎", category: "praise", rarity: "uncommon", description: "Lavished with attention" },
  { name: "Pride of Dom", emoji: "🏆", category: "praise", rarity: "epic", description: "Dom is truly proud" },
  { name: "Sweet Reward", emoji: "🍯", category: "praise", rarity: "common", description: "A sweet reward for good behavior" },
  { name: "Glowing Review", emoji: "🌟", category: "praise", rarity: "uncommon", description: "Outstanding performance review" },
  { name: "Pampered", emoji: "🧖", category: "praise", rarity: "uncommon", description: "Received special pampering" },
  { name: "Trust Earned", emoji: "🔑", category: "praise", rarity: "rare", description: "Earned deeper trust" },
  { name: "Cherished", emoji: "💕", category: "praise", rarity: "rare", description: "Deeply valued and cherished" },
  { name: "A+ Service", emoji: "💯", category: "praise", rarity: "uncommon", description: "Top-tier service delivery" },
  { name: "Warm Embrace", emoji: "🤗", category: "praise", rarity: "common", description: "Earned a warm embrace" },
  { name: "Crown Jewel", emoji: "👸", category: "praise", rarity: "legendary", description: "The crown jewel of the dynamic" },
  { name: "Treasure", emoji: "🪙", category: "praise", rarity: "rare", description: "A true treasure" },
  { name: "Adored", emoji: "😍", category: "praise", rarity: "uncommon", description: "Deeply adored" },
  { name: "Devotion Flame", emoji: "🔥", category: "praise", rarity: "epic", description: "Burning devotion recognized" },

  // === TASKS & ACHIEVEMENTS (20) ===
  { name: "Task Crusher", emoji: "💥", category: "tasks", rarity: "uncommon", description: "Completed multiple tasks rapidly" },
  { name: "Streak Master", emoji: "🔥", category: "tasks", rarity: "rare", description: "Maintained an impressive streak" },
  { name: "Early Bird", emoji: "🐦", category: "tasks", rarity: "common", description: "Completed task before deadline" },
  { name: "Overachiever", emoji: "🚀", category: "tasks", rarity: "rare", description: "Exceeded expectations" },
  { name: "Consistent", emoji: "📊", category: "tasks", rarity: "uncommon", description: "Reliably consistent performance" },
  { name: "Detail Oriented", emoji: "🔍", category: "tasks", rarity: "uncommon", description: "Attention to every detail" },
  { name: "Speed Demon", emoji: "⏱️", category: "tasks", rarity: "rare", description: "Lightning-fast completion" },
  { name: "Above & Beyond", emoji: "🌙", category: "tasks", rarity: "epic", description: "Went above and beyond" },
  { name: "Perfect Week", emoji: "📅", category: "tasks", rarity: "rare", description: "Every task done for a full week" },
  { name: "Marathon Runner", emoji: "🏃", category: "tasks", rarity: "uncommon", description: "Long endurance task completion" },
  { name: "No Excuses", emoji: "🚫", category: "tasks", rarity: "uncommon", description: "Zero excuses, pure action" },
  { name: "Initiative", emoji: "💡", category: "tasks", rarity: "rare", description: "Took initiative without being told" },
  { name: "Precision", emoji: "🎯", category: "tasks", rarity: "uncommon", description: "Executed with surgical precision" },
  { name: "Tireless", emoji: "♾️", category: "tasks", rarity: "rare", description: "Never showed fatigue" },
  { name: "Multi-Tasker", emoji: "🤹", category: "tasks", rarity: "uncommon", description: "Handled multiple assignments" },
  { name: "Check Complete", emoji: "☑️", category: "tasks", rarity: "common", description: "Another task checked off" },
  { name: "Mission Accomplished", emoji: "🎖️", category: "tasks", rarity: "rare", description: "Critical mission completed" },
  { name: "Zero Errors", emoji: "✅", category: "tasks", rarity: "epic", description: "Flawless execution" },
  { name: "Homework Done", emoji: "📝", category: "tasks", rarity: "common", description: "Completed assigned homework" },
  { name: "Elite Performer", emoji: "🏅", category: "tasks", rarity: "legendary", description: "Top 1% performance" },

  // === INTIMACY & CONNECTION (15) ===
  { name: "Deep Connection", emoji: "💫", category: "intimacy", rarity: "rare", description: "Shared a profound moment" },
  { name: "Aftercare Hero", emoji: "🛁", category: "intimacy", rarity: "uncommon", description: "Excellent aftercare participation" },
  { name: "Vulnerability", emoji: "🥀", category: "intimacy", rarity: "rare", description: "Showed beautiful vulnerability" },
  { name: "Safe Space", emoji: "🏠", category: "intimacy", rarity: "uncommon", description: "Created a safe emotional space" },
  { name: "Pillow Talk", emoji: "🛏️", category: "intimacy", rarity: "common", description: "Meaningful intimate conversation" },
  { name: "Soul Bared", emoji: "💗", category: "intimacy", rarity: "epic", description: "Opened up completely" },
  { name: "Tender Moment", emoji: "🕯️", category: "intimacy", rarity: "uncommon", description: "Shared a tender moment" },
  { name: "Heart Open", emoji: "❤️‍🔥", category: "intimacy", rarity: "rare", description: "Heart fully open" },
  { name: "Bonded", emoji: "🔗", category: "intimacy", rarity: "epic", description: "Deepened the bond" },
  { name: "Emotional Check-In", emoji: "🫂", category: "intimacy", rarity: "common", description: "Good emotional communication" },
  { name: "Confession Made", emoji: "🕊️", category: "intimacy", rarity: "uncommon", description: "Made an honest confession" },
  { name: "Healing Touch", emoji: "🌿", category: "intimacy", rarity: "rare", description: "Provided healing comfort" },
  { name: "Soulmate Energy", emoji: "🌌", category: "intimacy", rarity: "legendary", description: "Pure soulmate connection" },
  { name: "Whispered Truth", emoji: "🤫", category: "intimacy", rarity: "uncommon", description: "Whispered a vulnerable truth" },
  { name: "Comfort Given", emoji: "🧸", category: "intimacy", rarity: "common", description: "Provided comfort when needed" },

  // === ENDURANCE & CHALLENGES (15) ===
  { name: "Pain Threshold", emoji: "🔥", category: "endurance", rarity: "rare", description: "Pushed pain boundaries" },
  { name: "Edge Walker", emoji: "🗡️", category: "endurance", rarity: "epic", description: "Walked the edge beautifully" },
  { name: "Stamina", emoji: "🦾", category: "endurance", rarity: "uncommon", description: "Impressive physical stamina" },
  { name: "Never Quit", emoji: "🥊", category: "endurance", rarity: "rare", description: "Refused to give up" },
  { name: "Iron Body", emoji: "🛡️", category: "endurance", rarity: "rare", description: "Physical resilience" },
  { name: "Mind Over Matter", emoji: "🧠", category: "endurance", rarity: "epic", description: "Mental strength conquered physical" },
  { name: "Breath Control", emoji: "🌬️", category: "endurance", rarity: "uncommon", description: "Maintained breathing under stress" },
  { name: "Stress Tested", emoji: "💎", category: "endurance", rarity: "rare", description: "Performed under extreme stress" },
  { name: "Pushed Limits", emoji: "📊", category: "endurance", rarity: "uncommon", description: "Extended personal limits" },
  { name: "Trial Survivor", emoji: "⚡", category: "endurance", rarity: "rare", description: "Survived a difficult trial" },
  { name: "Unbreakable", emoji: "🗿", category: "endurance", rarity: "legendary", description: "Absolutely unbreakable" },
  { name: "Endurance Run", emoji: "🏃‍♀️", category: "endurance", rarity: "uncommon", description: "Long endurance session" },
  { name: "Sweat & Tears", emoji: "💦", category: "endurance", rarity: "uncommon", description: "Gave everything physically" },
  { name: "Challenge Accepted", emoji: "🤝", category: "endurance", rarity: "common", description: "Bravely accepted a challenge" },
  { name: "Threshold Pushed", emoji: "📈", category: "endurance", rarity: "rare", description: "Personal threshold expanded" },

  // === RITUALS & DEVOTION (15) ===
  { name: "Morning Ritual", emoji: "🌅", category: "rituals", rarity: "common", description: "Completed morning ritual perfectly" },
  { name: "Evening Prayer", emoji: "🌙", category: "rituals", rarity: "common", description: "Perfect evening devotion" },
  { name: "Altar Devotee", emoji: "🛐", category: "rituals", rarity: "uncommon", description: "Faithful altar attendance" },
  { name: "Sacred Flame", emoji: "🕯️", category: "rituals", rarity: "rare", description: "Kept the sacred flame burning" },
  { name: "Ritual Master", emoji: "🎭", category: "rituals", rarity: "epic", description: "Mastered all assigned rituals" },
  { name: "Daily Devotion", emoji: "📿", category: "rituals", rarity: "uncommon", description: "Never missed daily devotion" },
  { name: "Sacred Space", emoji: "⛩️", category: "rituals", rarity: "uncommon", description: "Maintained sacred space" },
  { name: "Ceremony Complete", emoji: "🏵️", category: "rituals", rarity: "rare", description: "Completed a full ceremony" },
  { name: "Offering Made", emoji: "🎁", category: "rituals", rarity: "common", description: "Made a proper offering" },
  { name: "Blessed", emoji: "✨", category: "rituals", rarity: "rare", description: "Received Dom's blessing" },
  { name: "Consecrated", emoji: "🔱", category: "rituals", rarity: "epic", description: "Fully consecrated in the dynamic" },
  { name: "Faithful", emoji: "🕊️", category: "rituals", rarity: "uncommon", description: "Unwavering faithfulness" },
  { name: "Temple Guardian", emoji: "🏛️", category: "rituals", rarity: "rare", description: "Guarded the temple of trust" },
  { name: "Candle Keeper", emoji: "🕯️", category: "rituals", rarity: "common", description: "Maintained ritual candles" },
  { name: "Holy Devotion", emoji: "💒", category: "rituals", rarity: "legendary", description: "Absolute holy devotion" },

  // === ATTITUDE & BEHAVIOR (15) ===
  { name: "Positive Attitude", emoji: "😊", category: "attitude", rarity: "common", description: "Maintained great attitude" },
  { name: "Respectful", emoji: "🤝", category: "attitude", rarity: "common", description: "Showed proper respect" },
  { name: "Humble", emoji: "🙇", category: "attitude", rarity: "uncommon", description: "Displayed genuine humility" },
  { name: "Gracious", emoji: "🌺", category: "attitude", rarity: "uncommon", description: "Gracious in all interactions" },
  { name: "Self-Aware", emoji: "🪞", category: "attitude", rarity: "rare", description: "Impressive self-awareness" },
  { name: "Growth Mindset", emoji: "🌱", category: "attitude", rarity: "uncommon", description: "Open to learning and growing" },
  { name: "Patience", emoji: "⏳", category: "attitude", rarity: "rare", description: "Exceptional patience" },
  { name: "Composure", emoji: "🧘", category: "attitude", rarity: "uncommon", description: "Maintained composure under pressure" },
  { name: "Honest", emoji: "💎", category: "attitude", rarity: "uncommon", description: "Completely honest" },
  { name: "Transparent", emoji: "🔍", category: "attitude", rarity: "rare", description: "Full transparency" },
  { name: "No Bratting", emoji: "😇", category: "attitude", rarity: "common", description: "Zero bratty behavior" },
  { name: "Mature Response", emoji: "🎓", category: "attitude", rarity: "uncommon", description: "Mature handling of situation" },
  { name: "Emotional Control", emoji: "🎭", category: "attitude", rarity: "rare", description: "Excellent emotional regulation" },
  { name: "Noble Spirit", emoji: "🦁", category: "attitude", rarity: "epic", description: "Noble and dignified spirit" },
  { name: "Zen Master", emoji: "☯️", category: "attitude", rarity: "legendary", description: "Perfect inner peace" },

  // === SCENES & PLAY (15) ===
  { name: "Scene Stealer", emoji: "🎬", category: "scenes", rarity: "rare", description: "Stole the scene completely" },
  { name: "Safe Word Respected", emoji: "🛑", category: "scenes", rarity: "uncommon", description: "Used safe word appropriately" },
  { name: "In Character", emoji: "🎭", category: "scenes", rarity: "uncommon", description: "Stayed perfectly in character" },
  { name: "Electric Scene", emoji: "⚡", category: "scenes", rarity: "rare", description: "Scene had electric energy" },
  { name: "Perfect Scene", emoji: "🎯", category: "scenes", rarity: "epic", description: "Absolutely perfect scene" },
  { name: "Role Mastery", emoji: "👤", category: "scenes", rarity: "rare", description: "Complete mastery of assigned role" },
  { name: "Immersive", emoji: "🌀", category: "scenes", rarity: "uncommon", description: "Fully immersed in the scene" },
  { name: "Chemistry", emoji: "⚗️", category: "scenes", rarity: "rare", description: "Incredible chemistry" },
  { name: "Standing Ovation", emoji: "👏", category: "scenes", rarity: "epic", description: "Deserves a standing ovation" },
  { name: "Debut Success", emoji: "🎉", category: "scenes", rarity: "common", description: "First scene went great" },
  { name: "Encore", emoji: "🔁", category: "scenes", rarity: "uncommon", description: "Performance worth repeating" },
  { name: "Show Stopper", emoji: "🌟", category: "scenes", rarity: "rare", description: "Stopped the show" },
  { name: "Oscar Worthy", emoji: "🏆", category: "scenes", rarity: "legendary", description: "Award-winning performance" },
  { name: "Curtain Call", emoji: "🎪", category: "scenes", rarity: "uncommon", description: "Beautiful scene conclusion" },
  { name: "Director's Cut", emoji: "🎥", category: "scenes", rarity: "rare", description: "Dom's personal favorite scene" },

  // === COMMUNICATION (10) ===
  { name: "Open Book", emoji: "📖", category: "communication", rarity: "uncommon", description: "Communicated openly" },
  { name: "Check-In King/Queen", emoji: "✔️", category: "communication", rarity: "common", description: "Regular check-ins" },
  { name: "Honest Report", emoji: "📝", category: "communication", rarity: "common", description: "Gave an honest status report" },
  { name: "Boundary Expressed", emoji: "🚧", category: "communication", rarity: "uncommon", description: "Clearly expressed a boundary" },
  { name: "Feedback Given", emoji: "💬", category: "communication", rarity: "common", description: "Provided valuable feedback" },
  { name: "Active Listener", emoji: "👂", category: "communication", rarity: "uncommon", description: "Listened actively and attentively" },
  { name: "Clear Signal", emoji: "📡", category: "communication", rarity: "uncommon", description: "Clear communication" },
  { name: "Journal Entry", emoji: "📓", category: "communication", rarity: "common", description: "Submitted a thoughtful journal entry" },
  { name: "Confession Accepted", emoji: "🕊️", category: "communication", rarity: "rare", description: "Brave confession was accepted" },
  { name: "Words of Power", emoji: "🗣️", category: "communication", rarity: "rare", description: "Powerful and meaningful words" },

  // === SPECIAL & LEGENDARY (10) ===
  { name: "Ultimate Sub", emoji: "👑", category: "special", rarity: "legendary", description: "The ultimate submissive" },
  { name: "Soulbound", emoji: "🔮", category: "special", rarity: "legendary", description: "Souls bound together" },
  { name: "Eternal Devotion", emoji: "♾️", category: "special", rarity: "legendary", description: "Devotion that transcends time" },
  { name: "Blood Oath", emoji: "🩸", category: "special", rarity: "epic", description: "Bound by blood oath" },
  { name: "Phoenix Rising", emoji: "🔥", category: "special", rarity: "epic", description: "Rose from the ashes stronger" },
  { name: "Dark Star", emoji: "🌑", category: "special", rarity: "epic", description: "A dark and powerful star" },
  { name: "Midnight Mark", emoji: "🌙", category: "special", rarity: "rare", description: "Marked at the witching hour" },
  { name: "Crimson Bond", emoji: "❤️‍🔥", category: "special", rarity: "epic", description: "Bond sealed in crimson" },
  { name: "Shadow Walker", emoji: "🌑", category: "special", rarity: "rare", description: "Walks in the shadows with grace" },
  { name: "The Chosen", emoji: "⚜️", category: "special", rarity: "legendary", description: "Chosen above all others" },
];

const TRINKETS = [
  // === COMMON (12) ===
  { name: "Iron Shackle", description: "A miniature iron shackle charm", rarity: "common", imageEmoji: "⛓️", profileReward: "border-gray-steel", profileRewardType: "border" },
  { name: "Leather Cuff", description: "Tiny leather wrist cuff replica", rarity: "common", imageEmoji: "🖐️", profileReward: "border-leather-brown", profileRewardType: "border" },
  { name: "Bronze Bell", description: "A small bronze bell that jingles", rarity: "common", imageEmoji: "🔔", profileReward: "badge-bell", profileRewardType: "badge" },
  { name: "Silk Ribbon", description: "Delicate silk ribbon trinket", rarity: "common", imageEmoji: "🎀", profileReward: "border-silk-red", profileRewardType: "border" },
  { name: "Wax Seal", description: "A miniature wax seal stamp", rarity: "common", imageEmoji: "🔴", profileReward: "badge-seal", profileRewardType: "badge" },
  { name: "Tiny Key", description: "A small brass key on a chain", rarity: "common", imageEmoji: "🔑", profileReward: "badge-key", profileRewardType: "badge" },
  { name: "Pewter Ring", description: "Simple pewter band", rarity: "common", imageEmoji: "💍", profileReward: "border-pewter", profileRewardType: "border" },
  { name: "Leather Tag", description: "Engraved leather name tag", rarity: "common", imageEmoji: "🏷️", profileReward: "name-amber", profileRewardType: "nameColor" },
  { name: "Stone Token", description: "Smooth polished stone token", rarity: "common", imageEmoji: "🪨", profileReward: "badge-stone", profileRewardType: "badge" },
  { name: "Copper Coin", description: "An old copper coin stamped with a mark", rarity: "common", imageEmoji: "🪙", profileReward: "glow-copper", profileRewardType: "glow" },
  { name: "Rope Knot", description: "Miniature decorative rope knot", rarity: "common", imageEmoji: "🪢", profileReward: "border-rope", profileRewardType: "border" },
  { name: "Tallow Candle", description: "A tiny dripping candle charm", rarity: "common", imageEmoji: "🕯️", profileReward: "glow-warm", profileRewardType: "glow" },

  // === UNCOMMON (12) ===
  { name: "Silver Collar Pin", description: "Polished silver collar pin with etching", rarity: "uncommon", imageEmoji: "📌", profileReward: "border-silver", profileRewardType: "border" },
  { name: "Jade Pendant", description: "Deep green jade pendant", rarity: "uncommon", imageEmoji: "🟢", profileReward: "glow-jade", profileRewardType: "glow" },
  { name: "Obsidian Blade", description: "Miniature obsidian ritual blade", rarity: "uncommon", imageEmoji: "🗡️", profileReward: "badge-blade", profileRewardType: "badge" },
  { name: "Velvet Mask", description: "Tiny velvet masquerade mask", rarity: "uncommon", imageEmoji: "🎭", profileReward: "border-velvet", profileRewardType: "border" },
  { name: "Bone Dice", description: "Carved bone dice pair", rarity: "uncommon", imageEmoji: "🎲", profileReward: "badge-dice", profileRewardType: "badge" },
  { name: "Crystal Vial", description: "Small crystal vial with dark liquid", rarity: "uncommon", imageEmoji: "🧪", profileReward: "glow-crystal", profileRewardType: "glow" },
  { name: "Bronze Anklet", description: "Ornate bronze ankle chain", rarity: "uncommon", imageEmoji: "⛓️", profileReward: "border-bronze-chain", profileRewardType: "border" },
  { name: "Raven Feather", description: "Glossy black raven feather", rarity: "uncommon", imageEmoji: "🪶", profileReward: "badge-feather", profileRewardType: "badge" },
  { name: "Garnet Drop", description: "Single polished garnet gemstone", rarity: "uncommon", imageEmoji: "🔻", profileReward: "glow-garnet", profileRewardType: "glow" },
  { name: "Iron Nail", description: "An old iron nail from a binding ritual", rarity: "uncommon", imageEmoji: "📍", profileReward: "badge-nail", profileRewardType: "badge" },
  { name: "Engraved Lighter", description: "Zippo lighter with custom engraving", rarity: "uncommon", imageEmoji: "🔥", profileReward: "glow-ember", profileRewardType: "glow" },
  { name: "Signet Ring", description: "Bronze signet ring with house crest", rarity: "uncommon", imageEmoji: "💍", profileReward: "border-signet", profileRewardType: "border" },

  // === RARE (12) ===
  { name: "Golden Padlock", description: "Ornate golden padlock with filigree", rarity: "rare", imageEmoji: "🔐", profileReward: "border-gold-lock", profileRewardType: "border" },
  { name: "Ruby Heart", description: "Deep crimson ruby heart pendant", rarity: "rare", imageEmoji: "❤️", profileReward: "glow-ruby", profileRewardType: "glow" },
  { name: "Dragon Tooth", description: "Fossilized dragon tooth necklace", rarity: "rare", imageEmoji: "🦷", profileReward: "badge-dragon", profileRewardType: "badge" },
  { name: "Enchanted Mirror", description: "Small mirror that shows true self", rarity: "rare", imageEmoji: "🪞", profileReward: "border-mirror", profileRewardType: "border" },
  { name: "Moonstone", description: "Glowing moonstone with inner light", rarity: "rare", imageEmoji: "🌙", profileReward: "glow-moonlight", profileRewardType: "glow" },
  { name: "Thorned Rose", description: "Crystal rose with silver thorns", rarity: "rare", imageEmoji: "🌹", profileReward: "border-thorned", profileRewardType: "border" },
  { name: "Serpent Bracelet", description: "Coiled serpent bracelet in silver", rarity: "rare", imageEmoji: "🐍", profileReward: "badge-serpent", profileRewardType: "badge" },
  { name: "Blood Amber", description: "Ancient amber with dark inclusions", rarity: "rare", imageEmoji: "🟠", profileReward: "glow-amber-blood", profileRewardType: "glow" },
  { name: "Silk Blindfold", description: "Luxurious black silk blindfold", rarity: "rare", imageEmoji: "🙈", profileReward: "badge-blindfold", profileRewardType: "badge" },
  { name: "War Medal", description: "Battle-worn medal of endurance", rarity: "rare", imageEmoji: "🎖️", profileReward: "badge-medal", profileRewardType: "badge" },
  { name: "Binding Contract Scroll", description: "Miniature sealed scroll of binding", rarity: "rare", imageEmoji: "📜", profileReward: "border-scroll", profileRewardType: "border" },
  { name: "Crimson Chalice", description: "Goblet stained with crimson", rarity: "rare", imageEmoji: "🏆", profileReward: "glow-crimson", profileRewardType: "glow" },

  // === EPIC (10) ===
  { name: "Obsidian Crown", description: "Crown forged from volcanic obsidian", rarity: "epic", imageEmoji: "👑", profileReward: "border-obsidian-crown", profileRewardType: "border" },
  { name: "Phoenix Feather", description: "Smoldering feather that never burns out", rarity: "epic", imageEmoji: "🔥", profileReward: "glow-phoenix", profileRewardType: "glow" },
  { name: "Soul Chain", description: "Chain linking two souls together", rarity: "epic", imageEmoji: "⛓️", profileReward: "border-soul-chain", profileRewardType: "border" },
  { name: "Black Diamond", description: "Rare black diamond of absolute authority", rarity: "epic", imageEmoji: "💎", profileReward: "glow-black-diamond", profileRewardType: "glow" },
  { name: "Hellfire Orb", description: "Sphere containing eternal hellfire", rarity: "epic", imageEmoji: "🔮", profileReward: "glow-hellfire", profileRewardType: "glow" },
  { name: "Iron Throne Shard", description: "Fragment of the iron throne", rarity: "epic", imageEmoji: "⚔️", profileReward: "border-iron-throne", profileRewardType: "border" },
  { name: "Dark Heart Locket", description: "Locket containing a beating dark heart", rarity: "epic", imageEmoji: "🖤", profileReward: "badge-dark-heart", profileRewardType: "badge" },
  { name: "Enchanted Collar", description: "Magical collar that glows with power", rarity: "epic", imageEmoji: "⭕", profileReward: "border-enchanted", profileRewardType: "border" },
  { name: "Blood Moon Amulet", description: "Amulet charged under a blood moon", rarity: "epic", imageEmoji: "🌑", profileReward: "glow-blood-moon", profileRewardType: "glow" },
  { name: "Void Crystal", description: "Crystal from the void between worlds", rarity: "epic", imageEmoji: "🔮", profileReward: "glow-void", profileRewardType: "glow" },

  // === LEGENDARY (6) ===
  { name: "Crown of Dominion", description: "The ultimate crown — absolute dominion over all", rarity: "legendary", imageEmoji: "👑", profileReward: "border-dominion", profileRewardType: "border" },
  { name: "Eternal Flame Heart", description: "Heart forged in eternal flames, never extinguished", rarity: "legendary", imageEmoji: "❤️‍🔥", profileReward: "glow-eternal-flame", profileRewardType: "glow" },
  { name: "The Unbreakable Bond", description: "Chain that can never be broken — absolute connection", rarity: "legendary", imageEmoji: "🔗", profileReward: "border-unbreakable", profileRewardType: "border" },
  { name: "Eye of the Storm", description: "Perfect calm amid chaos — absolute composure", rarity: "legendary", imageEmoji: "🌀", profileReward: "glow-storm-eye", profileRewardType: "glow" },
  { name: "Celestial Sigil", description: "Sigil written in the stars — destiny fulfilled", rarity: "legendary", imageEmoji: "⚜️", profileReward: "badge-celestial", profileRewardType: "badge" },
  { name: "The Master Key", description: "Opens every lock — access to everything", rarity: "legendary", imageEmoji: "🗝️", profileReward: "border-master-key", profileRewardType: "border" },
];

async function seed() {
  console.log("Clearing existing stickers and trinkets...");
  await db.delete(adminStickers);
  await db.delete(trinkets);

  console.log(`Seeding ${STICKERS.length} stickers...`);
  for (const s of STICKERS) {
    await db.insert(adminStickers).values(s);
  }

  console.log(`Seeding ${TRINKETS.length} trinkets...`);
  for (const t of TRINKETS) {
    await db.insert(trinkets).values(t);
  }

  console.log(`Done! ${STICKERS.length} stickers + ${TRINKETS.length} trinkets seeded.`);
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
