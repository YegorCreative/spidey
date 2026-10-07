import { getCatalog, hrefFor, performanceLabel } from "./catalog";
import type { Accent, MediaImage, MediaSet } from "./types";

export interface ArchiveCard {
  href: string;
  eyebrow: string;
  title: string;
  meta?: string;
  summary: string;
  accent: Accent;
  image?: MediaImage;
  cover?: { title: string; issue: string; year: number; tone: string };
  era?: string;
  sigil?: string;
  world?: string;
}

function still(image?: MediaImage, media?: MediaSet): MediaImage | undefined {
  return image ?? media?.poster ?? media?.thumbnail ?? media?.heroImage ?? media?.portrait;
}

const catalog = getCatalog();

export function movieCards(): ArchiveCard[] {
  return catalog.movies.map((movie) => {
    const universe = catalog.universe(movie.universeId);
    return {
      href: hrefFor("movie", movie.id),
      eyebrow: String(movie.year),
      title: movie.title,
      meta: universe.name,
      summary: movie.tagline,
      accent: universe.accent,
      image: still(movie.image, movie.media),
      world: movie.universeId,
    };
  });
}

export function seriesCards(): ArchiveCard[] {
  return catalog.series.map((show) => ({
    href: hrefFor("series", show.id),
    eyebrow: show.years,
    title: show.title,
    meta: show.medium === "animated" ? "Animated" : "Live-action",
    summary: show.summary,
    accent: "teal",
    image: still(show.image, show.media),
    world: show.universeId ?? "night",
  }));
}

export function comicCards(): ArchiveCard[] {
  return catalog.comics.map((comic) => ({
    href: hrefFor("comic", comic.id),
    eyebrow: String(comic.year),
    title: `${comic.title} ${comic.issue}`,
    meta: catalog.universe(comic.universeId).name,
    summary: comic.summary,
    accent: catalog.universe(comic.universeId).accent,
    image: still(comic.image, comic.media),
    cover: { title: comic.title, issue: comic.issue, year: comic.year, tone: comic.id },
  }));
}

export function actorCards(): ArchiveCard[] {
  return catalog.actors.map((actor) => ({
    href: hrefFor("actor", actor.id),
    eyebrow: performanceLabel(actor.performance),
    title: actor.name,
    meta: `${actor.primary.identity} · ${actor.primary.years}`,
    summary: actor.summary,
    accent: actor.primary.universeId ? catalog.universe(actor.primary.universeId).accent : "red",
    image: still(actor.image, actor.media),
    era: actor.primary.universeId ?? actor.id,
  }));
}

export function spiderCards(): ArchiveCard[] {
  return catalog.characters
    .filter((character) => character.kind === "spider-person")
    .map((character) => ({
      href: hrefFor("character", character.id),
      eyebrow: character.aliases[0] ?? "Spider-Person",
      title: character.name,
      meta: character.firstAppearance,
      summary: character.summary,
      accent: catalog.universe(character.universeIds[0]).accent,
      image: still(character.image, character.media),
      world: character.universeIds[0],
    }));
}

export function supportingCards(): ArchiveCard[] {
  return catalog.characters
    .filter((character) => character.kind === "supporting")
    .map((character) => ({
      href: hrefFor("character", character.id),
      eyebrow: "Supporting",
      title: character.name,
      meta: character.firstAppearance,
      summary: character.summary,
      accent: "blue",
      image: still(character.image, character.media),
    }));
}

export function characterCards(): ArchiveCard[] {
  return [...spiderCards(), ...supportingCards()];
}

export function villainCards(): ArchiveCard[] {
  return catalog.villains.map((villain) => ({
    href: hrefFor("villain", villain.id),
    eyebrow: villain.alterEgo,
    title: villain.name,
    meta: villain.firstAppearance,
    summary: villain.summary,
    accent: villain.accent,
    image: still(villain.image, villain.media),
    sigil: villain.id,
  }));
}

export function universeCards(): ArchiveCard[] {
  return catalog.universes.map((universe) => ({
    href: hrefFor("universe", universe.id),
    eyebrow: universe.designation,
    title: universe.name,
    meta: universe.medium,
    summary: universe.summary,
    accent: universe.accent,
    image: still(universe.image, universe.media),
    world: universe.id,
  }));
}

export function suitCards(): ArchiveCard[] {
  return catalog.suits.map((suit) => ({
    href: hrefFor("suit", suit.id),
    eyebrow: suit.era,
    title: suit.name,
    summary: suit.summary,
    accent: suit.accent,
    image: still(suit.image, suit.media),
    world: suit.universeIds[0],
  }));
}

export function creatorCards(): ArchiveCard[] {
  return catalog.creators.map((creator) => ({
    href: hrefFor("creator", creator.id),
    eyebrow: creator.roles.join(" · "),
    title: creator.name,
    summary: creator.summary,
    accent: "blue",
    image: still(creator.image, creator.media),
  }));
}
