# spidey
🕷️ The ultimate Spider-Man fan archive — exploring the movies, comics, series, characters, actors, villains, universes, suits, and history of Spider-Man.
🕷️ Spidey

Everything Spider-Man. One place.

Spidey is an unofficial fan-created website dedicated to exploring the incredible history and universe of Spider-Man — from his first comic-book appearance in 1962 to movies, television series, animation, alternate universes, iconic villains, actors, suits, and the ever-expanding Spider-Verse.

The goal is to create a beautiful, modern, and easy-to-explore digital archive for Spider-Man fans.

⸻

🕸️ Explore the Spider-Verse

🎬 Movies

Explore Spider-Man’s history on the big screen, including:

* Tobey Maguire’s Spider-Man
* Andrew Garfield’s The Amazing Spider-Man
* Tom Holland’s MCU Spider-Man
* Spider-Man: Into the Spider-Verse
* Spider-Man: Across the Spider-Verse
* Animated and alternate-universe films
* Related Spider-Man universe movies

Each movie can include information about its cast, director, release date, villains, story, universe, suits, trivia, and connections to Spider-Man comics.

⸻

🕷️ Spider-Men & Spider-People

Discover the many people who have worn the mask.

Explore characters and portrayals including:

* Peter Parker
* Miles Morales
* Gwen Stacy / Spider-Gwen
* Spider-Man 2099
* Spider-Man Noir
* Scarlet Spider
* Superior Spider-Man
* Spider-Punk
* Peni Parker
* Alternate Spider-People from across the Spider-Verse

⸻

🎭 Actors & Voice Actors

Explore the performers who brought Spider-Man and his world to life.

From live-action Spider-Man actors such as Tobey Maguire, Andrew Garfield, and Tom Holland to the many voice actors behind animated versions of Peter Parker, Miles Morales, Gwen Stacy, and other Spider-People.

⸻

📚 Comics

Travel back to where everything began.

Explore Spider-Man comics across different eras, series, creators, and universes — beginning with his historic debut in Amazing Fantasy #15 (1962).

Comic pages can include:

* Series
* Issues
* Publication dates
* Writers
* Artists
* Story arcs
* Characters
* Villains
* Universes
* Major events
* Related issues

⸻

📺 TV & Animation

Explore decades of Spider-Man television history.

From early animated Spider-Man adventures to modern series, Spidey will document the evolution of Spider-Man across television and streaming.

⸻

😈 Villains

Spider-Man wouldn’t be Spider-Man without one of the greatest collections of villains in comics.

Explore characters such as:

* Green Goblin
* Doctor Octopus
* Venom
* Carnage
* Sandman
* Electro
* Lizard
* Mysterio
* Vulture
* Kraven the Hunter
* Kingpin

…and many more.

⸻

🌎 Universes

The Spider-Verse is much bigger than one Peter Parker.

Spidey will help visitors understand the different realities, timelines, adaptations, and alternate versions of Spider-Man across comics, movies, and television.

⸻

🕸️ Suits

Explore the evolution of the Spider-Man suit.

From the classic red-and-blue design to the Black Suit, Iron Spider, Advanced Suit, Spider-Man 2099, Miles Morales’ suit, Spider-Gwen, Spider-Punk, and many others.

⸻

⏳ Spider-Man Timeline

Follow Spider-Man through more than six decades of history.

The timeline will connect important moments across:

Comics → Television → Movies → Games → Spider-Verse

Visitors will be able to see how Spider-Man evolved from his comic-book beginnings into one of the world’s most recognizable superheroes.

⸻

🔎 Search

The long-term goal is to make the entire archive searchable.

Search for a:

Movie • Comic • Character • Actor • Villain • Suit • Series • Universe • Creator

and immediately explore the connections between them.

⸻

🎨 Design

Spidey will have its own visual identity inspired by the energy of comic books and Spider-Man.

The design direction includes:

* Spider-Man red, blue, black, and white
* Comic-book panel layouts
* Halftone textures
* Web patterns
* Bold typography
* Comic-inspired transitions
* Interactive elements
* Responsive mobile design
* Subtle web and swinging animations

The goal is not simply to create an encyclopedia.

The website itself should feel like entering the Spider-Verse.

⸻

🚀 Project Vision

Spidey is being built as a long-term Spider-Man digital archive.

The goal is to connect more than 60 years of Spider-Man history through an experience that is visual, educational, searchable, and fun to explore.

Whether someone grew up with Spider-Man comics, discovered him through animation, watched Tobey Maguire, Andrew Garfield or Tom Holland on the big screen, or met Miles Morales through the Spider-Verse films, there should be something here for every Spider-Man fan.

Anyone can wear the mask.

⸻

⚖️ Disclaimer

Spidey is an unofficial, non-commercial fan project created for informational and educational purposes.

Spider-Man and related characters, names, logos, artwork, films, comics, and other intellectual property are trademarks and/or copyrighted works of their respective owners, including Marvel Entertainment, LLC, Sony Pictures Entertainment, and other applicable rights holders.

This project is not affiliated with, endorsed by, or sponsored by Marvel, Sony, Disney, or their affiliates.

⸻

🕷️ Spidey

Movies. Comics. Series. Characters. Universes.

Everything Spider-Man. One place.

⸻

🛠 Technical foundation

Version 1 is a static site built with Astro. GitHub Pages serves the built files. There is no production server, database, or API.

Planned project-site address, once GitHub Pages is set to deploy from GitHub Actions:

https://yegorcreative.github.io/spidey/

The repository name means the site is published under `/spidey`. Asset and page links use that prefix. A custom domain later is a config change, not a rewrite: set `origin` and `base` in `src/config/site.ts`, add `public/CNAME`, and rebuild.

```bash
npm install
npm run dev
npm run build
npm run preview
```

Archive records live in `src/data/` as one JSON file per entry. The filename is the id. Movies, series, comics, actors, characters, villains, suits, universes, creators, and timeline events reference each other by id. The build fails if a reference points at a missing record.

Add an entry by creating a JSON file in the right folder and linking the ids that already exist. Profiles and search pick it up on the next build. Put an `image` object on a record (`src`, `alt`, optional `width` and `height`) when an authorized image is available. Until then, the interface uses original graphic placeholders. Do not commit scraped artwork.

Search is a static index generated at build time (`search-index.json`) plus a search page. It runs in the browser. Nothing is sent to a server.

Before the first deploy, open the repository on GitHub → Settings → Pages → Build and deployment → Source: GitHub Actions. Pushing to `main` runs `.github/workflows/deploy.yml`.
