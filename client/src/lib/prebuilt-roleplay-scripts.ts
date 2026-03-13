export interface RoleplayBeat {
  phase: string;
  domDialogue: string;
  subDialogue: string;
  domAction: string;
  subAction: string;
  mood: string;
  durationNote: string;
}

export interface RoleplayScript {
  id: string;
  title: string;
  category: string;
  setting: string;
  duration: string;
  intensity: number;
  summary: string;
  domAttire: string;
  subAttire: string;
  props: string[];
  safetyNotes: string;
  beats: RoleplayBeat[];
}

export const ROLEPLAY_CATEGORIES = [
  "Authority",
  "Fantasy",
  "Domestic",
  "Seduction",
  "Interrogation",
  "Service",
  "Worship",
  "Captive",
] as const;

export const PREBUILT_ROLEPLAY_SCRIPTS: RoleplayScript[] = [
  {
    id: "rp-strict-professor",
    title: "The Strict Professor",
    category: "Authority",
    setting: "A dimly lit study or office. A desk with a single lamp. A chair positioned in front of the desk. Classical music playing faintly in the background.",
    duration: "45-60 min",
    intensity: 6,
    summary: "The Dom plays a demanding university professor who has summoned a failing student (Sub) to discuss their poor performance. What begins as an academic reprimand escalates into a deeply personal exchange of power, obedience, and earned approval.",
    domAttire: "Button-down shirt with sleeves rolled to the elbows. Dark slacks. Reading glasses (optional). A leather belt visible at the waist. An air of composed authority.",
    subAttire: "White collared shirt, slightly untucked. Plaid skirt or fitted trousers. Hair pulled back neatly. Minimal jewelry. Appearance should suggest someone who tried but fell short.",
    props: ["Desk and chair", "Stack of papers or a folder", "Pen", "Ruler or pointer (optional)", "Glass of water"],
    safetyNotes: "Establish safe word before beginning. This scene involves verbal authority and mild humiliation — agree on boundaries around language intensity beforehand. Check in after the confession phase.",
    beats: [
      {
        phase: "The Summons",
        domDialogue: "\"Close the door behind you. Sit down. I didn't say you could look at me yet — eyes on the desk.\"",
        subDialogue: "\"Yes, Professor. I'm sorry for — \"",
        domAction: "Seated behind the desk, reviewing papers. Does not look up when the Sub enters. Lets several seconds of silence pass before speaking. Taps pen against the desk rhythmically.",
        subAction: "Enters quietly, closes the door with care. Sits in the chair, hands folded tightly in lap. Eyes drop to the desk surface. Swallows nervously.",
        mood: "Tense anticipation. The silence is heavier than any words.",
        durationNote: "3-5 min"
      },
      {
        phase: "The Review",
        domDialogue: "\"Do you know why you're here? Tell me — in your own words — exactly what you think you've done wrong. Take your time. I want precision, not excuses.\"",
        subDialogue: "\"I... I haven't been performing to the standard you expect, Professor. My last assignment was late, and I know the quality wasn't — \"",
        domAction: "Leans back in chair. Removes glasses slowly. Makes direct, unwavering eye contact for the first time. Lets the Sub struggle through their answer without helping.",
        subAction: "Shifts uncomfortably in the chair. Hands grip the armrests. Voice wavers slightly. Tries to maintain eye contact but keeps breaking it.",
        mood: "Mounting pressure. The Dom's calm is more intimidating than anger.",
        durationNote: "5-7 min"
      },
      {
        phase: "The Correction",
        domDialogue: "\"Stand up. Come here. Stand beside me — no, closer. You see these marks? Every error, circled in red. You're capable of brilliance, and yet you hand me this. That's what disappoints me. Not failure — laziness.\"",
        subDialogue: "\"I understand, Professor. I want to do better. Please — tell me how to make it right.\"",
        domAction: "Stands and moves around the desk. Places a hand on the Sub's shoulder — firm but not harsh. Guides them to look at the papers spread across the desk. Voice drops lower, more intimate.",
        subAction: "Stands immediately. Moves to the indicated position. Body is rigid with nervous energy. When the Dom's hand lands on their shoulder, a visible shiver. Looks at the papers, then back up at the Dom.",
        mood: "Shift from pure authority to a charged, personal tension. The physical proximity changes everything.",
        durationNote: "5-7 min"
      },
      {
        phase: "The Test",
        domDialogue: "\"I'm going to ask you three questions about the material. For each one you get right, you earn my patience. For each one you get wrong... well. We'll address that. Hands behind your back. Eyes on mine. Ready?\"",
        subDialogue: "\"Yes, Professor. I'm ready.\" (After a wrong answer): \"I'm sorry — I should have known that. I'll accept whatever you decide.\"",
        domAction: "Circles the Sub slowly while asking questions. Stands behind them for the hardest question, speaking close to their ear. For correct answers, a brief nod and \"Good.\" For wrong ones, a long pause and a disappointed exhale.",
        subAction: "Clasps hands behind back as instructed. Stands straight and still. Answers with clear effort and sincerity. When wrong, doesn't make excuses — head drops slightly in genuine shame.",
        mood: "Intellectual domination. Every question is a microcosm of the power exchange.",
        durationNote: "7-10 min"
      },
      {
        phase: "The Confession",
        domDialogue: "\"Now. I want the truth — not about the assignment. About you. Why are you really here? What is it you actually need from me? Say it plainly.\"",
        subDialogue: "\"I need... I need your guidance, Professor. I need you to hold me to a standard I can't hold myself to. I need to know that someone sees me clearly and demands more. I need your correction. I need to earn your approval.\"",
        domAction: "Leans against the front of the desk, arms crossed. Expression softens almost imperceptibly. Listens with total attention. When the Sub finishes, takes one step forward and lifts their chin with a single finger.",
        subAction: "Vulnerability breaks through. Voice cracks slightly. Hands come out from behind back instinctively, then quickly return. Meets the Dom's eyes when their chin is lifted — open, exposed, honest.",
        mood: "The emotional core of the scene. Raw honesty and deep vulnerability.",
        durationNote: "5-8 min"
      },
      {
        phase: "The Verdict",
        domDialogue: "\"That... was the right answer. The only right answer tonight. You will rewrite every assignment from the past month. You will bring them to me personally. And you will not disappoint me again. Are we understood?\"",
        subDialogue: "\"Yes, Professor. Completely. Thank you — thank you for not giving up on me.\"",
        domAction: "Places both hands on the Sub's shoulders. Holds them firmly. The grip is simultaneously commanding and protective. Slight nod of approval — the first real one.",
        subAction: "Exhales — tension releasing for the first time. Shoulders drop slightly under the Dom's hands. A genuine, relieved expression. May instinctively lean forward toward the Dom.",
        mood: "Resolution and earned tenderness. Authority maintained but warmth revealed.",
        durationNote: "3-5 min"
      },
      {
        phase: "Aftercare — Breaking Character",
        domDialogue: "\"Scene's over. Come here — you were incredible. How are you feeling? What do you need right now?\"",
        subDialogue: "\"That was intense... I feel really seen. Can you just hold me for a minute?\"",
        domAction: "Breaks character clearly with a warm smile. Opens arms. Provides physical comfort — holding, stroking hair, gentle touch. Gets water if needed. Checks in genuinely.",
        subAction: "Steps fully into the embrace. Breathes deeply. May laugh or get emotional as the scene energy dissipates. Communicates needs honestly.",
        mood: "Warm, safe, connected. Complete transition from play to genuine care.",
        durationNote: "10-15 min"
      }
    ]
  },
  {
    id: "rp-stranger-hotel-bar",
    title: "Strangers at the Hotel Bar",
    category: "Seduction",
    setting: "A quiet, upscale hotel bar or lounge. Low lighting, leather seats, soft jazz. Two people who 'don't know each other' meeting for the first time.",
    duration: "60-90 min",
    intensity: 5,
    summary: "Both partners pretend to be strangers meeting at a hotel bar. The Dom plays a confident, mysterious traveler. The Sub plays someone intrigued and increasingly drawn in. The scene builds from polite conversation to undeniable tension, ending with a charged invitation.",
    domAttire: "Dark blazer or leather jacket over a fitted black shirt. Well-fitted jeans or dark trousers. A watch. Cologne applied deliberately. Effortlessly put-together — not overdressed.",
    subAttire: "A dress or outfit they feel genuinely attractive in — something they'd wear on a first date. Light perfume. Hair styled with intention. One striking accessory — a necklace, ring, or pair of earrings that invites comment.",
    props: ["Two cocktail glasses", "A hotel key card (any card will work)", "Ambient music playlist", "Optional: a book or phone for the Sub to be 'reading' when the Dom approaches"],
    safetyNotes: "This scene is about seduction and building tension. Discuss in advance how far the 'strangers' go — does it end with the invitation, or continue? Establish a signal for if either partner feels uncomfortable with the flirtation intensity.",
    beats: [
      {
        phase: "The Arrival",
        domDialogue: "(To the bartender, not the Sub) \"Whiskey, neat. Whatever's interesting.\" (Glances at the Sub, then away. A small, private smile.)",
        subDialogue: "(Doesn't speak yet. Aware of the Dom's presence. Turns a page of their book or adjusts their drink. Crosses legs.)",
        domAction: "Enters the bar with unhurried confidence. Chooses a seat nearby but not adjacent — close enough to be noticed. Orders without looking at the menu. Radiates comfortable self-possession.",
        subAction: "Already seated. Notices the Dom's entrance but doesn't stare. Body language subtly opens — uncrosses arms, sits slightly straighter. A brief glance over the rim of their glass.",
        mood: "Electric awareness. Two people who haven't spoken but are already communicating with their bodies.",
        durationNote: "5-7 min"
      },
      {
        phase: "The Opening",
        domDialogue: "\"That's an interesting choice.\" (Nodding at their drink/book) \"Most people here order something safe. You didn't. I like that.\"",
        subDialogue: "\"Maybe I'm not most people.\" (Slight smile, maintaining eye contact a beat longer than necessary) \"And what makes your choice so interesting?\"",
        domAction: "Turns to face the Sub fully. Leans one elbow on the bar. Smile is warm but knowing — like they can already read something about the Sub. Speaks at a measured pace.",
        subAction: "Sets down the book/phone deliberately. Gives the Dom their full attention. Matches the Dom's relaxed posture but with a hint of challenge. Plays with the rim of their glass.",
        mood: "Playful verbal sparring. Two sharp minds finding each other.",
        durationNote: "5-8 min"
      },
      {
        phase: "The Discovery",
        domDialogue: "\"So what brings you to a hotel bar alone on a night like this? Running toward something, or running away?\"",
        subDialogue: "\"Who says I'm alone?\" (Pause, then a softer smile) \"Maybe I was waiting for someone worth talking to. The jury's still out.\"",
        domAction: "Moves one seat closer. Doesn't ask permission — just does it naturally. Orders a second round for both without asking. The presumption is deliberate. Studies the Sub's face while they speak, genuinely listening.",
        subAction: "Accepts the drink with a raised eyebrow — amused, not annoyed. Turns body fully toward the Dom. Lets their knee almost-but-not-quite touch. Holds eye contact longer now.",
        mood: "Deepening intrigue. The distance between them is shrinking in every way.",
        durationNote: "7-10 min"
      },
      {
        phase: "The Tension",
        domDialogue: "\"You have this thing you do — when you're thinking about something you shouldn't be thinking about, your fingers go to that necklace. You've touched it four times in the last two minutes. What are you thinking about right now?\"",
        subDialogue: "(Hand freezes on the necklace) \"...You're very observant. That's either flattering or dangerous.\" (Quieter) \"Maybe both.\"",
        domAction: "Leans in closer to speak — the bar is loud enough to justify it. Places a hand near the Sub's on the bar, fingertips almost touching. Voice drops lower. The observation about the necklace is both intimate and slightly unsettling in its precision.",
        subAction: "Breath catches slightly at being read so accurately. Doesn't pull away — leans in fractionally. The proximity is intoxicating. Realizes they've been completely drawn in and doesn't care.",
        mood: "Crackling sexual tension. Every word has a double meaning. The air between them feels charged.",
        durationNote: "7-10 min"
      },
      {
        phase: "The Invitation",
        domDialogue: "\"I have a room upstairs. I'm going to finish this drink, and then I'm going to walk to the elevator. I won't ask you to come. But if you're still curious about what you're thinking about...\" (Places the key card on the bar between them) \"...room 814.\"",
        subDialogue: "(Long pause. Eyes move from the key card to the Dom's face. Wets their lips.) \"...I'll think about it.\" (Both know the answer is yes.)",
        domAction: "Finishes the drink without rushing. Stands. Adjusts jacket deliberately. Makes eye contact one final time — warm, confident, inviting but never demanding. Leaves the key card and walks toward the elevator without looking back.",
        subAction: "Watches the Dom stand. Heart rate visibly elevated. After the Dom begins to walk away, counts to ten. Picks up the key card. Finishes their drink in one long sip. Stands. Walks in the same direction.",
        mood: "Peak anticipation. The unspoken agreement is louder than any words.",
        durationNote: "5-7 min"
      },
      {
        phase: "Aftercare — Reconnection",
        domDialogue: "\"Welcome back, my love. That was fun. How did that feel? What was your favorite moment?\"",
        subDialogue: "\"God, my heart was actually pounding. When you noticed the necklace thing — that got me. I felt genuinely seduced.\"",
        domAction: "Breaks character with genuine warmth. Holds the Sub. Debriefs the scene — asks about favorite moments, anything that felt off, emotional state. Provides comfort and grounding.",
        subAction: "Relaxes into partner mode. Shares genuine reactions and feelings from the scene. Laughs about the fun parts. Appreciates the effort that went into the character work.",
        mood: "Warm, giggly, deeply connected. The shared experience becomes a bonding moment.",
        durationNote: "10-15 min"
      }
    ]
  },
  {
    id: "rp-royal-court",
    title: "The Royal Court",
    category: "Worship",
    setting: "A 'throne room' — the bedroom arranged with a central chair (the throne), draped with rich fabrics. Low candles or warm lighting. Regal, ambient music. The floor should have a cushion for kneeling.",
    duration: "50-70 min",
    intensity: 5,
    summary: "The Dom plays a sovereign ruler holding court. The Sub plays a devoted subject summoned for a private audience. The scene explores deep worship, formal protocol, service, and the intimate bond between ruler and their most trusted subject.",
    domAttire: "A robe or draped fabric over comfortable clothing — silk, velvet, or dark satin. A crown, circlet, or statement headpiece. Rings on multiple fingers. Bare feet resting on a footstool. Radiant, composed authority.",
    subAttire: "Simple, clean clothing — a white shirt and dark pants, or a flowing dress. Nothing flashy. A collar or choker representing their station. Feet bare. Hair neat and pulled away from the face.",
    props: ["A chair designated as the throne", "Draped fabric or blankets for set dressing", "A kneeling cushion", "A chalice or wine glass", "A small bowl of grapes or fruit", "Candles"],
    safetyNotes: "This scene involves extended kneeling — use a cushion and check in on knee comfort. The worship elements are reverent and tender, not degrading. Discuss comfort levels with foot worship, hand-feeding, and verbal devotion beforehand.",
    beats: [
      {
        phase: "The Approach",
        domDialogue: "(Does not speak initially. Sits on the throne in composed silence, watching the doors. When the Sub enters:) \"You may approach. Stop at the edge of the carpet. Kneel.\"",
        subDialogue: "\"Your Majesty.\" (Head bowed deeply) \"I am honored by this audience. I come with nothing but my devotion.\"",
        domAction: "Seated on the throne, completely still. One hand rests on the arm of the chair, the other holds a glass. Watches the Sub enter with an evaluating gaze — pleased but not yet showing it. Slight incline of the head when satisfied with the kneeling position.",
        subAction: "Enters with measured steps. Eyes lowered. Stops precisely where indicated. Kneels smoothly — one knee first, then both. Hands placed palms-up on thighs. Posture straight and composed despite the vulnerability.",
        mood: "Formal, charged with reverence. The space between throne and floor feels like an ocean and a heartbeat simultaneously.",
        durationNote: "5-7 min"
      },
      {
        phase: "The Address",
        domDialogue: "\"Rise enough to look at me. Tell me — what have you done in my name since we last spoke? What devotion have you carried in your heart? Speak freely, but speak truly.\"",
        subDialogue: "\"Every morning I have woken thinking of how to serve you better. I have kept your rules written on my heart. I have been patient when patience was difficult, and obedient when obedience required sacrifice. I hope... I hope it has been enough.\"",
        domAction: "Leans forward slightly — a rare gesture of interest. Extends one hand, palm down, toward the Sub. This is permission to kiss the hand. Listens with the gravity of someone who truly values what they're hearing.",
        subAction: "Rises to an upright kneeling position. Takes the offered hand gently in both of theirs. Presses lips to the knuckles — slow, reverent, grateful. Speaks with sincerity that goes beyond the character into genuine feeling.",
        mood: "Deep emotional intimacy wrapped in formal protocol. The structure creates safety for vulnerability.",
        durationNote: "7-10 min"
      },
      {
        phase: "The Service",
        domDialogue: "\"You have pleased me. As a reward, you will serve me tonight. Bring the fruit. Feed me as a subject should — with care, attention, and gratitude for the privilege.\"",
        subDialogue: "\"It is my greatest honor.\" (While feeding:) \"May each offering bring you pleasure, Your Majesty. Your happiness is my purpose.\"",
        domAction: "Relaxes into the throne. Accepts each piece of fruit delicately — sometimes taking it with teeth, sometimes with fingers. Praises the Sub's attentiveness: \"Good. Again. Slower this time.\" Occasionally strokes the Sub's hair or cheek between offerings.",
        subAction: "Retrieves the fruit bowl. Returns to kneel beside the throne. Selects each piece carefully. Offers it with both hands raised, head slightly bowed. When praised, a warm flush of genuine pleasure.",
        mood: "Tender dominance. The act of feeding becomes profoundly intimate — a meditation on trust and service.",
        durationNote: "10-12 min"
      },
      {
        phase: "The Worship",
        domDialogue: "\"Now. You may worship your sovereign. Begin at my feet. Show me the depth of your devotion — not with words this time, but with touch. Every gesture should say what words cannot.\"",
        subDialogue: "(No words — only focused, reverent touch. If spoken to:) \"You are everything, Your Majesty. Every part of you deserves this care.\"",
        domAction: "Extends one foot from the footstool. Closes eyes and allows the worship to happen without directing it. Occasional soft sounds of approval. Fingers trail through the Sub's hair approvingly. \"That's it. You know exactly what I need.\"",
        subAction: "Takes the offered foot gently. Begins with careful massage — thumbs working the arch, fingers across the top. Transitions to light kisses across the instep, each ankle. Moves with slow, deliberate attention. Every touch communicates devotion.",
        mood: "Sacred, meditative, deeply connective. Time slows. The outside world ceases to exist.",
        durationNote: "10-15 min"
      },
      {
        phase: "The Blessing",
        domDialogue: "\"Rise. Come closer. You have served with beauty and sincerity tonight. As your sovereign, I bestow upon you my favor.\" (Takes the Sub's face in both hands) \"You are seen. You are valued. You are mine, and I am proud to call you so.\"",
        subDialogue: "\"I am yours, completely and gratefully. Whatever you ask of me, I will give. Whatever you need, I will be. Thank you for choosing me.\"",
        domAction: "Stands from the throne for the first time. Takes the Sub's face gently in both hands. Forehead to forehead. The formal language softens into genuine tenderness. A kiss on the forehead — the sovereign's seal of approval.",
        subAction: "Stands when invited. Eyes are bright with emotion. Receives the blessing with open vulnerability. When foreheads touch, closes eyes. This is the moment the character and the person merge completely.",
        mood: "Emotional climax. Formal devotion transforms into raw, honest love.",
        durationNote: "5-7 min"
      },
      {
        phase: "Aftercare — The Return",
        domDialogue: "\"Okay, we're done. That was beautiful. Come sit with me — normal us now. You need water? A blanket? Tell me everything you felt.\"",
        subDialogue: "\"That blessing part... I wasn't acting anymore. That was real. I feel so connected to you right now.\"",
        domAction: "Removes any costume elements. Pulls the Sub onto the couch or bed. Wraps them in a blanket. Gets water. Holds them close. Asks specific questions about the experience.",
        subAction: "Settles into partner's arms. Processes the emotional intensity. Shares which moments hit hardest. Expresses gratitude for the experience.",
        mood: "Peaceful, intimate, grounding. The formality dissolves but the connection deepens.",
        durationNote: "10-15 min"
      }
    ]
  },
  {
    id: "rp-captured-spy",
    title: "The Captured Spy",
    category: "Interrogation",
    setting: "A sparse room — cleared of unnecessary furniture. One chair in the center under a bright light. The rest of the room in shadow. Industrial or tense ambient music. Cold, utilitarian atmosphere.",
    duration: "40-55 min",
    intensity: 7,
    summary: "The Dom plays a commanding intelligence officer who has captured an enemy operative (Sub). The interrogation blurs the line between adversaries and something more complicated — respect, fascination, and an undeniable connection beneath the power struggle.",
    domAttire: "Military-inspired: black turtleneck or fitted dark shirt. Dark cargo pants or tactical-looking trousers. Boots. A holster or belt with authority. Hair slicked back or tightly controlled. An air of lethal competence.",
    subAttire: "Disheveled but deliberate: a tank top or partially unbuttoned shirt. Pants with the belt removed (it was 'confiscated'). Barefoot. Hair mussed. Light smudges of makeup to suggest exhaustion. Hands loosely bound in front with soft rope or cuffs.",
    props: ["A sturdy chair", "A bright desk lamp (the 'interrogation light')", "Soft rope or leather cuffs", "A glass of water (used as a power tool)", "A manila folder with 'classified' papers"],
    safetyNotes: "This scene involves restraint, intimidation, and psychological tension. Safe word is essential and should be clearly confirmed before starting. The Dom should never actually threaten harm — all 'threats' are implied and theatrical. Check in during the vulnerability phase.",
    beats: [
      {
        phase: "The Setup",
        domDialogue: "(Enters the room after the Sub has been seated and waiting in silence for at least 2 minutes.) \"Comfortable? No? Good. Let's begin.\"",
        subDialogue: "(Defiant, measured) \"Whatever you think you know about me, you're wrong. I have nothing to say to you.\"",
        domAction: "Enters carrying the folder. Doesn't acknowledge the Sub immediately — walks to the far side of the room, adjusts the light to shine directly on the Sub's face. Only then turns to face them. Slow, deliberate movements that communicate complete control.",
        subAction: "Has been sitting under the light, wrists loosely bound. When the Dom enters, sits up straighter — refusing to show fear. Jaw set. Eyes track the Dom's every movement. There's defiance, but also the awareness that they are completely at this person's mercy.",
        mood: "Taut as a wire. Two formidable people about to clash.",
        durationNote: "5-7 min"
      },
      {
        phase: "The Probing",
        domDialogue: "\"Let me tell you what I already know.\" (Opens folder, reads deliberately) \"Name. Aliases. Last three operations. The contact you met in Vienna. The dead drop you missed last Tuesday. Shall I continue, or would you like to save us both some time?\"",
        subDialogue: "\"Impressive research. Half of it's fabricated and you know it. You brought me here because you don't know the one thing that matters. So ask your real question.\"",
        domAction: "Paces slowly around the chair. Reads details from the folder — some accurate, some deliberately wrong to gauge reactions. Places photos from the folder face-up on the Sub's lap, one at a time. Watches the Sub's eyes and micro-expressions with trained precision.",
        subAction: "Maintains composure through the information dump. When an accurate detail hits, the mask slips for a fraction of a second — a tightened jaw, a swallow, a brief look away. Recovers quickly each time. Fighting to maintain the upper hand verbally.",
        mood: "Cerebral chess match. Both players are skilled. The Sub's resistance is genuine and earns reluctant respect.",
        durationNote: "7-10 min"
      },
      {
        phase: "The Pressure",
        domDialogue: "\"You're good. Really good. But here's what you haven't figured out yet —\" (Leans in from behind, mouth near the Sub's ear, voice barely above a whisper) \"— I'm not trying to break you. I'm trying to understand you. And that should terrify you far more.\"",
        subDialogue: "(Breath hitches despite best efforts) \"...Why?\" (The first crack in the armor — a genuine question, not a deflection.)",
        domAction: "Moves behind the chair. Hands rest on the back of the chair, just above the Sub's shoulders — present but not touching. Leans in close enough to speak directly into the Sub's ear. The intimacy of the proximity is more disarming than any raised voice could be.",
        subAction: "Body goes completely still when the Dom is behind them. Can feel breath on their ear. Every instinct says not to react — training versus the body's honest response. Fingers grip the chair arms. The single-word question escapes before it can be stopped.",
        mood: "The interrogation shifts from professional to deeply personal. The Sub's control is genuinely tested.",
        durationNote: "5-7 min"
      },
      {
        phase: "The Offer",
        domDialogue: "\"Because I've read every file on you. Studied every mission. Tracked you for months. And the person in these reports? They're brilliant, relentless, loyal to a fault. Someone worth understanding. So here's my offer: stop performing for me, and I'll stop performing for you. Just this room. Just us. The truth.\"",
        subDialogue: "(Long silence. Then, quietly, with the exhaustion of someone who has been fighting for too long:) \"...What do you want to know? The real thing — not the file.\"",
        domAction: "Walks to face the Sub directly. Crouches down to eye level — no longer towering over them. Holds out the glass of water as a genuine gesture, not a power play. Expression shifts from interrogator to someone offering real connection.",
        subAction: "Looks at the water, then at the Dom's face. Searches for the trick, the trap. Finds none. Accepts the water. Drinks. The hands holding the glass are trembling slightly — not from fear, but from the effort of letting the walls down.",
        mood: "The scene's emotional turning point. Adversaries become something more complex and honest.",
        durationNote: "5-8 min"
      },
      {
        phase: "The Revelation",
        domDialogue: "\"There it is. The real you. Not the operative, not the cover identity. You. I see you now, and I want you to know — whatever happens when this room opens again, this moment was real. You don't have to perform here. Not for me.\"",
        subDialogue: "\"Nobody's ever... wanted the real version before. They wanted the mission, the asset, the weapon. You're the first person to ask for the person underneath.\" (Voice breaks slightly) \"That's the most dangerous thing you could have done.\"",
        domAction: "Reaches forward and gently unbinds the Sub's wrists. Holds them for a moment — the first genuinely tender touch. Pulls the chair closer and sits facing the Sub, knees almost touching. This is no longer an interrogation — it's a confession from both sides.",
        subAction: "Watches the unbinding with wide eyes. When the hands are held, doesn't pull away. Lets the character crack fully — real emotion flowing through. May lean forward. The relief of being seen is overwhelming.",
        mood: "Raw, honest, electric. The power dynamic has been transcended. What remains is two people who have stripped each other bare.",
        durationNote: "5-7 min"
      },
      {
        phase: "Aftercare — Debriefing",
        domDialogue: "\"End scene. You were absolutely incredible. That resistance was so convincing — come here, I need to hold you. How deep did that go for you?\"",
        subDialogue: "\"Really deep. The unbinding moment... I actually got emotional. That felt like more than a scene. Thank you for making it safe enough to go there.\"",
        domAction: "Complete character break. Pulls the Sub into a tight embrace. Removes any remaining props or restraints. Wraps in comfort. Provides water, warmth. Extensive verbal praise for the Sub's performance and vulnerability.",
        subAction: "Melts into the comfort. Processes the intensity. May need extended physical contact. Shares which moments were most impactful. Appreciates the emotional safety.",
        mood: "Deep gratitude and intimacy. The shared intensity creates profound bonding.",
        durationNote: "10-15 min"
      }
    ]
  },
  {
    id: "rp-devoted-butler",
    title: "The Devoted Butler",
    category: "Service",
    setting: "The home transformed into a 'grand estate.' Living room is the drawing room, bedroom is the master suite. Table set formally for one. Soft classical or piano music. Warm, golden lighting.",
    duration: "60-90 min",
    intensity: 4,
    summary: "The Sub plays a perfectly trained butler or personal attendant devoted to serving their master/mistress (Dom). The scene covers an entire evening of attentive domestic service — from drawing a bath to serving dinner to preparing the bedroom. Every action is performed with meticulous care and deep devotion.",
    domAttire: "Loungewear that conveys luxury — a silk robe over comfortable clothing, or elegant pajamas. Slippers. Hair down and relaxed. Jewelry kept on. The appearance of someone who is completely at ease in their domain.",
    subAttire: "Formal service attire: a crisp white button-down shirt, black trousers or skirt, black shoes or stockings. An apron if desired. Hair neatly pulled back. A small towel draped over one arm. Immaculate presentation.",
    props: ["A serving tray", "Wine glass and bottle (or sparkling water)", "Cloth napkin", "Candles for the table", "Bath supplies — salts, oils, towels", "A small bell for summoning"],
    safetyNotes: "This is a low-intensity scene focused on attentive service and gentle control. The Dom should appreciate and praise the Sub's efforts generously. If the Sub is performing tasks like preparing food, ensure genuine safety. The beauty of this scene is in its quiet power.",
    beats: [
      {
        phase: "The Evening Begins",
        domDialogue: "(Rings the small bell once.) \"Good evening. I'll take my drink in the drawing room. The usual, please. And open the curtains — I want to see the evening sky.\"",
        subDialogue: "\"Good evening, ma'am/sir. Right away. Shall I light the candles as well? The evening is quite lovely tonight.\"",
        domAction: "Settles into the most comfortable chair. Picks up a book or phone. Radiates the calm of someone who knows their every need will be anticipated and met. Doesn't watch the Sub work — trusts them completely.",
        subAction: "Enters the room with a slight bow. Moves efficiently but gracefully — opens curtains, lights candles with a long match, prepares the drink on a tray. Presents the drink with a cloth napkin. Steps back to a standing position, hands clasped, awaiting further instruction.",
        mood: "Elegant tranquility. The power dynamic expressed through effortless domesticity.",
        durationNote: "7-10 min"
      },
      {
        phase: "Drawing the Bath",
        domDialogue: "\"I'd like my bath drawn. The lavender salts tonight, I think. And lay out my evening clothes on the bed. You know the ones I mean.\"",
        subDialogue: "\"Of course. Lavender salts with the eucalyptus oil — your preferred combination. I'll ensure the water is precisely right. Your evening attire will be pressed and ready.\"",
        domAction: "Continues reading while the Sub prepares the bath. Eventually, follows to the bathroom. Allows the Sub to test the water temperature. Nods approval. May comment: \"You always get the temperature right. It's one of your many gifts.\"",
        subAction: "Moves to the bathroom with quiet purpose. Runs the bath, testing temperature on the inside of the wrist. Adds salts and oil. Lays out towels — one for the floor, one folded on the rack, one warming. Selects clothing and presses it if needed. Returns to announce the bath is ready with a small bow.",
        mood: "Meditative service. Every detail attended to with love disguised as duty.",
        durationNote: "10-12 min"
      },
      {
        phase: "The Attendance",
        domDialogue: "\"Stay. You may attend me.\" (While being served:) \"Your hands are gentle tonight. Have you been practicing the technique I preferred?\"",
        subDialogue: "\"Always, ma'am/sir. Your comfort is the subject of my constant study. May I wash your shoulders?\"",
        domAction: "Enters the bath. Allows the Sub to attend — pouring water over shoulders, washing hair if desired, providing the soap. The vulnerability of being bathed creates intimate trust. Closes eyes and fully surrenders to being cared for.",
        subAction: "Kneels beside the bath on a towel. Pours water carefully. Lathers and rinses with practiced, tender movements. Anticipates needs — adjusts water temperature, provides more salts, keeps a warm towel ready. Every movement is an act of devotion.",
        mood: "Profound intimacy through service. The Sub's attentiveness is an expression of deep love.",
        durationNote: "12-15 min"
      },
      {
        phase: "Dinner Service",
        domDialogue: "\"Dinner was excellent tonight. Stand here — beside me, not behind me. I want to see you while I eat. Tell me about your day. What did you attend to in my absence?\"",
        subDialogue: "\"Thank you, ma'am/sir. Today I organized your correspondence, refreshed the flowers in the study, and mended the hem on your gray jacket. I hope everything meets your standard.\"",
        domAction: "Eats at the formally set table. Occasionally offers a bite of food to the Sub from their own fork — a gesture of favor that breaks protocol and shows affection. Listens attentively to the Sub's account of their day. Praises specific details.",
        subAction: "Stands at the indicated position. Serves each course smoothly. Refills wine/water when the glass reaches the halfway mark without being asked. When offered food directly, accepts with visible gratitude and a quiet \"Thank you, ma'am/sir.\" This small act of being fed means everything.",
        mood: "Quiet power and gentle generosity. The Dom's willingness to share from their plate is the scene's most intimate moment.",
        durationNote: "12-15 min"
      },
      {
        phase: "The Commendation",
        domDialogue: "\"Come here. Kneel. I want to say something to you, and I want you to hear it fully.\" (Places hand on the Sub's head) \"You have made my world more beautiful today. Every detail, every gesture, every quiet act of care — I notice all of it. You are invaluable to me. I need you to know that.\"",
        subDialogue: "(Eyes bright, voice thick with emotion) \"Serving you is not a duty, ma'am/sir. It is the greatest privilege of my life. To be seen, to be valued, to be needed — there is nothing I want more.\"",
        domAction: "Stands from the table. Waits for the Sub to kneel. Places a hand gently on top of their head — a gesture of blessing and ownership. Speaks slowly and deliberately, ensuring every word lands. Tilts the Sub's chin up to make eye contact during the most important words.",
        subAction: "Kneels gracefully. Receives the words with visible, genuine emotion. When chin is tilted up, eyes are brimming. The character and the person are indistinguishable. This moment of being seen and praised fills a deep need.",
        mood: "Emotional peak. Service acknowledged and honored. Both partners deeply moved.",
        durationNote: "5-7 min"
      },
      {
        phase: "Aftercare — Off Duty",
        domDialogue: "\"Scene's done, love. Come up here — you're off the clock. That was perfect. Every single moment. How do you feel?\"",
        subDialogue: "\"I feel so peaceful. Honestly, taking care of you like that... it fills me up. The commendation part made me cry a little. In a good way.\"",
        domAction: "Pulls the Sub up from kneeling. Settles together on the couch or bed. Removes any costume elements. Equal footing now — both relaxed and connected. Provides physical comfort and verbal appreciation.",
        subAction: "Transitions from service mode to partner mode. Physical closeness is important. Shares which parts of the service felt most fulfilling. Discusses any moments that were challenging or especially meaningful.",
        mood: "Warm, nourishing, deeply bonded. The service created a container for genuine love.",
        durationNote: "10-15 min"
      }
    ]
  },
  {
    id: "rp-midnight-masquerade",
    title: "The Midnight Masquerade",
    category: "Fantasy",
    setting: "The bedroom or living room transformed with fairy lights, candles, and draped fabrics. Masks are essential — even simple ones from a craft store. Music is orchestral, sweeping, romantic. The atmosphere should feel like stepping into another century.",
    duration: "50-70 min",
    intensity: 5,
    summary: "At a grand masquerade ball, a mysterious figure (Dom) selects one captivating stranger (Sub) from the crowd. Behind their masks, identities dissolve and new ones emerge. The scene explores desire, mystery, and the intoxicating freedom of being unknown — even to someone who knows you completely.",
    domAttire: "Dark formal wear — a suit jacket or vest over a dark shirt. A striking mask that covers the upper half of the face. Gloves (optional but powerful). A rose or pocket square in deep red. Cologne applied generously — scent is part of the character.",
    subAttire: "Something that makes them feel beautiful and mysterious — a dress with movement, or a fitted outfit with striking details. An ornate mask. One piece of statement jewelry. A light perfume or scented oil. The goal is to feel like a different, more daring version of themselves.",
    props: ["Two masks", "Fairy lights or candles", "A music playlist (orchestral/waltz)", "A single rose", "Wine or champagne glasses", "Optional: gloves for the Dom"],
    safetyNotes: "This scene is romantic and sensual rather than intense. The masks should be comfortable for extended wear. Discuss beforehand how far the 'strangers' will go — the scene as written ends at a kiss, but can extend. The power of this scene is in the fantasy and mystery.",
    beats: [
      {
        phase: "Across the Room",
        domDialogue: "(Does not speak yet. From across the room, raises a glass slightly in the Sub's direction. A silent acknowledgment. Then looks away — an invitation to be pursued.)",
        subDialogue: "(Does not speak yet. Catches the gesture. Heart quickens. Moves through the imaginary crowd, getting closer but not approaching directly. Pretends to examine something nearby.)",
        domAction: "Stands apart from the 'crowd' — leaning against a wall or standing near the window. Mask in place. Holds a glass with practiced elegance. Has noticed the Sub from the moment they entered. The raised glass is deliberate — a lure cast by a patient predator.",
        subAction: "Enters the space and feels the Dom's gaze before seeing them. Moves with conscious grace — aware of being watched. Gets closer in stages, each step a choice. The mask provides courage for a boldness that feels new.",
        mood: "Cinematic anticipation. Two masked strangers locked in a silent gravitational pull.",
        durationNote: "5-7 min"
      },
      {
        phase: "The First Words",
        domDialogue: "\"You've been circling me like a moth around flame. I should warn you — flames burn.\" (Offers the rose) \"But they're beautiful, aren't they?\"",
        subDialogue: "\"Moths aren't drawn to flame because it's safe. They're drawn because the light is irresistible.\" (Accepts the rose, brings it to their nose) \"And you, stranger... are very bright tonight.\"",
        domAction: "Approaches when the Sub is close enough. Presents the rose with a slight bow — old-world courtesy that feels genuine. Speaks through the mask with deliberate cadence. Eyes visible through the mask are locked on the Sub's with unmistakable interest.",
        subAction: "Accepts the rose with gloved or bare fingers. Holds it delicately. Returns the Dom's gaze through their own mask — emboldened by the anonymity. Steps closer than a stranger normally would. The dance has begun.",
        mood: "Poetic, electric, romantic. Language is heightened — both are playing characters braver than themselves.",
        durationNote: "5-7 min"
      },
      {
        phase: "The Dance",
        domDialogue: "\"Dance with me. No names, no histories. Just this music and whatever we become together in the next three minutes. Give me your hand.\"",
        subDialogue: "\"Three minutes? What makes you think I'll want to stop at three?\" (Places hand in the Dom's) \"Lead me.\"",
        domAction: "Extends one hand — palm up, inviting. The other hand goes to the Sub's waist with confident placement. Leads a slow dance — not formal steps, just swaying, turning, pulling close and releasing. Whispers observations: \"You move like you've been waiting for this.\"",
        subAction: "Follows the lead instinctively. One hand in the Dom's, the other on their shoulder. Allows themselves to be drawn close during the slow turns. When pulled in tight, presses cheek against the Dom's through the masks. The physical closeness tells a story words cannot.",
        mood: "Intoxicating intimacy. The dance is a conversation — push and pull, tension and surrender.",
        durationNote: "8-12 min"
      },
      {
        phase: "The Unmasking",
        domDialogue: "\"I want to see you. The real you — not the mask, not the mystery. Will you trust me that much?\" (Reaches for the Sub's mask slowly, giving them time to refuse) \"May I?\"",
        subDialogue: "\"Only if I can see you too. Both of us, or neither.\" (Reaches for the Dom's mask) \"Together. On three.\"",
        domAction: "Stops dancing. Both hands come to the edges of the Sub's mask. Waits for permission — the asking is as important as the action. When consent is given, removes the mask slowly, reverently, as if unveiling a work of art. Expression when seeing the Sub's full face: wonder, recognition, desire.",
        subAction: "Removes the Dom's mask at the same moment. The simultaneous reveal is powerful — both are exposed at the same instant. Neither flinches. The Sub's face shows vulnerability, excitement, and a breathless kind of trust.",
        mood: "The scene's crescendo. Masks off means pretense off. Two people choosing to truly see each other.",
        durationNote: "5-7 min"
      },
      {
        phase: "The Kiss",
        domDialogue: "(No words needed. Or, whispered:) \"There you are. I've been looking for you all night. All my life, maybe.\"",
        subDialogue: "(Whispered back:) \"You found me. Don't let go.\"",
        domAction: "One hand cups the Sub's face. The other pulls them in by the waist. The kiss is slow, deliberate, and full — not frantic but deeply intentional. This is a first kiss and a reunion simultaneously.",
        subAction: "Rises into the kiss. Both hands come up to hold the Dom's face. Returns the kiss with matching intention and tenderness. When it ends, rests forehead against the Dom's. Both breathe together.",
        mood: "Cinematic perfection. The kind of kiss that makes the world stop.",
        durationNote: "5 min"
      },
      {
        phase: "Aftercare — Reality Returns",
        domDialogue: "\"Okay... wow. That was magic. Actual magic. Come here, sit with me. Do you need anything? Water? A blanket?\"",
        subDialogue: "\"I just need you close. That unmasking moment — I felt so seen. Can we keep the fairy lights on? I want to stay in this feeling a little longer.\"",
        domAction: "Gently transitions. Keeps the ambiance — lights stay warm, music continues softly. Sits together on the couch or bed. Holds the Sub close. Discusses the experience — favorite moments, surprising feelings, what they'd want to explore further.",
        subAction: "Leans into partner's warmth. Shares emotional responses honestly. May keep one of the masks or the rose as a memento of the scene. Appreciates the effort and creativity.",
        mood: "Dreamy, grateful, deeply romantic. The magic of the scene lingers in the real world.",
        durationNote: "10-15 min"
      }
    ]
  },
  {
    id: "rp-domestic-discipline",
    title: "Coming Home Late",
    category: "Domestic",
    setting: "The living room or bedroom, arranged as it normally is. The power comes from the mundane setting — this is 'home' and the rules apply here. Dim lighting. The Dom has been waiting. A clock visible somewhere in the room.",
    duration: "35-50 min",
    intensity: 6,
    summary: "The Sub arrives home later than the agreed-upon time without adequate explanation. The Dom has been waiting — not with anger, but with calm, structured disappointment. The scene explores domestic discipline through conversation, accountability, and a consequence that reinforces the bond.",
    domAttire: "Whatever they'd normally wear at home — but composed. Not in disarray from worrying. Seated, controlled, patient. Perhaps a robe or comfortable but put-together clothing. The calm is deliberate and communicates: I am always in control here.",
    subAttire: "Whatever they were wearing 'out.' Coat still on when they enter. Slightly disheveled from the evening. Shoes that make noise on the floor — the entrance should be audible. Looking like someone who knows they've crossed a line.",
    props: ["A clock or phone showing the time", "The Sub's phone (to be 'surrendered')", "A chair positioned in the center of the room", "A blanket for aftercare"],
    safetyNotes: "This scene involves emotional intensity around rules and disappointment — not anger or genuine upset. The Dom should never yell or truly punish. The 'consequence' should be pre-agreed. This scene works because both partners understand the structure creates safety, not fear.",
    beats: [
      {
        phase: "The Entrance",
        domDialogue: "(Already seated. Does not look up from what they're doing. Lets the Sub stand in the doorway for ten full seconds.) \"What time is it?\"",
        subDialogue: "\"...It's late. I know. I should have called. I — \"",
        domAction: "Seated calmly — reading, working, or simply sitting. The composure is the punishment's first weapon. Doesn't stand or move toward the Sub. Asks the question without accusation — just facts. The flatness of the tone is more devastating than volume.",
        subAction: "Opens the door carefully — hoping the quiet will help. Sees the Dom waiting and freezes momentarily. Stands in the doorway, coat still on. The guilt is immediate and genuine. Begins to explain but trails off, knowing excuses won't help.",
        mood: "Quiet dread and loving accountability. The room feels both safe and consequential.",
        durationNote: "3-5 min"
      },
      {
        phase: "The Accounting",
        domDialogue: "\"Take off your coat. Put your phone on the table. Sit down.\" (Pause while the Sub complies) \"Now. What was our agreement about tonight?\"",
        subDialogue: "\"I was supposed to be home by ten. I was supposed to text if anything changed. I didn't do either of those things.\" (Pause) \"There's no good excuse. I lost track of time and I didn't prioritize our agreement.\"",
        domAction: "Watches each action — coat off, phone surrendered, sitting down. Nods once when satisfied with compliance. Asks questions that require the Sub to articulate the failure themselves. Doesn't supply the answers. Listens fully.",
        subAction: "Removes coat slowly. Places phone on the table — the surrender of it feels significant, like giving up a shield. Sits in the indicated chair. Answers honestly without deflection. Hands clasped in lap. Meets the Dom's eyes because looking away would be worse.",
        mood: "Structured accountability. Not punishment for its own sake, but clarity about why the rules exist.",
        durationNote: "5-7 min"
      },
      {
        phase: "The Consequence",
        domDialogue: "\"Thank you for your honesty. You know there's a consequence. Stand up and come here.\" (The consequence is pre-agreed — corner time, writing lines, or impact) \"This isn't because I'm angry. This is because our agreements matter. You matter. Now begin.\"",
        subDialogue: "\"Yes, Sir/Ma'am. I understand.\" (During the consequence:) \"I will respect our agreements. I will communicate when plans change. I will honor your time as I honor you.\"",
        domAction: "Administers the pre-agreed consequence with calm consistency. If impact: measured, not harsh. If corner time: sets a timer and checks in. If writing: provides paper and pen. Throughout, the Dom's demeanor is firm but caring — this is correction, not retribution.",
        subAction: "Accepts the consequence with grace. If speaking mantras or lines, says them with genuine meaning. Doesn't resist or argue — the submission is complete and willing. There may be tears — not from pain but from the emotional release of accountability.",
        mood: "Cathartic. The consequence is the container that allows both partners to process and move forward.",
        durationNote: "10-15 min"
      },
      {
        phase: "The Forgiveness",
        domDialogue: "\"It's done. Completely done. Come here.\" (Opens arms) \"You took that beautifully. I'm proud of you. The slate is clean — we don't carry this forward. You are forgiven, fully and completely.\"",
        subDialogue: "\"Thank you. I needed that — not just the consequence, but knowing that you care enough to hold me accountable. I'll do better. I promise.\"",
        domAction: "Opens arms for an embrace. Holds the Sub firmly — the grip shifts from authority to protection. Speaks forgiveness clearly and definitively. May kiss the Sub's forehead. Gets water, a blanket, comfort items. The care is immediate and wholehearted.",
        subAction: "Moves into the embrace. May cry from emotional release. Holds on tightly. Accepts the forgiveness without arguing or continuing to apologize — respects the Dom's declaration that it's finished. Breathes deeply. Feels clean.",
        mood: "Profound relief and deepened trust. The cycle completes: rupture, repair, reconnection.",
        durationNote: "5-7 min"
      },
      {
        phase: "Aftercare — Reconnection",
        domDialogue: "\"Scene's over. How was that for you? Was the consequence okay? Anything I said that hit too hard or not hard enough?\"",
        subDialogue: "\"It was perfect. The waiting when I walked in — that silence was the hardest part. I felt the weight of it. But the forgiveness... that was the best part. Knowing it's truly over.\"",
        domAction: "Full transition to partner mode. Wraps the Sub in a blanket. Provides snacks and water. Asks detailed debrief questions. Listens without judgment. Physical comfort — holding, stroking, grounding touch.",
        subAction: "Settles into comfort. Processes the emotional intensity. Identifies which moments were hardest and which felt most healing. Expresses gratitude for the structure and the care.",
        mood: "Safe, warm, honest. The discipline created deeper intimacy and trust.",
        durationNote: "10-15 min"
      }
    ]
  },
  {
    id: "rp-captive-treasure",
    title: "The Pirate's Captive",
    category: "Captive",
    setting: "A room with subdued lighting. A chair or area where the Sub can be 'held.' Ropes or scarves for loose binding. Adventurous, cinematic ambient music. Think candlelight and shadow — a captain's quarters on a ship.",
    duration: "45-60 min",
    intensity: 6,
    summary: "The Dom plays a charming, cunning pirate captain who has captured a valuable prisoner (Sub) — a noble, a merchant, or a rival captain's lover. The scene explores captor-captive dynamics with swashbuckling flair, witty banter, and the slow discovery that captivity with this particular captor might not be entirely unwelcome.",
    domAttire: "Pirate-inspired: a loose white or black shirt, partially unbuttoned. Dark pants tucked into boots or socks. A bandana, hat, or headscarf. A belt with a toy sword or empty scabbard. Rings. An attitude of rakish confidence and dangerous charm.",
    subAttire: "Noble or refined clothing, now 'disheveled' from capture: a blouse or dress shirt, wrinkled and partially untucked. Skirt or pants. Jewelry still on — a prize the pirate hasn't taken yet. Hair starting neat but progressively loosened. Barefoot (shoes 'lost' during capture).",
    props: ["Rope or silk scarves for light binding", "Candles", "A goblet or tankard", "A piece of jewelry the Sub wears (that becomes a plot point)", "A map or scroll (prop)", "A toy compass or coin"],
    safetyNotes: "Keep bindings loose and comfortable. The 'captive' scenario should feel adventurous, not threatening. The Sub should always feel they could stop the scene. Banter should be fun and flirty, not genuinely frightening. This is a swashbuckling romance, not a horror scene.",
    beats: [
      {
        phase: "The Capture",
        domDialogue: "\"Well, well. Look what my crew fished out of the wreckage. You're either very brave or very foolish to have been on that ship. Either way...\" (Pulls up a chair and sits backward on it, arms crossed on the back) \"...you're mine now.\"",
        subDialogue: "\"Unhand me, you scoundrel. Do you know who I am? When my people find out — \"",
        domAction: "Leads the bound Sub into the 'quarters.' Settles into the chair with theatrical confidence — a person completely at home in their own power. Studies the captive with open curiosity and barely concealed admiration. Spins a coin on the table while talking.",
        subAction: "Wrists loosely bound in front. Stumbles slightly on entry (theatrically). Draws up to full height despite the bonds. Chin lifted, eyes blazing with defiance. The nobility of bearing is genuine even in captivity. Struggles against the bonds for show.",
        mood: "Swashbuckling energy — danger laced with humor and undeniable chemistry.",
        durationNote: "5-7 min"
      },
      {
        phase: "The Negotiation",
        domDialogue: "\"Oh, I know exactly who you are. That's why you're in my quarters instead of the brig. Your family will pay a king's ransom for you. But I'm starting to wonder...\" (Leans forward) \"...if any amount of gold is worth more than the pleasure of your company.\"",
        subDialogue: "(Scoffs, but the defiance wavers) \"You think flattery will make me cooperate? You're a thief and a criminal.\" (Quieter) \"...though I admit, you're a more articulate one than I expected.\"",
        domAction: "Pours two drinks. Slides one toward the captive — an unexpected courtesy. Walks around them slowly, assessing. Reaches out and examines the jewelry the Sub is wearing without removing it. \"This is exquisite. Like its wearer.\" Keeps the tone light, charming, never threatening.",
        subAction: "Eyes the drink suspiciously but eventually accepts it (hands still bound, drinking carefully). Tracks the Dom's movement with wary interest. When the jewelry is touched, pulls back initially but then holds still — curious despite everything. The first crack in the resistance.",
        mood: "Cat and mouse with escalating flirtation. The Sub's resistance is genuine but their fascination is too.",
        durationNote: "7-10 min"
      },
      {
        phase: "The Revelation",
        domDialogue: "\"Let me tell you a secret, since we're being honest. I didn't capture your ship by accident. I've been following it for weeks. Tracking the shipping routes. Learning the crew patterns. All because the harbor master in Tortuga told me about a passenger so beautiful that sailors lost their heading just watching them board. I had to see for myself.\"",
        subDialogue: "(The defiance softens into genuine surprise) \"You... pursued my ship? All of this — the attack, the capture — was about me?\" (Sits down slowly) \"That's either the most romantic or most insane thing I've ever heard.\"",
        domAction: "Tells the story with genuine passion — this is a pirate who takes what they want, and what they wanted was this person. Crouches in front of the Sub's chair, looking up at them for the first time — a reversal of the power dynamic. \"Both, probably.\"",
        subAction: "The resistance fully cracks. Looks at the pirate with new eyes — not a captor, but a pursuer. Leans forward in the chair. The bound hands reach out tentatively and touch the Dom's face — a gesture of wonder rather than submission.",
        mood: "Romantic revelation. The kidnapping becomes a love story. Both characters are transformed.",
        durationNote: "5-8 min"
      },
      {
        phase: "The Choice",
        domDialogue: "\"Here's what's going to happen. I'm going to untie your hands. And then I'm going to open that door.\" (Points) \"Your freedom is twenty steps away. The lifeboat will reach shore by morning. Or...\" (Holds up the compass) \"...you stay. Not as my prisoner. As my equal. Choose.\"",
        subDialogue: "(Long pause. Looks at the door. Then back at the pirate. Extends bound hands toward the Dom.) \"Untie me.\" (When freed, flexes hands. Looks at the door again. Takes the compass from the Dom's hand.) \"Show me the stars from the deck. I want to see where we're going.\"",
        domAction: "Unties the bonds carefully, rubbing the Sub's wrists gently where the rope was. Steps back. The door is genuinely open — the choice must be real to be meaningful. When the Sub chooses to stay, the joy is barely contained. Takes their hand. \"Come. I'll show you everything.\"",
        subAction: "Rubs freed wrists. The moment of choice is played fully — genuinely considers the door. When they choose to stay, it's with conviction. Takes the Dom's hand firmly. Walks beside them, not behind. They are no longer captive and captor. They're partners.",
        mood: "Triumphant freedom and chosen devotion. Captivity becomes liberation.",
        durationNote: "5-7 min"
      },
      {
        phase: "Aftercare — Shore Leave",
        domDialogue: "\"Arrr, that was fun.\" (Laughing, breaking character completely) \"Your face when I said I'd been tracking your ship — priceless. Come here, you beautiful captive. How was that?\"",
        subDialogue: "\"When you opened the door and gave me the actual choice — that was everything. I didn't expect to get emotional about a pirate scene but here we are. Can we do this one again sometime?\"",
        domAction: "Full character break with laughter and warmth. Removes pirate accessories. Pulls the Sub close. Debriefs with humor and genuine curiosity about the Sub's experience. Provides comfort and celebrates the shared creativity.",
        subAction: "Laughs and relaxes. Takes off any costume pieces. Discusses favorite moments with animation. The shared silliness and genuine emotion create a unique bond. Keeps the compass or a prop as a memento.",
        mood: "Joyful, playful, deeply connected. Adventure creates bonding through shared imagination.",
        durationNote: "10-15 min"
      }
    ]
  }
];
