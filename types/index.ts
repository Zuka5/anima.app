export type EntryType = "active_imagination" | "archetype" | "individuation";

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

export interface IndividuationProgress {
  id: string;
  user_id: string;
  current_stage: number;
  stage_notes: Record<string, string>;
  updated_at: string;
}

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
];
