import {
  featuredComicIds,
  previewTimelineIds,
  screenActorIds,
  universeOrder,
  villainOrder,
} from "../config/curation";
import { href } from "./paths";
import type {
  Actor,
  Character,
  Comic,
  Creator,
  Game,
  Movie,
  RefType,
  SearchDoc,
  Series,
  Suit,
  TimelineEvent,
  Universe,
  Villain,
} from "./types";

const movieFiles = import.meta.glob<Movie>("../data/movies/*.json", {
  eager: true,
  import: "default",
});
const seriesFiles = import.meta.glob<Series>("../data/series/*.json", {
  eager: true,
  import: "default",
});
const comicFiles = import.meta.glob<Comic>("../data/comics/*.json", {
  eager: true,
  import: "default",
});
const actorFiles = import.meta.glob<Actor>("../data/actors/*.json", {
  eager: true,
  import: "default",
});
const characterFiles = import.meta.glob<Character>("../data/characters/*.json", {
  eager: true,
  import: "default",
});
const villainFiles = import.meta.glob<Villain>("../data/villains/*.json", {
  eager: true,
  import: "default",
});
const universeFiles = import.meta.glob<Universe>("../data/universes/*.json", {
  eager: true,
  import: "default",
});
const suitFiles = import.meta.glob<Suit>("../data/suits/*.json", {
  eager: true,
  import: "default",
});
const creatorFiles = import.meta.glob<Creator>("../data/creators/*.json", {
  eager: true,
  import: "default",
});
const timelineFiles = import.meta.glob<TimelineEvent>("../data/timeline/*.json", {
  eager: true,
  import: "default",
});
const gameFiles = import.meta.glob<Game>("../data/games/*.json", {
  eager: true,
  import: "default",
});

function load<T extends { id: string }>(files: Record<string, T>, label: string): T[] {
  const items = Object.entries(files).map(([file, data]) => {
    const expected = file.split("/").pop()?.replace(/\.json$/, "");
    if (!data?.id || data.id !== expected) {
      throw new Error(`${label} file ${file} must use an id that matches its filename.`);
    }
    return data;
  });
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id)) throw new Error(`Duplicate ${label} id “${item.id}”.`);
    seen.add(item.id);
  }
  return items;
}

function indexById<T extends { id: string }>(items: T[], _label?: string): Map<string, T> {
  return new Map(items.map((item) => [item.id, item]));
}

function must<T>(map: Map<string, T>, id: string, label: string): T {
  const item = map.get(id);
  if (!item) throw new Error(`Missing ${label} “${id}”.`);
  return item;
}

function inOrder<T extends { id: string }>(items: T[], order: readonly string[]): T[] {
  const map = indexById(items, "curation");
  const listed = order.map((id) => must(map, id, "curated record"));
  const known = new Set<string>(order);
  const rest = items
    .filter((item) => !known.has(item.id))
    .sort((a, b) => a.id.localeCompare(b.id));
  return [...listed, ...rest];
}

const movies = load(movieFiles, "movie")
  .map((movie) => ({
    ...movie,
    status: movie.status ?? "released",
    medium:
      movie.medium ??
      (movie.universeId === "spider-verse-animated" ? "animated" : "live-action"),
  }))
  .sort((a, b) => a.year - b.year || a.title.localeCompare(b.title));
const games = load(gameFiles, "game").sort((a, b) => a.year - b.year || a.title.localeCompare(b.title));
const series = load(seriesFiles, "series").sort((a, b) => a.yearStart - b.yearStart);
const comics = load(comicFiles, "comic").sort((a, b) => a.year - b.year || a.title.localeCompare(b.title));
const actors = load(actorFiles, "actor").sort((a, b) => a.name.localeCompare(b.name));
const characters = load(characterFiles, "character").sort((a, b) => a.name.localeCompare(b.name));
const villains = inOrder(load(villainFiles, "villain"), villainOrder);
const universes = inOrder(load(universeFiles, "universe"), universeOrder);
const suits = load(suitFiles, "suit").sort((a, b) => a.name.localeCompare(b.name));
const creators = load(creatorFiles, "creator").sort((a, b) => a.name.localeCompare(b.name));
const timeline = load(timelineFiles, "timeline").sort((a, b) => a.year - b.year || a.title.localeCompare(b.title));

const maps = {
  movie: indexById(movies, "movie"),
  game: indexById(games, "game"),
  series: indexById(series, "series"),
  comic: indexById(comics, "comic"),
  actor: indexById(actors, "actor"),
  character: indexById(characters, "character"),
  villain: indexById(villains, "villain"),
  suit: indexById(suits, "suit"),
  universe: indexById(universes, "universe"),
  creator: indexById(creators, "creator"),
  timeline: indexById(timeline, "timeline"),
};

function requireId(type: RefType, id: string, source: string) {
  if (!maps[type].has(id)) {
    throw new Error(`${source} points at missing ${type} “${id}”.`);
  }
}

for (const movie of movies) {
  requireId("universe", movie.universeId, movie.id);
  for (const id of movie.directorIds) requireId("creator", id, movie.id);
  for (const id of movie.suitIds) requireId("suit", id, movie.id);
  for (const id of movie.comicIds) requireId("comic", id, movie.id);
  for (const id of movie.characterIds ?? []) requireId("character", id, movie.id);
  for (const credit of movie.portrayals) {
    if (!credit.actorId || !credit.characterId) {
      throw new Error(`${movie.id} portrayal needs an actor and a character.`);
    }
    requireId("actor", credit.actorId, movie.id);
    requireId("character", credit.characterId, movie.id);
  }
  for (const credit of movie.antagonists) {
    if (!credit.villainId) throw new Error(`${movie.id} antagonist is missing a villain.`);
    requireId("villain", credit.villainId, movie.id);
    if (credit.actorId) requireId("actor", credit.actorId, movie.id);
  }
  if (movie.status === "upcoming" && !movie.releaseNote) {
    throw new Error(`${movie.id} is upcoming and needs a release note.`);
  }
}

for (const game of games) {
  if (!game.releaseLabel || !game.publisher || !game.summary || !game.gameplay || !game.tagline) {
    throw new Error(`${game.id} is missing a release label, publisher, synopsis, tagline, or gameplay note.`);
  }
  if (!game.platforms.length) throw new Error(`${game.id} needs at least one platform.`);
  if (!game.categories.length) throw new Error(`${game.id} needs a category.`);
  if (!game.developerIds.length) throw new Error(`${game.id} needs a developer.`);
  requireId("universe", game.universeId, game.id);
  for (const id of game.developerIds) requireId("creator", id, game.id);
  for (const id of game.playableCharacterIds) requireId("character", id, game.id);
  for (const id of game.characterIds ?? []) requireId("character", id, game.id);
  for (const id of game.villainIds) requireId("villain", id, game.id);
  for (const id of game.relatedGameIds) {
    if (id === game.id) throw new Error(`${game.id} cannot relate to itself.`);
    requireId("game", id, game.id);
  }
}

for (const show of series) {
  if (show.universeId) requireId("universe", show.universeId, show.id);
  for (const id of show.characterIds) requireId("character", id, show.id);
  for (const credit of show.cast) {
    if (!credit.actorId) throw new Error(`${show.id} cast credit is missing an actor.`);
    requireId("actor", credit.actorId, show.id);
    if (credit.characterId) requireId("character", credit.characterId, show.id);
  }
  for (const id of show.villainIds ?? []) requireId("villain", id, show.id);
}

for (const comic of comics) {
  requireId("universe", comic.universeId, comic.id);
  for (const id of comic.writerIds) requireId("creator", id, comic.id);
  for (const id of comic.artistIds) requireId("creator", id, comic.id);
  for (const id of comic.characterIds) requireId("character", id, comic.id);
  for (const id of comic.villainIds) requireId("villain", id, comic.id);
}

for (const actor of actors) {
  if (actor.primary.characterId) requireId("character", actor.primary.characterId, actor.id);
  if (actor.primary.villainId) requireId("villain", actor.primary.villainId, actor.id);
  if (actor.primary.universeId) requireId("universe", actor.primary.universeId, actor.id);
  if (!actor.primary.characterId && !actor.primary.villainId) {
    throw new Error(`${actor.id} needs a primary character or villain.`);
  }
}

for (const character of characters) {
  for (const id of character.universeIds) requireId("universe", id, character.id);
}

for (const villain of villains) {
  for (const id of villain.universeIds) requireId("universe", id, villain.id);
  for (const id of villain.relatedCharacterIds ?? []) requireId("character", id, villain.id);
}

for (const suit of suits) {
  for (const id of suit.characterIds) requireId("character", id, suit.id);
  for (const id of suit.universeIds) requireId("universe", id, suit.id);
}

for (const event of timeline) {
  for (const ref of event.refs) requireId(ref.type, ref.id, event.id);
}

for (const id of screenActorIds) requireId("actor", id, "screen section");
for (const id of featuredComicIds) requireId("comic", id, "comics preview");
for (const id of previewTimelineIds) requireId("timeline", id, "timeline preview");

export interface Catalog {
  movies: Movie[];
  games: Game[];
  series: Series[];
  comics: Comic[];
  actors: Actor[];
  characters: Character[];
  villains: Villain[];
  universes: Universe[];
  suits: Suit[];
  creators: Creator[];
  timeline: TimelineEvent[];
  movie: (id: string) => Movie;
  game: (id: string) => Game;
  seriesById: (id: string) => Series;
  comic: (id: string) => Comic;
  actor: (id: string) => Actor;
  character: (id: string) => Character;
  villain: (id: string) => Villain;
  universe: (id: string) => Universe;
  suit: (id: string) => Suit;
  creator: (id: string) => Creator;
  event: (id: string) => TimelineEvent;
}

const catalog: Catalog = {
  movies,
  games,
  series,
  comics,
  actors,
  characters,
  villains,
  universes,
  suits,
  creators,
  timeline,
  movie: (id) => must(maps.movie, id, "movie"),
  game: (id) => must(maps.game, id, "game"),
  seriesById: (id) => must(maps.series, id, "series"),
  comic: (id) => must(maps.comic, id, "comic"),
  actor: (id) => must(maps.actor, id, "actor"),
  character: (id) => must(maps.character, id, "character"),
  villain: (id) => must(maps.villain, id, "villain"),
  universe: (id) => must(maps.universe, id, "universe"),
  suit: (id) => must(maps.suit, id, "suit"),
  creator: (id) => must(maps.creator, id, "creator"),
  event: (id) => must(maps.timeline, id, "timeline event"),
};

export function getCatalog(): Catalog {
  return catalog;
}

const folders: Record<Exclude<RefType, "character" | "timeline">, string> = {
  movie: "movies",
  game: "games",
  series: "series",
  comic: "comics",
  actor: "actors",
  villain: "villains",
  suit: "suits",
  universe: "universes",
  creator: "creators",
};

export function hrefFor(type: RefType, id: string): string {
  if (type === "timeline") return href(`/timeline/#${id}`);
  if (type === "character") {
    const character = catalog.character(id);
    const folder = character.kind === "spider-person" ? "spider-people" : "characters";
    return href(`/${folder}/${id}/`);
  }
  return href(`/${folders[type]}/${id}/`);
}

export function moviesWithActor(actorId: string): Movie[] {
  return movies.filter((movie) =>
    [...movie.portrayals, ...movie.antagonists].some((credit) => credit.actorId === actorId),
  );
}

export function seriesWithActor(actorId: string): Series[] {
  return series.filter((show) => show.cast.some((credit) => credit.actorId === actorId));
}

export function moviesWithCharacter(characterId: string): Movie[] {
  return movies.filter(
    (movie) =>
      movie.characterIds?.includes(characterId) ||
      movie.portrayals.some((credit) => credit.characterId === characterId),
  );
}

export function seriesWithCharacter(characterId: string): Series[] {
  return series.filter(
    (show) =>
      show.characterIds.includes(characterId) ||
      show.cast.some((credit) => credit.characterId === characterId),
  );
}

export function comicsWithCharacter(characterId: string): Comic[] {
  return comics.filter((comic) => comic.characterIds.includes(characterId));
}

export function comicsWithVillain(villainId: string): Comic[] {
  return comics.filter((comic) => comic.villainIds.includes(villainId));
}

export function moviesWithVillain(villainId: string): Movie[] {
  return movies.filter((movie) => movie.antagonists.some((credit) => credit.villainId === villainId));
}

export function actorsForVillain(villainId: string): Actor[] {
  const ids = new Set<string>();
  for (const movie of movies) {
    for (const credit of movie.antagonists) {
      if (credit.villainId === villainId && credit.actorId) ids.add(credit.actorId);
    }
  }
  for (const actor of actors) {
    if (actor.primary.villainId === villainId) ids.add(actor.id);
  }
  return [...ids].map((id) => catalog.actor(id));
}

export function actorsForCharacter(characterId: string): Actor[] {
  const ids = new Set<string>();
  for (const movie of movies) {
    for (const credit of movie.portrayals) {
      if (credit.characterId === characterId && credit.actorId) ids.add(credit.actorId);
    }
  }
  for (const show of series) {
    for (const credit of show.cast) {
      if (credit.characterId === characterId && credit.actorId) ids.add(credit.actorId);
    }
  }
  for (const actor of actors) {
    if (actor.primary.characterId === characterId) ids.add(actor.id);
  }
  return [...ids].map((id) => catalog.actor(id));
}

export function suitsForCharacter(characterId: string): Suit[] {
  return suits.filter((suit) => suit.characterIds.includes(characterId));
}

export function comicsByCreator(creatorId: string): Comic[] {
  return comics.filter(
    (comic) => comic.writerIds.includes(creatorId) || comic.artistIds.includes(creatorId),
  );
}

export function moviesByDirector(creatorId: string): Movie[] {
  return movies.filter((movie) => movie.directorIds.includes(creatorId));
}

export function gamesByDeveloper(creatorId: string): Game[] {
  return games.filter((game) => game.developerIds.includes(creatorId));
}

export function gamesWithCharacter(characterId: string): Game[] {
  return games.filter(
    (game) =>
      game.playableCharacterIds.includes(characterId) ||
      (game.characterIds ?? []).includes(characterId),
  );
}

export function gamesWithVillain(villainId: string): Game[] {
  return games.filter((game) => game.villainIds.includes(villainId));
}

export function seriesWithVillain(villainId: string): Series[] {
  return series.filter((show) => (show.villainIds ?? []).includes(villainId));
}

export function spiderActorIds(movie: Movie): string[] {
  const ids: string[] = [];
  for (const credit of movie.portrayals) {
    if (!credit.actorId || !credit.characterId) continue;
    const character = maps.character.get(credit.characterId);
    if (character?.kind === "spider-person") ids.push(credit.actorId);
  }
  return ids;
}

export function classificationLabel(value: string | undefined, kind: "spider-person" | "supporting"): string {
  if (value === "symbiote-hero") return "Symbiote hero";
  if (value === "ally") return "Ally";
  if (value === "spider-person" || kind === "spider-person") return "Spider-Person";
  return "Character";
}

export function timelineBucket(kind: TimelineEvent["kind"]): string {
  if (kind === "movie" || kind === "spider-verse") return "movies";
  if (kind === "comic") return "comics";
  if (kind === "series" || kind === "animation") return "series";
  if (kind === "game") return "games";
  if (kind === "character") return "characters";
  return "other";
}

const typeLabels: Record<RefType, string> = {
  movie: "Movies",
  game: "Games",
  series: "Series",
  comic: "Comics",
  actor: "Actors",
  character: "Characters",
  villain: "Villains",
  suit: "Suits",
  universe: "Universes",
  creator: "Creators",
  timeline: "Timeline",
};

function words(...parts: Array<string | number | undefined>): string {
  return parts
    .flatMap((part) => (part === undefined ? [] : String(part).toLowerCase().split(/[^a-z0-9]+/)))
    .filter(Boolean)
    .join(" ");
}

export function searchDocuments(): SearchDoc[] {
  const docs: SearchDoc[] = [];

  for (const movie of movies) {
    docs.push({
      id: movie.id,
      type: "movie",
      typeLabel: typeLabels.movie,
      title: movie.title,
      summary: movie.summary,
      href: hrefFor("movie", movie.id),
      keywords: words(
        movie.title,
        movie.year,
        movie.tagline,
        catalog.universe(movie.universeId).name,
        ...movie.portrayals.flatMap((credit) => (credit.actorId ? [catalog.actor(credit.actorId).name] : [])),
        ...movie.antagonists.map((credit) => catalog.villain(credit.villainId!).name),
      ),
    });
  }

  for (const game of games) {
    docs.push({
      id: game.id,
      type: "game",
      typeLabel: typeLabels.game,
      title: game.title,
      summary: game.summary,
      href: hrefFor("game", game.id),
      keywords: words(
        game.title,
        game.year,
        game.releaseLabel,
        game.publisher,
        ...game.platforms,
        ...game.categories,
        ...game.developerIds.map((id) => catalog.creator(id).name),
        ...game.playableCharacterIds.map((id) => catalog.character(id).name),
        ...game.villainIds.map((id) => catalog.villain(id).name),
        catalog.universe(game.universeId).name,
      ),
    });
  }

  for (const show of series) {
    docs.push({
      id: show.id,
      type: "series",
      typeLabel: typeLabels.series,
      title: show.title,
      summary: show.summary,
      href: hrefFor("series", show.id),
      keywords: words(show.title, show.years, show.medium, show.network),
    });
  }

  for (const comic of comics) {
    docs.push({
      id: comic.id,
      type: "comic",
      typeLabel: typeLabels.comic,
      title: `${comic.title} ${comic.issue}`,
      summary: comic.summary,
      href: hrefFor("comic", comic.id),
      keywords: words(
        comic.title,
        comic.issue,
        comic.year,
        comic.arc,
        ...comic.writerIds.map((id) => catalog.creator(id).name),
        ...comic.artistIds.map((id) => catalog.creator(id).name),
        ...comic.villainIds.map((id) => catalog.villain(id).name),
      ),
    });
  }

  for (const actor of actors) {
    docs.push({
      id: actor.id,
      type: "actor",
      typeLabel: typeLabels.actor,
      title: actor.name,
      summary: actor.summary,
      href: hrefFor("actor", actor.id),
      keywords: words(actor.name, actor.primary.identity, actor.performance, actor.primary.years),
    });
  }

  for (const character of characters) {
    docs.push({
      id: character.id,
      type: "character",
      typeLabel: character.kind === "spider-person" ? "Spider-People" : "Characters",
      title: character.name,
      summary: character.summary,
      href: hrefFor("character", character.id),
      keywords: words(character.name, ...character.aliases, character.kind, character.classification, character.distinction),
    });
  }

  for (const villain of villains) {
    docs.push({
      id: villain.id,
      type: "villain",
      typeLabel: typeLabels.villain,
      title: villain.name,
      summary: villain.summary,
      href: hrefFor("villain", villain.id),
      keywords: words(villain.name, villain.alterEgo),
    });
  }

  for (const universe of universes) {
    docs.push({
      id: universe.id,
      type: "universe",
      typeLabel: typeLabels.universe,
      title: universe.name,
      summary: universe.summary,
      href: hrefFor("universe", universe.id),
      keywords: words(universe.name, universe.designation, universe.medium),
    });
  }

  for (const suit of suits) {
    docs.push({
      id: suit.id,
      type: "suit",
      typeLabel: typeLabels.suit,
      title: suit.name,
      summary: suit.summary,
      href: hrefFor("suit", suit.id),
      keywords: words(suit.name, suit.era),
    });
  }

  for (const creator of creators) {
    docs.push({
      id: creator.id,
      type: "creator",
      typeLabel: typeLabels.creator,
      title: creator.name,
      summary: creator.summary,
      href: hrefFor("creator", creator.id),
      keywords: words(creator.name, ...creator.roles),
    });
  }

  for (const event of timeline) {
    docs.push({
      id: event.id,
      type: "timeline",
      typeLabel: typeLabels.timeline,
      title: event.title,
      summary: event.summary,
      href: hrefFor("timeline", event.id),
      keywords: words(event.title, event.year, event.kind),
    });
  }

  return docs;
}

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function performanceLabel(value: Actor["performance"]): string {
  return value === "voice" ? "Voice" : "Live-action";
}
