/**
 * Deployment settings for GitHub Pages.
 *
 * Project site: https://yegorcreative.github.io/spidey/
 *
 * Custom domain later:
 * 1. Set `origin` to the https domain.
 * 2. Set `base` to "/".
 * 3. Add `public/CNAME` with the domain.
 * Content and components stay the same; rebuild so asset prefixes update.
 */
export const site = {
  name: "Spidey",
  title: "Spidey — Everything Spider-Man",
  description:
    "Explore the movies, games, comics, series, characters, actors, villains, universes, suits, and history of Spider-Man.",
  origin: "https://yegorcreative.github.io",
  base: "/spidey",
  locale: "en",
} as const;
