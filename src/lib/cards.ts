import { getCatalog, hrefFor, performanceLabel } from "./catalog";
import type { Accent, MediaImage } from "./types";

export interface ArchiveCard {
  href: string;
  eyebrow: string;
  title: string;
  meta?: string;
  summary: string;
  accent: Accent;
  image?: MediaImage;
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
      image: movie.image,
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
    image: show.image,
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
    image: comic.image,
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
    image: actor.image,
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
      image: character.image,
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
      image: character.image,
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
    image: villain.image,
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
    image: universe.image,
  }));
}

export function suitCards(): ArchiveCard[] {
  return catalog.suits.map((suit) => ({
    href: hrefFor("suit", suit.id),
    eyebrow: suit.era,
    title: suit.name,
    summary: suit.summary,
    accent: suit.accent,
    image: suit.image,
  }));
}

export function creatorCards(): ArchiveCard[] {
  return catalog.creators.map((creator) => ({
    href: hrefFor("creator", creator.id),
    eyebrow: creator.roles.join(" · "),
    title: creator.name,
    summary: creator.summary,
    accent: "blue",
    image: creator.image,
  }));
}
