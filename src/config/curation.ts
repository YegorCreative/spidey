export const nav = [
  { href: "/", label: "Home" },
  { href: "/movies/", label: "Movies" },
  { href: "/comics/", label: "Comics" },
  { href: "/series/", label: "Series" },
  { href: "/spider-people/", label: "Spider-People" },
  { href: "/characters/", label: "Characters" },
  { href: "/villains/", label: "Villains" },
  { href: "/universes/", label: "Universes" },
  { href: "/timeline/", label: "Timeline" },
  { href: "/explore/", label: "Explore" },
] as const;

export const screenActorIds = [
  "tobey-maguire",
  "andrew-garfield",
  "tom-holland",
  "shameik-moore",
] as const;

export const villainOrder = [
  "green-goblin",
  "doctor-octopus",
  "venom",
  "carnage",
  "mysterio",
  "sandman",
  "electro",
  "lizard",
  "vulture",
  "kraven",
] as const;

export const universeOrder = [
  "earth-616",
  "ultimate",
  "raimi",
  "webb",
  "mcu",
  "spider-verse-animated",
  "earth-928",
  "earth-90214",
  "earth-65",
] as const;

export const featuredComicIds = [
  "amazing-fantasy-15",
  "amazing-spider-man-300",
  "ultimate-spider-man-1",
  "ultimate-fallout-4",
] as const;

export const exploreItems = [
  {
    href: "/movies/",
    title: "Movies",
    description: "Film eras, from Raimi’s breakthrough to the animated Spider-Verse.",
    icon: "film",
    accent: "red",
  },
  {
    href: "/comics/",
    title: "Comics",
    description: "Issues, creators, and the stories the screen versions keep answering.",
    icon: "book",
    accent: "blue",
  },
  {
    href: "/series/",
    title: "Series",
    description: "Animated and live-action television, starting in 1967.",
    icon: "tv",
    accent: "teal",
  },
  {
    href: "/spider-people/",
    title: "Spider-People",
    description: "Peter, Miles, Gwen, Miguel, Noir — the people under the mask.",
    icon: "spider",
    accent: "magenta",
  },
  {
    href: "/villains/",
    title: "Villains",
    description: "The rogues’ gallery, from the Goblin and Doc Ock to Venom.",
    icon: "mask",
    accent: "green",
  },
  {
    href: "/universes/",
    title: "Universes",
    description: "Earth-616, the films, 2099, Noir, and the animated multiverse.",
    icon: "globe",
    accent: "gold",
  },
  {
    href: "/suits/",
    title: "Suits",
    description: "Classic red and blue, the black suit, Iron Spider, and beyond.",
    icon: "suit",
    accent: "cyan",
  },
  {
    href: "/timeline/",
    title: "Timeline",
    description: "Six decades of debuts, series, and films on one line.",
    icon: "hourglass",
    accent: "amber",
  },
] as const;
