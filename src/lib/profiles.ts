import {
  actorsForCharacter,
  actorsForVillain,
  comicsByCreator,
  comicsWithCharacter,
  comicsWithVillain,
  formatDate,
  getCatalog,
  hrefFor,
  moviesByDirector,
  moviesWithActor,
  moviesWithCharacter,
  moviesWithVillain,
  performanceLabel,
  seriesWithActor,
  seriesWithCharacter,
  suitsForCharacter,
} from "./catalog";
import { href } from "./paths";
import type { Actor, Character, Comic, Creator, LinkItem, Movie, ProfileModel, Series, Suit, Universe, Villain } from "./types";

const catalog = getCatalog();

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
      { label: "Released", value: formatDate(movie.releaseDate) },
      { label: "Universe", value: universe.name },
      ...(movie.runtimeMinutes ? [{ label: "Runtime", value: `${movie.runtimeMinutes} min` }] : []),
    ],
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
    accent: "teal",
    facts: [
      { label: "Years", value: show.years },
      ...(show.network ? [{ label: "Network", value: show.network }] : []),
      { label: "Medium", value: show.medium === "animated" ? "Animation" : "Live-action" },
    ],
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
    kicker: character.kind === "spider-person" ? "Spider-Person" : "Character",
    title: character.name,
    lede: character.summary,
    accent: catalog.universe(character.universeIds[0]).accent,
    facts: [
      ...(character.aliases.length ? [{ label: "Also known as", value: character.aliases.join(", ") }] : []),
      ...(character.firstAppearance ? [{ label: "First appearance", value: character.firstAppearance }] : []),
    ],
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
    kicker: "Rogue",
    title: villain.name,
    lede: villain.summary,
    accent: villain.accent,
    facts: [
      { label: "Alter ego", value: villain.alterEgo },
      ...(villain.firstAppearance ? [{ label: "First appearance", value: villain.firstAppearance }] : []),
    ],
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
    ],
  };
}

export const profiles = {
  movie: movieProfile,
  series: seriesProfile,
  comic: comicProfile,
  actor: actorProfile,
  character: characterProfile,
  villain: villainProfile,
  universe: universeProfile,
  suit: suitProfile,
  creator: creatorProfile,
};
