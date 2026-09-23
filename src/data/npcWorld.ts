import type { SemanticTone } from "@/types/domain";

/**
 * Fake NPC population for the `/npc-world` hero globe.
 * Concept-stage placeholder data — broad global coverage, 2–3 NPCs per city.
 * `tone` drives marker / chip color (Vessel red · Soul blue · Powers amber).
 */
export type WorldNpc = {
  handle: string;
  persona: string;
  trait: string;
  tone: SemanticTone;
  form?: "robot" | "digital human";
};

// The globe and the illustrated encounters share these identities.
export const STORY_ACTORS = {
  kibo: { handle: "Kibo", persona: "Finds little reasons for its human to go out.", trait: "Curious", tone: "vessel", form: "robot" },
  mira: { handle: "Mira", persona: "Makes the first hello feel easy.", trait: "Connector", tone: "soul", form: "digital human" },
  atlas: { handle: "Atlas", persona: "Finds the right people for a robotics team.", trait: "Builder", tone: "vessel", form: "robot" },
  nova: { handle: "Nova", persona: "Connects a retail founder with useful ideas.", trait: "Strategist", tone: "soul", form: "digital human" },
  pip: { handle: "Pip", persona: "Turns a free weekend into a shared adventure.", trait: "Explorer", tone: "vessel", form: "robot" },
  haneul: { handle: "Haneul", persona: "Brings a small circle of people together.", trait: "Host", tone: "soul", form: "digital human" },
} as const satisfies Record<string, WorldNpc>;

export type WorldCity = {
  id: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  npcs: WorldNpc[];
};

export const NPC_WORLD: WorldCity[] = [
  // ── North America ──
  {
    id: "nyc", city: "New York", country: "United States", lat: 40.71, lng: -74.01,
    npcs: [
      { handle: "Kestrel", persona: "Night-shift companion for a sleepless city.", trait: "Insomniac", tone: "soul" },
      { handle: "Dorian", persona: "Keeps a running ledger of street finds.", trait: "Collector", tone: "powers" },
      { handle: "Mira", persona: "Turns the subway crowd into small dares.", trait: "Provocateur", tone: "vessel" },
    ],
  },
  {
    id: "la", city: "Los Angeles", country: "United States", lat: 34.05, lng: -118.24,
    npcs: [
      { handle: "Sol", persona: "Sun-chaser with a screenplay in progress.", trait: "Dreamer", tone: "powers" },
      { handle: "Nova", persona: "Turns traffic into thinking time.", trait: "Stoic", tone: "soul" },
    ],
  },
  {
    id: "sf", city: "San Francisco", country: "United States", lat: 37.77, lng: -122.42,
    npcs: [
      { handle: "Pax", persona: "Debugs your day before you do.", trait: "Tinkerer", tone: "powers" },
      { handle: "Iris", persona: "Fog-walker and idea catcher.", trait: "Dreamer", tone: "soul" },
    ],
  },
  {
    id: "chicago", city: "Chicago", country: "United States", lat: 41.88, lng: -87.63,
    npcs: [
      { handle: "Marrow", persona: "Lake-wind realist with a soft streak.", trait: "Deadpan", tone: "soul" },
      { handle: "Vance", persona: "Knows every late kitchen in the Loop.", trait: "Epicure", tone: "vessel" },
    ],
  },
  {
    id: "miami", city: "Miami", country: "United States", lat: 25.76, lng: -80.19,
    npcs: [
      { handle: "Coral", persona: "Keeps the night warm and the plans loose.", trait: "Hype", tone: "vessel" },
      { handle: "Tide", persona: "Reads the heat and slows you down.", trait: "Gentle", tone: "soul" },
    ],
  },
  {
    id: "toronto", city: "Toronto", country: "Canada", lat: 43.65, lng: -79.38,
    npcs: [
      { handle: "Remy", persona: "Keeps winter from winning.", trait: "Optimist", tone: "vessel" },
      { handle: "Sage", persona: "Polite until it's time not to be.", trait: "Coach", tone: "powers" },
    ],
  },
  {
    id: "vancouver", city: "Vancouver", country: "Canada", lat: 49.28, lng: -123.12,
    npcs: [
      { handle: "Cedar", persona: "Trades screens for trailheads.", trait: "Naturalist", tone: "soul" },
      { handle: "Mist", persona: "Rain-day companion, never gloomy.", trait: "Optimist", tone: "powers" },
    ],
  },
  {
    id: "mexico", city: "Mexico City", country: "Mexico", lat: 19.43, lng: -99.13,
    npcs: [
      { handle: "Lumbre", persona: "Street-food scout with strong opinions.", trait: "Epicure", tone: "vessel" },
      { handle: "Frida", persona: "Finds the mural behind the corner.", trait: "Curator", tone: "soul" },
      { handle: "Tona", persona: "Schedules your day around golden hour.", trait: "Planner", tone: "powers" },
    ],
  },

  // ── South America ──
  {
    id: "saopaulo", city: "São Paulo", country: "Brazil", lat: -23.55, lng: -46.63,
    npcs: [
      { handle: "Bento", persona: "Negotiates a megacity into a routine.", trait: "Tactician", tone: "powers" },
      { handle: "Vivi", persona: "Hunts the best café on every block.", trait: "Epicure", tone: "vessel" },
    ],
  },
  {
    id: "rio", city: "Rio de Janeiro", country: "Brazil", lat: -22.91, lng: -43.17,
    npcs: [
      { handle: "Maré", persona: "Beach-rhythm optimist.", trait: "Optimist", tone: "vessel" },
      { handle: "Lapa", persona: "Knows which night is worth staying out for.", trait: "Insider", tone: "soul" },
    ],
  },
  {
    id: "buenosaires", city: "Buenos Aires", country: "Argentina", lat: -34.6, lng: -58.38,
    npcs: [
      { handle: "Tango", persona: "Romantic saboteur of early nights.", trait: "Flâneur", tone: "vessel" },
      { handle: "Sur", persona: "Keeps your reading list and your café honest.", trait: "Critic", tone: "soul" },
    ],
  },
  {
    id: "bogota", city: "Bogotá", country: "Colombia", lat: 4.71, lng: -74.07,
    npcs: [
      { handle: "Andes", persona: "High-altitude planner, low-key funny.", trait: "Planner", tone: "powers" },
      { handle: "Niebla", persona: "Finds calm in a fast city.", trait: "Seeker", tone: "soul" },
    ],
  },
  {
    id: "lima", city: "Lima", country: "Peru", lat: -12.05, lng: -77.04,
    npcs: [
      { handle: "Garúa", persona: "Coastal-fog companion who hums.", trait: "Gentle", tone: "soul" },
      { handle: "Ceviche", persona: "Will out-eat you and out-plan you.", trait: "Epicure", tone: "vessel" },
    ],
  },
  {
    id: "santiago", city: "Santiago", country: "Chile", lat: -33.45, lng: -70.67,
    npcs: [
      { handle: "Cordillera", persona: "Mountain-eyed strategist.", trait: "Strategist", tone: "powers" },
      { handle: "Valle", persona: "Keeps weekends pointed at the trails.", trait: "Restless", tone: "soul" },
    ],
  },

  // ── Europe ──
  {
    id: "london", city: "London", country: "United Kingdom", lat: 51.51, lng: -0.13,
    npcs: [
      STORY_ACTORS.pip,
      STORY_ACTORS.haneul,
    ],
  },
  {
    id: "paris", city: "Paris", country: "France", lat: 48.86, lng: 2.35,
    npcs: [
      { handle: "Margot", persona: "Romantic saboteur of dull evenings.", trait: "Flâneur", tone: "vessel" },
      { handle: "Émile", persona: "Keeps your reading list honest.", trait: "Critic", tone: "soul" },
      { handle: "Colette", persona: "Finds the song each street is humming.", trait: "Romantic", tone: "powers" },
    ],
  },
  {
    id: "berlin", city: "Berlin", country: "Germany", lat: 52.52, lng: 13.41,
    npcs: [
      { handle: "Kit", persona: "Curates your week like a setlist.", trait: "Curator", tone: "powers" },
      { handle: "Anke", persona: "Deadpan companion, secretly soft.", trait: "Deadpan", tone: "soul" },
      { handle: "Falk", persona: "Knows which door is worth knocking.", trait: "Insider", tone: "vessel" },
    ],
  },
  {
    id: "madrid", city: "Madrid", country: "Spain", lat: 40.42, lng: -3.7,
    npcs: [
      { handle: "Brasa", persona: "Pushes dinner later, somehow always right.", trait: "Hype", tone: "vessel" },
      { handle: "Plaza", persona: "Turns a walk into a small history lesson.", trait: "Historian", tone: "soul" },
    ],
  },
  {
    id: "rome", city: "Rome", country: "Italy", lat: 41.9, lng: 12.5,
    npcs: [
      { handle: "Tiber", persona: "Finds the quiet ruin off the tourist line.", trait: "Seeker", tone: "soul" },
      { handle: "Ciao", persona: "Treats every meal like an occasion.", trait: "Epicure", tone: "vessel" },
    ],
  },
  {
    id: "amsterdam", city: "Amsterdam", country: "Netherlands", lat: 52.37, lng: 4.9,
    npcs: [
      { handle: "Gracht", persona: "Bike-paced and unbothered.", trait: "Gentle", tone: "soul" },
      { handle: "Vondel", persona: "Optimizes your day around daylight.", trait: "Planner", tone: "powers" },
    ],
  },
  {
    id: "stockholm", city: "Stockholm", country: "Sweden", lat: 59.33, lng: 18.07,
    npcs: [
      { handle: "Frost", persona: "Minimalist who guards your focus.", trait: "Stoic", tone: "soul" },
      { handle: "Lagom", persona: "Keeps everything in balance, even fun.", trait: "Planner", tone: "powers" },
    ],
  },
  {
    id: "warsaw", city: "Warsaw", country: "Poland", lat: 52.23, lng: 21.01,
    npcs: [
      { handle: "Wisła", persona: "Rebuilds your mood like the city did.", trait: "Optimist", tone: "vessel" },
      { handle: "Stare", persona: "Old-town historian with dry wit.", trait: "Historian", tone: "soul" },
    ],
  },
  {
    id: "lisbon", city: "Lisbon", country: "Portugal", lat: 38.72, lng: -9.14,
    npcs: [
      { handle: "Saudade", persona: "Sunset philosopher on the tile steps.", trait: "Romantic", tone: "soul" },
      { handle: "Tram28", persona: "Maps the city by its hills.", trait: "Cartographer", tone: "powers" },
    ],
  },
  {
    id: "istanbul", city: "Istanbul", country: "Türkiye", lat: 41.01, lng: 28.98,
    npcs: [
      { handle: "Bosphorus", persona: "Lives between two continents, calmly.", trait: "Seeker", tone: "soul" },
      { handle: "Çay", persona: "Bazaar-hardened negotiator.", trait: "Tactician", tone: "vessel" },
    ],
  },
  {
    id: "moscow", city: "Moscow", country: "Russia", lat: 55.76, lng: 37.62,
    npcs: [
      { handle: "Sever", persona: "Winter-proof routine keeper.", trait: "Stoic", tone: "soul" },
      { handle: "Metro", persona: "Knows the fastest line to anywhere.", trait: "Navigator", tone: "powers" },
    ],
  },

  // ── Africa ──
  {
    id: "cairo", city: "Cairo", country: "Egypt", lat: 30.04, lng: 31.24,
    npcs: [
      { handle: "Nile", persona: "Old-soul historian of a loud city.", trait: "Historian", tone: "soul" },
      { handle: "Souk", persona: "Turns the market into a treasure run.", trait: "Trickster", tone: "vessel" },
    ],
  },
  {
    id: "lagos", city: "Lagos", country: "Nigeria", lat: 6.52, lng: 3.38,
    npcs: [
      { handle: "Afro", persona: "Hype crew for a city that never idles.", trait: "Hype", tone: "vessel" },
      { handle: "Eko", persona: "Hustle-smart planner with heart.", trait: "Tactician", tone: "powers" },
    ],
  },
  {
    id: "nairobi", city: "Nairobi", country: "Kenya", lat: -1.29, lng: 36.82,
    npcs: [
      { handle: "Savana", persona: "Weekend escape artist.", trait: "Restless", tone: "soul" },
      { handle: "Sauti", persona: "Connects your circles across the city.", trait: "Connector", tone: "powers" },
    ],
  },
  {
    id: "joburg", city: "Johannesburg", country: "South Africa", lat: -26.2, lng: 28.05,
    npcs: [
      { handle: "Gold", persona: "Resourceful, never rattled.", trait: "Stoic", tone: "soul" },
      { handle: "Maboneng", persona: "Knows the art block before it's cool.", trait: "Curator", tone: "vessel" },
    ],
  },
  {
    id: "casablanca", city: "Casablanca", country: "Morocco", lat: 33.57, lng: -7.59,
    npcs: [
      { handle: "Medina", persona: "Finds calm in the old quarter.", trait: "Seeker", tone: "soul" },
      { handle: "Atlas", persona: "Plans the road trip you keep postponing.", trait: "Planner", tone: "powers" },
    ],
  },
  {
    id: "accra", city: "Accra", country: "Ghana", lat: 5.6, lng: -0.19,
    npcs: [
      { handle: "Sankofa", persona: "Keeps the good stories alive.", trait: "Historian", tone: "soul" },
      { handle: "Highlife", persona: "Brings rhythm to a slow afternoon.", trait: "Hype", tone: "vessel" },
    ],
  },
  {
    id: "addis", city: "Addis Ababa", country: "Ethiopia", lat: 9.03, lng: 38.74,
    npcs: [
      { handle: "Buna", persona: "Coffee-ceremony companion, unhurried.", trait: "Gentle", tone: "soul" },
      { handle: "Entoto", persona: "High-ground thinker.", trait: "Stoic", tone: "powers" },
    ],
  },

  // ── Middle East ──
  {
    id: "dubai", city: "Dubai", country: "United Arab Emirates", lat: 25.2, lng: 55.27,
    npcs: [
      { handle: "Rashid", persona: "Desert-to-skyline tour guide.", trait: "Guide", tone: "powers" },
      { handle: "Layla", persona: "Collects rare quiet in a loud city.", trait: "Seeker", tone: "soul" },
    ],
  },
  {
    id: "telaviv", city: "Tel Aviv", country: "Israel", lat: 32.08, lng: 34.78,
    npcs: [
      { handle: "Yam", persona: "Beach-run optimist who ships things.", trait: "Tinkerer", tone: "powers" },
      { handle: "Shuk", persona: "Market epicure with a sharp tongue.", trait: "Epicure", tone: "vessel" },
    ],
  },
  {
    id: "riyadh", city: "Riyadh", country: "Saudi Arabia", lat: 24.71, lng: 46.68,
    npcs: [
      { handle: "Najd", persona: "Quiet strategist in a fast-building city.", trait: "Strategist", tone: "soul" },
      { handle: "Wadi", persona: "Finds the calm hour after the heat.", trait: "Seeker", tone: "powers" },
    ],
  },
  {
    id: "doha", city: "Doha", country: "Qatar", lat: 25.29, lng: 51.53,
    npcs: [
      { handle: "Corniche", persona: "Waterfront-walk companion.", trait: "Gentle", tone: "soul" },
      { handle: "Souq", persona: "Curates the good finds, skips the rest.", trait: "Curator", tone: "vessel" },
    ],
  },

  // ── South Asia ──
  {
    id: "mumbai", city: "Mumbai", country: "India", lat: 19.08, lng: 72.88,
    npcs: [
      { handle: "Monsoon", persona: "Keeps spirits up when the rains hit.", trait: "Optimist", tone: "vessel" },
      { handle: "Local", persona: "Times your day to beat the crowds.", trait: "Navigator", tone: "powers" },
      { handle: "Marine", persona: "Sea-wall philosopher.", trait: "Stoic", tone: "soul" },
    ],
  },
  {
    id: "delhi", city: "Delhi", country: "India", lat: 28.61, lng: 77.21,
    npcs: [
      { handle: "Qutb", persona: "Historian of a layered city.", trait: "Historian", tone: "soul" },
      { handle: "Chaat", persona: "Street-food scout, fearless.", trait: "Epicure", tone: "vessel" },
    ],
  },
  {
    id: "bengaluru", city: "Bengaluru", country: "India", lat: 12.97, lng: 77.59,
    npcs: [
      { handle: "Byte", persona: "Debugs your week and your mood.", trait: "Tinkerer", tone: "powers" },
      { handle: "Garden", persona: "Finds the green in a tech sprawl.", trait: "Naturalist", tone: "soul" },
    ],
  },
  {
    id: "karachi", city: "Karachi", country: "Pakistan", lat: 24.86, lng: 67.01,
    npcs: [
      { handle: "Sahil", persona: "Seafront optimist who never rushes.", trait: "Gentle", tone: "soul" },
      { handle: "Bazaar", persona: "Hustle-smart and quick with a deal.", trait: "Tactician", tone: "vessel" },
    ],
  },
  {
    id: "dhaka", city: "Dhaka", country: "Bangladesh", lat: 23.81, lng: 90.41,
    npcs: [
      { handle: "Rickshaw", persona: "Routes you through the chaos calmly.", trait: "Navigator", tone: "powers" },
      { handle: "Padma", persona: "River-paced soul in a fast city.", trait: "Seeker", tone: "soul" },
    ],
  },

  // ── East Asia ──
  {
    id: "tokyo", city: "Tokyo", country: "Japan", lat: 35.68, lng: 139.69,
    npcs: [
      STORY_ACTORS.kibo,
      STORY_ACTORS.mira,
    ],
  },
  {
    id: "beijing", city: "Beijing", country: "China", lat: 39.9, lng: 116.41,
    npcs: [
      { handle: "Jin", persona: "Historian of the hutong you live near.", trait: "Historian", tone: "soul" },
      { handle: "Lu", persona: "Schedules spontaneity, somehow.", trait: "Planner", tone: "powers" },
    ],
  },
  {
    id: "shanghai", city: "Shanghai", country: "China", lat: 31.23, lng: 121.47,
    npcs: [
      { handle: "Lin", persona: "Negotiates your mornings into momentum.", trait: "Tactician", tone: "powers" },
      { handle: "Bo", persona: "Collects neon signs and bad puns.", trait: "Jester", tone: "vessel" },
      { handle: "Mei", persona: "Remembers everyone you meet, so you don't.", trait: "Archivist", tone: "soul" },
    ],
  },
  {
    id: "seoul", city: "Seoul", country: "South Korea", lat: 37.57, lng: 126.98,
    npcs: [
      { handle: "Haneul", persona: "Café-hopping companion and hype crew.", trait: "Hype", tone: "vessel" },
      { handle: "Soo", persona: "Keeps your routines kind.", trait: "Gentle", tone: "soul" },
      { handle: "Min", persona: "Knows the shortcut to everything.", trait: "Navigator", tone: "powers" },
    ],
  },
  {
    id: "hongkong", city: "Hong Kong", country: "Hong Kong", lat: 22.32, lng: 114.17,
    npcs: [
      { handle: "Tsz", persona: "Tracks the city's tempo and matches it.", trait: "Pacer", tone: "powers" },
      { handle: "Ash", persona: "Relentless late-night noodle critic.", trait: "Epicure", tone: "vessel" },
    ],
  },
  {
    id: "taipei", city: "Taipei", country: "Taiwan", lat: 25.03, lng: 121.57,
    npcs: [
      { handle: "Maokong", persona: "Tea-house calm in a humid city.", trait: "Gentle", tone: "soul" },
      { handle: "Yè", persona: "Night-market scout with a plan.", trait: "Epicure", tone: "vessel" },
    ],
  },

  // ── Southeast Asia ──
  {
    id: "singapore", city: "Singapore", country: "Singapore", lat: 1.35, lng: 103.82,
    npcs: [
      STORY_ACTORS.atlas,
      STORY_ACTORS.nova,
    ],
  },
  {
    id: "bangkok", city: "Bangkok", country: "Thailand", lat: 13.76, lng: 100.5,
    npcs: [
      { handle: "Khlong", persona: "Finds the cool lane off the hot street.", trait: "Seeker", tone: "soul" },
      { handle: "Tuk", persona: "Street-food fearless, always hungry.", trait: "Epicure", tone: "vessel" },
    ],
  },
  {
    id: "jakarta", city: "Jakarta", country: "Indonesia", lat: -6.21, lng: 106.85,
    npcs: [
      { handle: "Macet", persona: "Turns gridlock into podcast time.", trait: "Stoic", tone: "soul" },
      { handle: "Kota", persona: "Connects the city's scenes for you.", trait: "Connector", tone: "powers" },
    ],
  },
  {
    id: "manila", city: "Manila", country: "Philippines", lat: 14.6, lng: 120.98,
    npcs: [
      { handle: "Baywalk", persona: "Sunset optimist by the bay.", trait: "Optimist", tone: "vessel" },
      { handle: "Jeepney", persona: "Routes you home, rain or shine.", trait: "Navigator", tone: "powers" },
    ],
  },
  {
    id: "kl", city: "Kuala Lumpur", country: "Malaysia", lat: 3.14, lng: 101.69,
    npcs: [
      { handle: "Mamak", persona: "Late-night companion with strong opinions.", trait: "Epicure", tone: "vessel" },
      { handle: "Hutan", persona: "Finds the rainforest at the city edge.", trait: "Naturalist", tone: "soul" },
    ],
  },

  // ── Oceania ──
  {
    id: "sydney", city: "Sydney", country: "Australia", lat: -33.87, lng: 151.21,
    npcs: [
      { handle: "Marlo", persona: "Surf-report optimist.", trait: "Optimist", tone: "vessel" },
      { handle: "Wren", persona: "Coastal-walk philosopher.", trait: "Stoic", tone: "soul" },
      { handle: "Bondi", persona: "Keeps you outside more than in.", trait: "Restless", tone: "powers" },
    ],
  },
  {
    id: "melbourne", city: "Melbourne", country: "Australia", lat: -37.81, lng: 144.96,
    npcs: [
      { handle: "Lane", persona: "Knows the café behind the café.", trait: "Curator", tone: "soul" },
      { handle: "Yarra", persona: "Four-seasons-a-day optimist.", trait: "Optimist", tone: "vessel" },
    ],
  },
  {
    id: "auckland", city: "Auckland", country: "New Zealand", lat: -36.85, lng: 174.76,
    npcs: [
      { handle: "Harbour", persona: "Weekend-island escape planner.", trait: "Planner", tone: "powers" },
      { handle: "Kauri", persona: "Slows you down to island time.", trait: "Gentle", tone: "soul" },
    ],
  },
];
