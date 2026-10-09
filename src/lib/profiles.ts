import {
  actorsForCharacter,
  actorsForVillain,
  comicsByCreator,
  comicsWithCharacter,
  comicsWithVillain,
  classificationLabel,
  formatDate,
  gamesByDeveloper,
  gamesWithCharacter,
  gamesWithVillain,
  getCatalog,
  hrefFor,
  moviesByDirector,
  moviesWithActor,
  moviesWithCharacter,
  moviesWithVillain,
  performanceLabel,
  seriesWithActor,
  seriesWithCharacter,
  seriesWithVillain,
  suitsForCharacter,
} from "./catalog";
import { href } from "./paths";
import type { Actor, Character, Comic, Creator, Game, LinkItem, Movie, ProfileModel, Series, SourceNote, Suit, Universe, Villain } from "./types";

const catalog = getCatalog();

function cited(notes?: SourceNote[]): ProfileModel["sources"] {
  return notes?.map((note) => ({ label: note.label, href: note.url }));
}

function group(title: string, links: LinkItem[]): ProfileModel["groups"] {
  const unique = new Map<string, LinkItem>();
  for (const link of links) unique.set(link.href + link.label, link);
  const items = [...unique.values()];
  return items.length ? [{ title, links: items }] : [];
}

function movieProfile(movie: Movie): ProfileModel {
  const universe = catalog.universe(movie.universeId);
  return {
    crumbs: [
      { href: href("/"), label: "Home" },
      { href: href("/movies/"), label: "Movies" },
      { label: movie.title },
    ],
    kicker: String(movie.year),
    title: movie.title,
    lede: movie.summary,
    accent: universe.accent,
    facts: [
      {
        label: movie.status === "upcoming" ? "Scheduled release" : "Released",
        value: formatDate(movie.releaseDate),
      },
      { label: "Status", value: movie.status === "upcoming" ? "Upcoming" : "Released" },
      { label: "Format", value: movie.medium === "animated" ? "Animation" : "Live-action" },
      { label: "Universe", value: universe.name },
      ...(movie.runtimeMinutes ? [{ label: "Runtime", value: `${movie.runtimeMinutes} min` }] : []),
      ...(movie.releaseNote ? [{ label: "Date note", value: movie.releaseNote }] : []),
    ],
    sources: cited(movie.sources),
    groups: [
      ...group(
        "Spider-People",
        movie.portrayals.map((credit) => {
          const actor = catalog.actor(credit.actorId!);
          const character = catalog.character(credit.characterId!);
          return {
            href: hrefFor("actor", actor.id),
            label: actor.name,
            meta: `${credit.identity ?? "Spider-Man"} · ${character.name}`,
          };
        }),
      ),
      ...group(
        "Characters",
        [
          ...movie.portrayals.map((credit) => catalog.character(credit.characterId!)),
          ...(movie.characterIds ?? []).map((id) => catalog.character(id)),
        ].map((character) => ({
          href: hrefFor("character", character.id),
          label: character.name,
          meta: character.aliases[0],
        })),
      ),
      ...group(
        "Villains",
        movie.antagonists.map((credit) => {
          const villain = catalog.villain(credit.villainId!);
          const actor = credit.actorId ? catalog.actor(credit.actorId) : undefined;
          return {
            href: hrefFor("villain", villain.id),
            label: villain.name,
            meta: actor?.name ?? villain.alterEgo,
          };
        }),
      ),
      ...group(
        "Suits",
        movie.suitIds.map((id) => {
          const suit = catalog.suit(id);
          return { href: hrefFor("suit", suit.id), label: suit.name, meta: suit.era };
        }),
      ),
      ...group(
        "Directors",
        movie.directorIds.map((id) => {
          const creator = catalog.creator(id);
          return { href: hrefFor("creator", creator.id), label: creator.name, meta: creator.roles.join(", ") };
        }),
      ),
      ...group(
        "Related comics",
        movie.comicIds.map((id) => {
          const comic = catalog.comic(id);
          return { href: hrefFor("comic", comic.id), label: `${comic.title} ${comic.issue}`, meta: String(comic.year) };
        }),
      ),
      ...group("Universe", [
        { href: hrefFor("universe", universe.id), label: universe.name, meta: universe.designation },
      ]),
      ...group(
        "Related games",
        catalog.games
          .filter((game) => game.universeId === movie.universeId)
          .map((game) => ({ href: hrefFor("game", game.id), label: game.title, meta: String(game.year) })),
      ),
    ],
  };
}

function gameProfile(game: Game): ProfileModel {
  const universe = catalog.universe(game.universeId);
  const categoryLabels: Record<Game["categories"][number], string> = {
    classic: "Classic",
    "movie-tie-in": "Movie tie-in",
    "open-world": "Open world",
    insomniac: "Insomniac",
    multiverse: "Multiverse",
    mobile: "Mobile",
  };
  return {
    crumbs: [
      { href: href("/"), label: "Home" },
      { href: href("/games/"), label: "Games" },
      { label: game.title },
    ],
    kicker: String(game.year),
    title: game.title,
    lede: game.summary,
    accent: universe.accent,
    facts: [
      { label: "Release", value: game.releaseLabel },
      { label: "Publisher", value: game.publisher },
      { label: "Platforms", value: game.platforms.join(", ") },
      { label: "Categories", value: game.categories.map((item) => categoryLabels[item]).join(", ") },
      { label: "Universe", value: universe.name },
      { label: "Gameplay", value: game.gameplay },
    ],
    sources: cited(game.sources),
    groups: [
      ...group(
        "Developers",
        game.developerIds.map((id) => {
          const creator = catalog.creator(id);
          return { href: hrefFor("creator", creator.id), label: creator.name, meta: creator.roles.join(", ") };
        }),
      ),
      ...group(
        "Playable heroes",
        game.playableCharacterIds.map((id) => {
          const character = catalog.character(id);
          return { href: hrefFor("character", character.id), label: character.name, meta: character.aliases[0] };
        }),
      ),
      ...group(
        "Characters",
        (game.characterIds ?? []).map((id) => {
          const character = catalog.character(id);
          return { href: hrefFor("character", character.id), label: character.name };
        }),
      ),
      ...group(
        "Villains",
        game.villainIds.map((id) => {
          const villain = catalog.villain(id);
          return { href: hrefFor("villain", villain.id), label: villain.name, meta: villain.alterEgo };
        }),
      ),
      ...group("Universe", [
        { href: hrefFor("universe", universe.id), label: universe.name, meta: universe.designation },
      ]),
      ...group(
        "Related games",
        game.relatedGameIds.map((id) => {
          const related = catalog.game(id);
          return { href: hrefFor("game", related.id), label: related.title, meta: String(related.year) };
        }),
      ),
    ],
  };
}

function seriesProfile(show: Series): ProfileModel {
  return {
    crumbs: [
      { href: href("/"), label: "Home" },
      { href: href("/series/"), label: "Series" },
      { label: show.title },
    ],
    kicker: show.medium === "animated" ? "Animated series" : "Live-action series",
    title: show.title,
    lede: show.summary,
    accent: show.universeId ? catalog.universe(show.universeId).accent : "teal",
    facts: [
      { label: "Years", value: show.years },
      ...(show.seasons !== undefined ? [{ label: "Seasons", value: String(show.seasons) }] : []),
      ...(show.episodes !== undefined ? [{ label: "Episodes", value: String(show.episodes) }] : []),
      ...(show.episodeNote ? [{ label: "Episode note", value: show.episodeNote }] : []),
      ...(show.network ? [{ label: "Network", value: show.network }] : []),
      { label: "Medium", value: show.medium === "animated" ? "Animation" : "Live-action" },
    ],
    sources: cited(show.sources),
    groups: [
      ...group(
        "Cast",
        show.cast.map((credit) => {
          const actor = catalog.actor(credit.actorId!);
          return {
            href: hrefFor("actor", actor.id),
            label: actor.name,
            meta: credit.identity,
          };
        }),
      ),
      ...group(
        "Characters",
        show.characterIds.map((id) => {
          const character = catalog.character(id);
          return { href: hrefFor("character", character.id), label: character.name };
        }),
      ),
      ...group(
        "Villains",
        (show.villainIds ?? []).map((id) => {
          const villain = catalog.villain(id);
          return { href: hrefFor("villain", villain.id), label: villain.name, meta: villain.alterEgo };
        }),
      ),
      ...group(
        "Universe",
        show.universeId
          ? [{ href: hrefFor("universe", show.universeId), label: catalog.universe(show.universeId).name, meta: catalog.universe(show.universeId).designation }]
          : [],
      ),
    ],
  };
}

function comicProfile(comic: Comic): ProfileModel {
  const universe = catalog.universe(comic.universeId);
  return {
    crumbs: [
      { href: href("/"), label: "Home" },
      { href: href("/comics/"), label: "Comics" },
      { label: `${comic.title} ${comic.issue}` },
    ],
    kicker: comic.coverDate,
    title: `${comic.title} ${comic.issue}`,
    lede: comic.summary,
    accent: universe.accent,
    facts: [
      { label: "Issue", value: comic.issue },
      { label: "Year", value: String(comic.year) },
      { label: "Universe", value: universe.name },
      ...(comic.arc ? [{ label: "Story", value: comic.arc }] : []),
    ],
    groups: [
      ...group(
        "Writers",
        comic.writerIds.map((id) => {
          const creator = catalog.creator(id);
          return { href: hrefFor("creator", creator.id), label: creator.name, meta: "Writer" };
        }),
      ),
      ...group(
        "Artists",
        comic.artistIds.map((id) => {
          const creator = catalog.creator(id);
          return { href: hrefFor("creator", creator.id), label: creator.name, meta: "Artist" };
        }),
      ),
      ...group(
        "Characters",
        comic.characterIds.map((id) => {
          const character = catalog.character(id);
          return { href: hrefFor("character", character.id), label: character.name };
        }),
      ),
      ...group(
        "Villains",
        comic.villainIds.map((id) => {
          const villain = catalog.villain(id);
          return { href: hrefFor("villain", villain.id), label: villain.name, meta: villain.alterEgo };
        }),
      ),
      ...group("Universe", [
        { href: hrefFor("universe", universe.id), label: universe.name, meta: universe.designation },
      ]),
    ],
  };
}

function actorProfile(actor: Actor): ProfileModel {
  const character = actor.primary.characterId ? catalog.character(actor.primary.characterId) : undefined;
  const villain = actor.primary.villainId ? catalog.villain(actor.primary.villainId) : undefined;
  const universe = actor.primary.universeId ? catalog.universe(actor.primary.universeId) : undefined;
  return {
    crumbs: [
      { href: href("/"), label: "Home" },
      { href: href("/actors/"), label: "Actors" },
      { label: actor.name },
    ],
    kicker: performanceLabel(actor.performance),
    title: actor.name,
    lede: actor.summary,
    accent: universe?.accent ?? "red",
    facts: [
      { label: "Identity", value: actor.primary.identity },
      { label: "Years in the role", value: actor.primary.years },
      ...(universe ? [{ label: "Universe / era", value: universe.name }] : []),
      { label: "Performance", value: performanceLabel(actor.performance) },
    ],
    groups: [
      ...group(
        "Portrayed",
        [
          ...(character
            ? [{ href: hrefFor("character", character.id), label: character.name, meta: actor.primary.identity }]
            : []),
          ...(villain
            ? [{ href: hrefFor("villain", villain.id), label: villain.name, meta: villain.alterEgo }]
            : []),
        ],
      ),
      ...group(
        "Movies",
        moviesWithActor(actor.id).map((movie) => ({
          href: hrefFor("movie", movie.id),
          label: movie.title,
          meta: String(movie.year),
        })),
      ),
      ...group(
        "Series",
        seriesWithActor(actor.id).map((show) => ({
          href: hrefFor("series", show.id),
          label: show.title,
          meta: show.years,
        })),
      ),
      ...group(
        "Universe",
        universe
          ? [{ href: hrefFor("universe", universe.id), label: universe.name, meta: universe.designation }]
          : [],
      ),
    ],
  };
}

function characterProfile(character: Character): ProfileModel {
  return {
    crumbs: [
      { href: href("/"), label: "Home" },
      {
        href: href(character.kind === "spider-person" ? "/spider-people/" : "/characters/"),
        label: character.kind === "spider-person" ? "Spider-People" : "Characters",
      },
      { label: character.name },
    ],
    kicker: classificationLabel(character.classification, character.kind),
    title: character.name,
    lede: character.summary,
    accent: catalog.universe(character.universeIds[0]).accent,
    facts: [
      { label: "Classification", value: classificationLabel(character.classification, character.kind) },
      ...(character.aliases.length ? [{ label: "Also known as", value: character.aliases.join(", ") }] : []),
      ...(character.distinction ? [{ label: "Distinction", value: character.distinction }] : []),
      ...(character.firstAppearance ? [{ label: "First appearance", value: character.firstAppearance }] : []),
      ...(character.creators ? [{ label: "Creators", value: character.creators }] : []),
    ],
    sources: cited(character.sources),
    groups: [
      ...group(
        "Universes",
        character.universeIds.map((id) => {
          const universe = catalog.universe(id);
          return { href: hrefFor("universe", universe.id), label: universe.name, meta: universe.designation };
        }),
      ),
      ...group(
        "Actors",
        actorsForCharacter(character.id).map((actor) => ({
          href: hrefFor("actor", actor.id),
          label: actor.name,
          meta: `${actor.primary.identity} · ${actor.primary.years}`,
        })),
      ),
      ...group(
        "Movies",
        moviesWithCharacter(character.id).map((movie) => ({
          href: hrefFor("movie", movie.id),
          label: movie.title,
          meta: String(movie.year),
        })),
      ),
      ...group(
        "Series",
        seriesWithCharacter(character.id).map((show) => ({
          href: hrefFor("series", show.id),
          label: show.title,
          meta: show.years,
        })),
      ),
      ...group(
        "Comics",
        comicsWithCharacter(character.id).map((comic) => ({
          href: hrefFor("comic", comic.id),
          label: `${comic.title} ${comic.issue}`,
          meta: String(comic.year),
        })),
      ),
      ...group(
        "Suits",
        suitsForCharacter(character.id).map((suit) => ({
          href: hrefFor("suit", suit.id),
          label: suit.name,
          meta: suit.era,
        })),
      ),
      ...group(
        "Games",
        gamesWithCharacter(character.id).map((game) => ({
          href: hrefFor("game", game.id),
          label: game.title,
          meta: String(game.year),
        })),
      ),
    ],
  };
}

function villainProfile(villain: Villain): ProfileModel {
  return {
    crumbs: [
      { href: href("/"), label: "Home" },
      { href: href("/villains/"), label: "Villains" },
      { label: villain.name },
    ],
    kicker: villain.relation ? "Archive entry" : "Rogue",
    title: villain.name,
    lede: villain.summary,
    accent: villain.accent,
    facts: [
      { label: "Identity", value: villain.alterEgo },
      ...(villain.relation ? [{ label: "Relationship", value: villain.relation }] : []),
      ...(villain.firstAppearance ? [{ label: "First appearance", value: villain.firstAppearance }] : []),
      ...(villain.creators ? [{ label: "Creators", value: villain.creators }] : []),
      ...(villain.powers ? [{ label: "Powers", value: villain.powers }] : []),
      ...(villain.origin ? [{ label: "Origin", value: villain.origin }] : []),
    ],
    sources: cited(villain.sources),
    groups: [
      ...group(
        "Actors",
        actorsForVillain(villain.id).map((actor) => ({
          href: hrefFor("actor", actor.id),
          label: actor.name,
          meta: actor.primary.years,
        })),
      ),
      ...group(
        "Movies",
        moviesWithVillain(villain.id).map((movie) => ({
          href: hrefFor("movie", movie.id),
          label: movie.title,
          meta: String(movie.year),
        })),
      ),
      ...group(
        "Comics",
        comicsWithVillain(villain.id).map((comic) => ({
          href: hrefFor("comic", comic.id),
          label: `${comic.title} ${comic.issue}`,
          meta: String(comic.year),
        })),
      ),
      ...group(
        "Series",
        seriesWithVillain(villain.id).map((show) => ({
          href: hrefFor("series", show.id),
          label: show.title,
          meta: show.years,
        })),
      ),
      ...group(
        "Games",
        gamesWithVillain(villain.id).map((game) => ({
          href: hrefFor("game", game.id),
          label: game.title,
          meta: String(game.year),
        })),
      ),
      ...group(
        "Related characters",
        (villain.relatedCharacterIds ?? []).map((id) => {
          const character = catalog.character(id);
          return { href: hrefFor("character", character.id), label: character.name };
        }),
      ),
      ...group(
        "Universes",
        villain.universeIds.map((id) => {
          const universe = catalog.universe(id);
          return { href: hrefFor("universe", universe.id), label: universe.name, meta: universe.designation };
        }),
      ),
    ],
  };
}

function universeProfile(universe: Universe): ProfileModel {
  const relatedMovies = catalog.movies.filter((movie) => movie.universeId === universe.id);
  const relatedSeries = catalog.series.filter((show) => show.universeId === universe.id);
  const relatedComics = catalog.comics.filter((comic) => comic.universeId === universe.id);
  const relatedCharacters = catalog.characters.filter((character) => character.universeIds.includes(universe.id));
  const relatedVillains = catalog.villains.filter((villain) => villain.universeIds.includes(universe.id));
  const relatedSuits = catalog.suits.filter((suit) => suit.universeIds.includes(universe.id));
  const relatedGames = catalog.games.filter((game) => game.universeId === universe.id);
  return {
    crumbs: [
      { href: href("/"), label: "Home" },
      { href: href("/universes/"), label: "Universes" },
      { label: universe.name },
    ],
    kicker: universe.medium,
    title: universe.name,
    lede: universe.summary,
    accent: universe.accent,
    facts: [
      { label: "Designation", value: universe.designation },
      { label: "Medium", value: universe.medium },
    ],
    groups: [
      ...group(
        "Movies",
        relatedMovies.map((movie) => ({ href: hrefFor("movie", movie.id), label: movie.title, meta: String(movie.year) })),
      ),
      ...group(
        "Series",
        relatedSeries.map((show) => ({ href: hrefFor("series", show.id), label: show.title, meta: show.years })),
      ),
      ...group(
        "Games",
        relatedGames.map((game) => ({ href: hrefFor("game", game.id), label: game.title, meta: String(game.year) })),
      ),
      ...group(
        "Comics",
        relatedComics.map((comic) => ({
          href: hrefFor("comic", comic.id),
          label: `${comic.title} ${comic.issue}`,
          meta: String(comic.year),
        })),
      ),
      ...group(
        "Characters",
        relatedCharacters.map((character) => ({ href: hrefFor("character", character.id), label: character.name })),
      ),
      ...group(
        "Villains",
        relatedVillains.map((villain) => ({ href: hrefFor("villain", villain.id), label: villain.name, meta: villain.alterEgo })),
      ),
      ...group(
        "Suits",
        relatedSuits.map((suit) => ({ href: hrefFor("suit", suit.id), label: suit.name })),
      ),
    ],
  };
}

function suitProfile(suit: Suit): ProfileModel {
  const movies = catalog.movies.filter((movie) => movie.suitIds.includes(suit.id));
  return {
    crumbs: [
      { href: href("/"), label: "Home" },
      { href: href("/suits/"), label: "Suits" },
      { label: suit.name },
    ],
    kicker: "Suit",
    title: suit.name,
    lede: suit.summary,
    accent: suit.accent,
    facts: [{ label: "Era", value: suit.era }],
    groups: [
      ...group(
        "Wearers",
        suit.characterIds.map((id) => {
          const character = catalog.character(id);
          return { href: hrefFor("character", character.id), label: character.name };
        }),
      ),
      ...group(
        "Universes",
        suit.universeIds.map((id) => {
          const universe = catalog.universe(id);
          return { href: hrefFor("universe", universe.id), label: universe.name, meta: universe.designation };
        }),
      ),
      ...group(
        "Movies",
        movies.map((movie) => ({ href: hrefFor("movie", movie.id), label: movie.title, meta: String(movie.year) })),
      ),
    ],
  };
}

function creatorProfile(creator: Creator): ProfileModel {
  return {
    crumbs: [
      { href: href("/"), label: "Home" },
      { href: href("/creators/"), label: "Creators" },
      { label: creator.name },
    ],
    kicker: creator.roles.join(" · "),
    title: creator.name,
    lede: creator.summary,
    accent: "blue",
    facts: [{ label: "Roles", value: creator.roles.join(", ") }],
    groups: [
      ...group(
        "Comics",
        comicsByCreator(creator.id).map((comic) => ({
          href: hrefFor("comic", comic.id),
          label: `${comic.title} ${comic.issue}`,
          meta: comic.writerIds.includes(creator.id) ? "Writer" : "Artist",
        })),
      ),
      ...group(
        "Films",
        moviesByDirector(creator.id).map((movie) => ({
          href: hrefFor("movie", movie.id),
          label: movie.title,
          meta: String(movie.year),
        })),
      ),
      ...group(
        "Games",
        gamesByDeveloper(creator.id).map((game) => ({
          href: hrefFor("game", game.id),
          label: game.title,
          meta: String(game.year),
        })),
      ),
    ],
  };
}

export const profiles = {
  movie: movieProfile,
  game: gameProfile,
  series: seriesProfile,
  comic: comicProfile,
  actor: actorProfile,
  character: characterProfile,
  villain: villainProfile,
  universe: universeProfile,
  suit: suitProfile,
  creator: creatorProfile,
};
