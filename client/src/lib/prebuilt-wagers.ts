export interface PrebuiltWager {
  name: string;
  category: string;
  stakes: string;
}

export const WAGER_CATEGORIES = [
  "Physical",
  "Mental",
  "Endurance",
  "Service",
  "Dare",
  "Gamble",
  "Skill",
  "Obedience",
] as const;

export const PREBUILT_WAGERS: PrebuiltWager[] = [
  // Physical
  { name: "Hold a plank longer than your partner", category: "Physical", stakes: "Loser gives winner a massage" },
  { name: "Who can do more push-ups in 2 minutes", category: "Physical", stakes: "Loser does winner's chores for a day" },
  { name: "Wall sit endurance challenge", category: "Physical", stakes: "Loser wears outfit of winner's choice" },
  { name: "Race around the block — first one back wins", category: "Physical", stakes: "Loser cooks dinner" },
  { name: "Flexibility challenge — who can touch their toes longer", category: "Physical", stakes: "Loser gives a foot rub" },
  { name: "Balance on one foot — last one standing wins", category: "Physical", stakes: "Loser serves breakfast in bed" },
  { name: "Arm wrestling — best of three", category: "Physical", stakes: "Loser wears a collar all day" },
  { name: "Hold a stress ball squeeze for the longest", category: "Physical", stakes: "Loser writes an essay on obedience" },
  { name: "Who can hold their breath underwater longer", category: "Physical", stakes: "Loser does 50 squats" },
  { name: "Yoga pose hold — tree pose competition", category: "Physical", stakes: "Loser washes winner's car" },

  // Mental
  { name: "Trivia quiz — 20 random questions", category: "Mental", stakes: "Loser fulfills one fantasy of winner's choice" },
  { name: "Memory card matching game", category: "Mental", stakes: "Loser is blindfolded for an hour" },
  { name: "Chess match — winner takes all", category: "Mental", stakes: "Loser follows any three commands" },
  { name: "Word association speed round — first to hesitate loses", category: "Mental", stakes: "Loser writes 100 lines" },
  { name: "Riddle challenge — solve 5 riddles first", category: "Mental", stakes: "Loser kneels for 30 minutes" },
  { name: "Spelling bee — increasingly difficult words", category: "Mental", stakes: "Loser wears a sign of shame" },
  { name: "Mental math race — 10 problems", category: "Mental", stakes: "Loser surrenders phone for 24 hours" },
  { name: "Name that tune — first to 10 points wins", category: "Mental", stakes: "Loser performs a striptease" },
  { name: "20 questions — guess the object in fewest tries", category: "Mental", stakes: "Loser grants one wish" },
  { name: "Crossword puzzle race — same puzzle, first to finish", category: "Mental", stakes: "Loser does laundry for a week" },

  // Endurance
  { name: "Ice cube held in hand — last one holding wins", category: "Endurance", stakes: "Loser edges for 30 minutes with no release" },
  { name: "Silent treatment challenge — first to speak loses", category: "Endurance", stakes: "Loser wears a gag for an hour" },
  { name: "No phone for 24 hours — first to check loses", category: "Endurance", stakes: "Loser is denied orgasm for a week" },
  { name: "Tickle endurance — last one to break wins", category: "Endurance", stakes: "Loser submits to tickle torture" },
  { name: "Spicy food challenge — eat increasingly hot peppers", category: "Endurance", stakes: "Loser drinks whatever winner prepares" },
  { name: "Stay awake challenge — movie marathon edition", category: "Endurance", stakes: "Loser is woken up however winner chooses" },
  { name: "Cold shower endurance — who lasts longest", category: "Endurance", stakes: "Loser takes cold showers for a week" },
  { name: "No swearing for a day — first violation loses", category: "Endurance", stakes: "Loser gets mouth washed with soap" },
  { name: "Hold a position without fidgeting for 10 minutes", category: "Endurance", stakes: "Loser holds position for 30 minutes" },
  { name: "No sugar for a week — first to break loses", category: "Endurance", stakes: "Loser eats only what winner decides for 3 days" },

  // Service
  { name: "Bet on who does the dishes faster", category: "Service", stakes: "Loser does all dishes for a month" },
  { name: "Cooking competition — partner judges", category: "Service", stakes: "Loser cooks all meals for a week" },
  { name: "Who can fold laundry faster", category: "Service", stakes: "Loser handles all laundry for 2 weeks" },
  { name: "Deep cleaning race — assigned rooms", category: "Service", stakes: "Loser cleans the whole house" },
  { name: "Grocery shopping efficiency — best deals win", category: "Service", stakes: "Loser carries all bags for a month" },
  { name: "Bed-making perfection contest", category: "Service", stakes: "Loser makes the bed every day for a month" },
  { name: "Iron clothes — fewest wrinkles wins", category: "Service", stakes: "Loser irons all clothes for 2 weeks" },
  { name: "Car wash quality competition", category: "Service", stakes: "Loser washes both cars every week" },
  { name: "Organize a closet — judge by neatness", category: "Service", stakes: "Loser organizes the entire house" },
  { name: "Gift wrapping contest — best presentation wins", category: "Service", stakes: "Loser wraps all gifts for a year" },

  // Dare
  { name: "Truth or dare — 10 rounds, no backing out", category: "Dare", stakes: "Loser does the ultimate dare" },
  { name: "Public display challenge — who's braver", category: "Dare", stakes: "Loser performs a dare in public" },
  { name: "Prank war — best prank of the week wins", category: "Dare", stakes: "Loser accepts any prank without complaint" },
  { name: "Karaoke battle — audience votes", category: "Dare", stakes: "Loser sings in public" },
  { name: "Dance-off — freestyle battle", category: "Dare", stakes: "Loser performs a dance at a party" },
  { name: "Embarrassing photo challenge — silliest face wins", category: "Dare", stakes: "Loser posts embarrassing photo" },
  { name: "Accent challenge — maintain accent for an hour", category: "Dare", stakes: "Loser speaks in accent all day" },
  { name: "Compliment strangers — most compliments in 10 min", category: "Dare", stakes: "Loser confesses something embarrassing" },
  { name: "Wear a costume to the store — who gets more looks", category: "Dare", stakes: "Loser wears costume to work/school" },
  { name: "Cold approach challenge — talk to 5 strangers", category: "Dare", stakes: "Loser does whatever winner dares" },

  // Gamble
  { name: "Coin flip — double or nothing on chores", category: "Gamble", stakes: "Loser does double chores" },
  { name: "Card draw — highest card wins", category: "Gamble", stakes: "Loser grants a free pass on one rule" },
  { name: "Rock paper scissors — best of 7", category: "Gamble", stakes: "Loser wears whatever winner picks" },
  { name: "Dice roll — over/under 7", category: "Gamble", stakes: "Loser gets a new standing order" },
  { name: "Spin the bottle — lands on you, you lose", category: "Gamble", stakes: "Loser performs bottle's dare" },
  { name: "Guess the number — 1 to 100", category: "Gamble", stakes: "Loser edges for each number off" },
  { name: "Flip a coin 10 times — most heads wins", category: "Gamble", stakes: "Loser follows a new ritual for a week" },
  { name: "Pick a card — red or black", category: "Gamble", stakes: "Loser surrenders one privilege" },
  { name: "Roll dice — doubles wins", category: "Gamble", stakes: "Loser adds a new limit to curious" },
  { name: "Lottery scratch-off — highest amount wins", category: "Gamble", stakes: "Loser buys winner a gift" },

  // Skill
  { name: "Video game 1v1 — winner's choice of game", category: "Skill", stakes: "Loser is gaming servant" },
  { name: "Pool/billiards match — best of 3", category: "Skill", stakes: "Loser gives a lap dance" },
  { name: "Darts — closest to bullseye in 3 throws", category: "Skill", stakes: "Loser is target for a session" },
  { name: "Bowling — single game, highest score wins", category: "Skill", stakes: "Loser polishes winner's shoes" },
  { name: "Drawing competition — third party judges", category: "Skill", stakes: "Loser models for winner's art" },
  { name: "Puzzle race — same puzzle, first to finish", category: "Skill", stakes: "Loser does a task blindfolded" },
  { name: "Ping pong — first to 21", category: "Skill", stakes: "Loser serves drinks all evening" },
  { name: "Knife throwing accuracy — closest to center", category: "Skill", stakes: "Loser sharpens all knives" },
  { name: "Typing speed test — fastest WPM wins", category: "Skill", stakes: "Loser types winner's messages for a day" },
  { name: "Paper airplane distance contest", category: "Skill", stakes: "Loser folds 100 paper cranes" },

  // Obedience
  { name: "Simon Says marathon — last one standing", category: "Obedience", stakes: "Loser follows all commands for 24 hours" },
  { name: "Protocol perfection — fewest mistakes in a day", category: "Obedience", stakes: "Loser doubles all protocols for a week" },
  { name: "Response time challenge — fastest acknowledgments", category: "Obedience", stakes: "Loser must respond within 10 seconds all day" },
  { name: "Position holding — maintain inspection pose longest", category: "Obedience", stakes: "Loser holds 5 positions for 10 minutes each" },
  { name: "Rule recitation — recite all rules perfectly", category: "Obedience", stakes: "Loser writes all rules 50 times" },
  { name: "Service challenge — complete 10 tasks fastest", category: "Obedience", stakes: "Loser adds 5 new tasks to their list" },
  { name: "Silence challenge — longest without speaking unless spoken to", category: "Obedience", stakes: "Loser is on silence protocol for 48 hours" },
  { name: "Anticipation test — predict Dom's needs accurately", category: "Obedience", stakes: "Loser studies Dom's preferences for a week" },
  { name: "Kneeling endurance — longest kneel without shifting", category: "Obedience", stakes: "Loser kneels every time Dom enters a room" },
  { name: "Gratitude challenge — most sincere thank-yous in a day", category: "Obedience", stakes: "Loser writes a gratitude journal daily for a month" },
];