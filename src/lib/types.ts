export type Accent =
  | "red"
  | "amber"
  | "blue"
  | "teal"
  | "gold"
  | "magenta"
  | "cyan"
  | "slate"
  | "green"
  | "sand"
  | "pink"
  | "rust"
  | "violet";

export type RefType =
  | "movie"
  | "series"
  | "comic"
  | "actor"
  | "character"
  | "villain"
  | "suit"
  | "universe"
  | "creator"
  | "timeline";

export interface Credit {
  actorId?: string;
  identity?: string;
  characterId?: string;
  villainId?: string;
}

export interface MediaImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  credit?: string;
  source?: string;
  /** Permission or usage note. Leave empty until an authorized file exists. */
  license?: string;
}

/** Future authorized stills. Do not fill with scraped or unlicensed URLs. */
export interface MediaSet {
  heroImage?: MediaImage;
  thumbnail?: MediaImage;
  poster?: MediaImage;
  portrait?: MediaImage;
  gallery?: MediaImage[];
}

export interface Movie {
  id: string;
  title: string;
  year: number;
  releaseDate: string;
  tagline: string;
  summary: string;
  universeId: string;
  directorIds: string[];
  portrayals: Credit[];
  antagonists: Credit[];
  suitIds: string[];
  comicIds: string[];
  characterIds?: string[];
  runtimeMinutes?: number;
  image?: MediaImage;
  media?: MediaSet;
}

export interface Series {
  id: string;
  title: string;
  years: string;
  yearStart: number;
  yearEnd?: number;
  medium: "animated" | "live-action";
  summary: string;
  network?: string;
  universeId?: string;
  characterIds: string[];
  cast: Credit[];
  image?: MediaImage;
  media?: MediaSet;
}

export interface Comic {
  id: string;
  title: string;
  issue: string;
  year: number;
  coverDate: string;
  summary: string;
  universeId: string;
  writerIds: string[];
  artistIds: string[];
  characterIds: string[];
  villainIds: string[];
  arc?: string;
  image?: MediaImage;
  media?: MediaSet;
}

export interface ActorPrimary {
  identity: string;
  years: string;
  characterId?: string;
  villainId?: string;
  universeId?: string;
}

export interface Actor {
  id: string;
  name: string;
  performance: "live-action" | "voice";
  summary: string;
  primary: ActorPrimary;
  image?: MediaImage;
  media?: MediaSet;
}

export interface Character {
  id: string;
  name: string;
  aliases: string[];
  kind: "spider-person" | "supporting";
  summary: string;
  universeIds: string[];
  firstAppearance?: string;
  image?: MediaImage;
  media?: MediaSet;
}

export interface Villain {
  id: string;
  name: string;
  alterEgo: string;
  summary: string;
  universeIds: string[];
  accent: Accent;
  firstAppearance?: string;
  image?: MediaImage;
  media?: MediaSet;
}

export interface Universe {
  id: string;
  name: string;
  designation: string;
  medium: string;
  summary: string;
  accent: Accent;
  image?: MediaImage;
  media?: MediaSet;
}

export interface Suit {
  id: string;
  name: string;
  summary: string;
  era: string;
  characterIds: string[];
  universeIds: string[];
  accent: Accent;
  image?: MediaImage;
  media?: MediaSet;
}

export interface Creator {
  id: string;
  name: string;
  roles: string[];
  summary: string;
  image?: MediaImage;
  media?: MediaSet;
}

export interface TimelineEvent {
  id: string;
  year: number;
  title: string;
  summary: string;
  kind: "comic" | "series" | "movie" | "milestone";
  refs: { type: RefType; id: string }[];
}

export interface LinkItem {
  href: string;
  label: string;
  meta?: string;
}

export interface ProfileModel {
  crumbs: { href?: string; label: string }[];
  kicker: string;
  title: string;
  lede: string;
  accent: Accent;
  facts: { label: string; value: string }[];
  groups: { title: string; links: LinkItem[] }[];
}

export interface SearchDoc {
  id: string;
  type: RefType;
  typeLabel: string;
  title: string;
  summary: string;
  href: string;
  keywords: string;
}
