export type EntryType =
  | "active_imagination"
  | "archetype"
  | "individuation"
  | "word_association"
  | "dream";

export interface JournalEntry {
  id: string;
  user_id: string;
  entry_type: EntryType;
  content: string;
  ai_response: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface Session {
  id: string;
  user_id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface WordAssociationEntry {
  word: string;
  response: string;
  reactionTimeMs: number;
}

export interface ExtractedSymbol {
  symbol: string;
  category: "shadow" | "anima" | "animus" | "self" | "persona" | "other";
  amplification?: string;
}

export interface DreamEntry {
  narrative: string;
  mood: string;
  bigDream: boolean;
  symbols: ExtractedSymbol[];
  date: string;
}

export interface IndividuationProgress {
  id: string;
  user_id: string;
  current_stage: number;
  stage_notes: Record<string, string>;
  updated_at: string;
}

// Classic Jungian stimulus words from "Studies in Word Association" (1904-1909)
export const JUNG_WORDS: string[] = [
  "head",    "green",   "water",   "sing",    "dead",    "long",    "ship",    "pay",
  "window",  "friendly","table",   "cold",    "dream",   "dance",   "village", "lake",
  "sick",    "pride",   "fire",    "ink",     "angry",   "needle",  "journey", "blue",
  "lamp",    "sin",     "bread",   "rich",    "tree",    "sharp",   "pity",    "yellow",
  "mountain","dying",   "salt",    "new",     "habit",   "prayer",  "money",   "foolish",
  "letter",  "despise", "finger",  "costly",  "bird",    "fall",    "book",    "unjust",
  "frog",    "separate","hunger",  "white",   "child",   "care",    "pencil",  "sad",
  "plum",    "marry",   "house",   "dear",    "glass",   "quarrel", "fur",     "large",
  "strange", "paint",   "part",    "old",     "flower",  "beat",    "box",     "wild",
  "family",  "wash",    "cow",     "stranger","luck",    "lie",     "duty",    "narrow",
  "brother", "fear",    "false",   "anxiety", "kiss",    "bride",   "pure",    "door",
  "choose",  "hay",     "content", "ridicule","sleep",   "month",   "gentle",  "woman",
  "shadow",  "gold",    "abyss",   "self",
];

export const INDIVIDUATION_STAGES = [
  {
    index: 0,
    name: "Persona",
    subtitle: "The Mask We Wear",
    description:
      "The Persona is the social mask — the face we present to the outer world. It is necessary for social life, but danger lies in identifying with it completely, forgetting that it is only one layer of the psyche.",
    prompt:
      "Reflect on the roles and masks you wear in daily life. Which persona do you present to the world, and how does it differ from your inner life?",
  },
  {
    index: 1,
    name: "Shadow",
    subtitle: "The Dark Mirror",
    description:
      "The Shadow contains everything the ego has denied, repressed, or never acknowledged. It is the sum of all personal and collective psychic elements which, because of their incompatibility with the chosen conscious attitude, are denied expression in life.",
    prompt:
      "What qualities in others trigger a strong reaction in you — jealousy, contempt, or admiration? These often reflect aspects of your own shadow. What parts of yourself have you disowned?",
  },
  {
    index: 2,
    name: "Anima / Animus",
    subtitle: "The Inner Opposite",
    description:
      "The Anima (in men) and Animus (in women) represent the contra-sexual aspect of the psyche — the inner feminine or masculine. It forms the bridge between the personal and collective unconscious.",
    prompt:
      "Explore your relationship with the opposite-sex archetype within you. How does the inner feminine or masculine manifest in your dreams, relationships, or creative life?",
  },
  {
    index: 3,
    name: "The Self",
    subtitle: "Center and Totality",
    description:
      "The Self is the central archetype — the organizing principle of the entire psyche. It encompasses both conscious and unconscious, representing the totality of the individual. The Self often appears in dreams as a divine figure, a mandala, or a wise old person.",
    prompt:
      "Have you encountered moments of deep inner wholeness — in nature, meditation, art, or dreams? Describe an experience where you felt connected to something larger than your ego.",
  },
  {
    index: 4,
    name: "Integration",
    subtitle: "The Ongoing Work",
    description:
      "Individuation is not a destination but a lifelong process. Integration means holding the tension of opposites — light and shadow, masculine and feminine, conscious and unconscious — without resolving them prematurely. The integrated psyche is not perfect; it is whole.",
    prompt:
      "Looking back on your individuation journey so far, what has changed in how you understand yourself? What tensions do you still carry, and can you begin to hold them with compassion?",
  },
];

export const ARCHETYPES = [
  {
    id: "shadow",
    name: "The Shadow",
    symbol: "🌑",
    description:
      "The repository of everything the ego refuses to acknowledge — the dark twin, the hidden self. The Shadow is not evil; it is unrealized potential, the gold in the darkness.",
    question:
      "What do you most dislike in others? What qualities do you judge harshly in the world?",
  },
  {
    id: "anima",
    name: "Anima",
    symbol: "🌙",
    description:
      "The feminine soul-image in a man's psyche — muse, guide, and temptress. She manifests in dreams, in fascination with certain women, in moods that seem to come from nowhere.",
    question:
      "How does the feminine manifest in your inner life? What draws you, haunts you, inspires you?",
  },
  {
    id: "animus",
    name: "Animus",
    symbol: "☀️",
    description:
      "The masculine spirit in a woman's psyche — the inner authority, the logos principle. He can appear as inner critic, hero, or wise guide.",
    question:
      "How does the masculine principle show up in your inner life — as critic, protector, or creative force?",
  },
  {
    id: "hero",
    name: "The Hero",
    symbol: "⚔️",
    description:
      "The archetype of transformation through ordeal. The Hero's journey is always inward — slaying the dragon of unconsciousness to retrieve the treasure of self-knowledge.",
    question:
      "What inner dragons are you currently fighting? What treasure lies on the other side of that struggle?",
  },
  {
    id: "wise-old-man",
    name: "Wise Old Man",
    symbol: "🔮",
    description:
      "The archetype of meaning, spirit, and wisdom. He appears in dreams as a guide, a teacher, or a mysterious stranger who offers the key at the crucial moment.",
    question:
      "What wisdom do you already carry but haven't yet claimed as your own? What does your inner elder know?",
  },
  {
    id: "great-mother",
    name: "The Great Mother",
    symbol: "🌊",
    description:
      "The primal archetype of nature, fertility, and the unconscious itself. She is both nurturing and devouring — the womb and the tomb. She governs the mysteries of birth, transformation, and death.",
    question:
      "How does the maternal principle shape your relationship with yourself, with nature, with the creative?",
  },
  {
    id: "trickster",
    name: "The Trickster",
    symbol: "🎭",
    description:
      "The agent of chaos, paradox, and transformation. The Trickster breaks rigid patterns, disrupts the status quo, and — through seemingly destructive play — opens new possibilities.",
    question:
      "Where in your life is chaos trying to break through? What rigid pattern needs to be disrupted?",
  },
  {
    id: "self",
    name: "The Self",
    symbol: "☯️",
    description:
      "The archetype of wholeness — the central ordering principle of the psyche. The Self is not the ego but its ground, appearing as mandala, as divine child, as the eternal center that holds all opposites.",
    question:
      "When have you felt most whole — most fully yourself? What conditions allow that wholeness to emerge?",
  },
];

export const PAINTINGS = [
  {
    title: "Wanderer above the Sea of Fog",
    artist: "Caspar David Friedrich",
    year: 1818,
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg/800px-Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg",
    archetypalNote: "The Hero at the threshold — the known world behind, the unconscious stretching infinitely before.",
  },
  {
    title: "The Starry Night",
    artist: "Vincent van Gogh",
    year: 1889,
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
    archetypalNote: "The numinous cosmos — the Self as infinite swirling field of energy, vast and indifferent and alive.",
  },
  {
    title: "The Eye Like a Strange Balloon Mounts Toward Infinity",
    artist: "Odilon Redon",
    year: 1882,
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Odilon_Redon_-_The_Eye_Like_a_Strange_Balloon_Mounts_Toward_Infinity_-_Google_Art_Project.jpg/800px-Odilon_Redon_-_The_Eye_Like_a_Strange_Balloon_Mounts_Toward_Infinity_-_Google_Art_Project.jpg",
    archetypalNote: "The single eye of consciousness, ascending — the witness archetype, rising above the ordinary world.",
  },
  {
    title: "The Fighting Temeraire",
    artist: "J.M.W. Turner",
    year: 1839,
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Turner%2C_J._M._W._-_The_Fighting_T%C3%A9m%C3%A9raire_tugged_to_her_last_Berth_to_be_broken_up%2C_1838.jpg/1280px-Turner%2C_J._M._W._-_The_Fighting_T%C3%A9m%C3%A9raire_tugged_to_her_last_Berth_to_be_broken_up%2C_1838.jpg",
    archetypalNote: "The death of the Persona — the old heroic self dragged to its dissolution by the forces of the new.",
  },
  {
    title: "Saturn Devouring His Son",
    artist: "Francisco Goya",
    year: 1823,
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Goya-Saturn-Devouring-His-Son.jpg/800px-Goya-Saturn-Devouring-His-Son.jpg",
    archetypalNote: "The devouring father — the Shadow of authority, the complex that consumes the new before it can grow.",
  },
  {
    title: "Isle of the Dead",
    artist: "Arnold Böcklin",
    year: 1883,
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/B%C3%B6cklin_-_B%C3%B6cklin_Arnold_Die_Toteninsel_III_%28Alte_Nationalgalerie%2C_Berlin%29.jpg/1280px-B%C3%B6cklin_-_B%C3%B6cklin_Arnold_Die_Toteninsel_III_%28Alte_Nationalgalerie%2C_Berlin%29.jpg",
    archetypalNote: "The threshold between worlds — the psyche in transit, approaching its own depths.",
  },
  {
    title: "The Nightmare",
    artist: "Henry Fuseli",
    year: 1781,
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/The_Nightmare_Henry_Fuseli.jpg/1280px-The_Nightmare_Henry_Fuseli.jpg",
    archetypalNote: "The incubus of the unconscious — the night terror that sits upon the sleeping ego, an image of the oppressive complex.",
  },
  {
    title: "The Scream",
    artist: "Edvard Munch",
    year: 1893,
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/800px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg",
    archetypalNote: "The Shadow erupting — the existential dread that surges from the depths when the mask of the Persona dissolves.",
  },
  {
    title: "Ophelia",
    artist: "John Everett Millais",
    year: 1852,
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/John_Everett_Millais_-_Ophelia_-_Google_Art_Project.jpg/1280px-John_Everett_Millais_-_Ophelia_-_Google_Art_Project.jpg",
    archetypalNote: "The submerged Anima — the feminine soul overcome by unconscious waters, surrendered entirely to the depths.",
  },
  {
    title: "The Kiss",
    artist: "Gustav Klimt",
    year: 1908,
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg/800px-The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg",
    archetypalNote: "Coniunctio — the alchemical union of opposites, the sacred marriage of Anima and Animus dissolving into oneness.",
  },
  {
    title: "Melancholia I",
    artist: "Albrecht Dürer",
    year: 1514,
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Melencolia_I_%28Durero%29.jpg/800px-Melencolia_I_%28Durero%29.jpg",
    archetypalNote: "The nigredo of the soul — the creative paralysis before transformation, the dark night that precedes illumination.",
  },
  {
    title: "The Garden of Earthly Delights (detail)",
    artist: "Hieronymus Bosch",
    year: 1515,
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/The_Garden_of_earthly_delights.jpg/1280px-The_Garden_of_earthly_delights.jpg",
    archetypalNote: "The collective unconscious made visible — a psychic landscape where shadow contents move freely, uncensored by the waking ego.",
  },
  {
    title: "Sphinx",
    artist: "Franz von Stuck",
    year: 1904,
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Franz_von_Stuck_-_Die_Sphinx.jpg/800px-Franz_von_Stuck_-_Die_Sphinx.jpg",
    archetypalNote: "The riddle of the unconscious — the Anima as fateful enigma, keeper of the question that only the Hero's self-knowledge can answer.",
  },
  {
    title: "The Birth of Venus",
    artist: "Sandro Botticelli",
    year: 1486,
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg/1280px-Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg",
    archetypalNote: "The Anima rising from the collective unconscious — beauty, eros, and the soul emerging whole from the primordial waters.",
  },
  {
    title: "The Lady of Shalott",
    artist: "John William Waterhouse",
    year: 1888,
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/John_William_Waterhouse_-_The_Lady_of_Shalott_-_1888.jpg/800px-John_William_Waterhouse_-_The_Lady_of_Shalott_-_1888.jpg",
    archetypalNote: "The soul imprisoned by its own mirror — the psyche that sees the world only as reflection, not yet able to face reality directly.",
  },
  {
    title: "Hylas and the Nymphs",
    artist: "John William Waterhouse",
    year: 1896,
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Waterhouse_Hylas_and_the_Nymphs_Manchester_Art_Gallery_1896.15.jpg/1280px-Waterhouse_Hylas_and_the_Nymphs_Manchester_Art_Gallery_1896.15.jpg",
    archetypalNote: "The hero drawn into the depths by the Anima — the pull of the unconscious disguised as beauty, enchantment, and the lure of dissolution.",
  },
  {
    title: "Proserpine",
    artist: "Dante Gabriel Rossetti",
    year: 1874,
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Rossetti_Prosperine.jpg/800px-Rossetti_Prosperine.jpg",
    archetypalNote: "The Anima in captivity — the soul caught between two worlds, belonging fully to neither the conscious light nor the underworld dark.",
  },
  {
    title: "The Tower of Babel",
    artist: "Pieter Bruegel the Elder",
    year: 1563,
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Pieter_Bruegel_the_Elder_-_The_Tower_of_Babel_%28Vienna%29_-_Google_Art_Project_-_edited.jpg/1280px-Pieter_Bruegel_the_Elder_-_The_Tower_of_Babel_%28Vienna%29_-_Google_Art_Project_-_edited.jpg",
    archetypalNote: "Inflation of the ego — the collective hubris that drives the psyche to storm heaven, only to fracture into a thousand fragments.",
  },
  {
    title: "Judith Slaying Holofernes",
    artist: "Artemisia Gentileschi",
    year: 1620,
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Artemisia_Gentileschi_-_Judith_Slaying_Holofernes_-_WGA8563.jpg/800px-Artemisia_Gentileschi_-_Judith_Slaying_Holofernes_-_WGA8563.jpg",
    archetypalNote: "The Shadow confronted and severed — the feminine principle acting with fierce clarity to liberate the psyche from its oppressor.",
  },
  {
    title: "The Ambassadors",
    artist: "Hans Holbein the Younger",
    year: 1533,
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Hans_Holbein_the_Younger_-_The_Ambassadors_-_Google_Art_Project.jpg/800px-Hans_Holbein_the_Younger_-_The_Ambassadors_-_Google_Art_Project.jpg",
    archetypalNote: "Memento mori — the anamorphic skull hidden in plain sight, the death that underlies all worldly power, invisible until you change your angle of view.",
  },
  {
    title: "Primavera",
    artist: "Sandro Botticelli",
    year: 1480,
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Botticelli-primavera.jpg/1280px-Botticelli-primavera.jpg",
    archetypalNote: "The garden of the collective unconscious — Mercury, Venus, the Graces, and Zephyr in a dance that maps the soul's archetypal forces in relation.",
  },
  {
    title: "Wheatfield with Crows",
    artist: "Vincent van Gogh",
    year: 1890,
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Vincent_van_Gogh_-_Wheat_Field_with_Crows_-_Google_Art_Project.jpg/1280px-Vincent_van_Gogh_-_Wheat_Field_with_Crows_-_Google_Art_Project.jpg",
    archetypalNote: "The road that ends — the final confrontation between the ego's desire to go on and the Self's summons toward dissolution and wholeness.",
  },
  {
    title: "The Three Ages of Woman",
    artist: "Gustav Klimt",
    year: 1905,
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Gustav_Klimt_017.jpg/800px-Gustav_Klimt_017.jpg",
    archetypalNote: "The Great Mother in her triple aspect — maiden, mother, and crone, the full arc of the Anima from innocence through fullness to wisdom.",
  },
  {
    title: "Circe Offering the Cup to Ulysses",
    artist: "John William Waterhouse",
    year: 1891,
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Circe_Offering_the_Cup_to_Ulysses.jpg/800px-Circe_Offering_the_Cup_to_Ulysses.jpg",
    archetypalNote: "The Anima as transformer — the enchantress who offers the cup of dissolution; to drink is to be changed, to refuse is to miss the initiation.",
  },
];

