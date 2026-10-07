const base = import.meta.env.BASE_URL;

const navToggle = document.querySelector<HTMLInputElement>("#nav-toggle");
const navLabel = document.querySelector("#nav-label");
navToggle?.addEventListener("change", () => {
  navLabel?.setAttribute("aria-expanded", String(Boolean(navToggle.checked)));
});

interface SearchDoc {
  title: string;
  summary: string;
  href: string;
  typeLabel: string;
  keywords: string;
}

let indexPromise: Promise<SearchDoc[]> | null = null;

function loadIndex(): Promise<SearchDoc[]> {
  indexPromise ??= fetch(`${base}search-index.json`).then((response) => {
    if (!response.ok) throw new Error("Search index failed");
    return response.json() as Promise<SearchDoc[]>;
  });
  return indexPromise;
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

const dialog = document.querySelector<HTMLDialogElement>("#search-dialog");
const dialogInput = document.querySelector<HTMLInputElement>("#search-input");
const dialogResults = document.querySelector<HTMLElement>("#search-results");

function renderDialog(query: string, docs: SearchDoc[]) {
  if (!dialogResults) return;
  dialogResults.replaceChildren();
  const needle = normalize(query);
  const matches = needle
    ? docs.filter((doc) => normalize(`${doc.title} ${doc.summary} ${doc.keywords}`).includes(needle)).slice(0, 12)
    : docs.slice(0, 8);
  if (!matches.length) {
    const empty = document.createElement("p");
    empty.className = "search-empty";
    empty.textContent = "Nothing in the archive matches that yet.";
    dialogResults.append(empty);
    return;
  }
  const groups = new Map<string, SearchDoc[]>();
  for (const doc of matches) {
    const bucket = groups.get(doc.typeLabel) ?? [];
    bucket.push(doc);
    groups.set(doc.typeLabel, bucket);
  }
  for (const [label, bucket] of groups) {
    const section = document.createElement("section");
    section.className = "search-dialog__group";
    const heading = document.createElement("h3");
    heading.textContent = label;
    const list = document.createElement("ul");
    for (const doc of bucket) {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = doc.href;
      const title = document.createElement("span");
      title.textContent = doc.title;
      const meta = document.createElement("span");
      meta.textContent = doc.summary;
      link.append(title, meta);
      item.append(link);
      list.append(item);
    }
    section.append(heading, list);
    dialogResults.append(section);
  }
}

document.querySelectorAll<HTMLAnchorElement>("[data-open-search]").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (!dialog || !dialogInput) return;
    event.preventDefault();
    dialog.showModal();
    dialogInput.focus();
    void loadIndex()
      .then((docs) => renderDialog(dialogInput.value, docs))
      .catch(() => {
        if (!dialogResults) return;
        dialogResults.replaceChildren();
        const note = document.createElement("p");
        note.textContent = "Search is unavailable. Browse the full index instead.";
        dialogResults.append(note);
      });
  });
});

dialogInput?.addEventListener("input", () => {
  void loadIndex().then((docs) => renderDialog(dialogInput.value, docs)).catch(() => undefined);
});

dialog?.querySelector("[data-close-search]")?.addEventListener("click", () => dialog.close());
dialog?.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

const filter = document.querySelector<HTMLInputElement>("#archive-filter");
if (filter) {
  const items = [...document.querySelectorAll<HTMLElement>("[data-search-item]")];
  const groups = [...document.querySelectorAll<HTMLElement>("[data-search-group]")];
  const empty = document.querySelector<HTMLElement>("#search-empty");

  const apply = (raw: string) => {
    const needle = normalize(raw);
    let visible = 0;
    for (const item of items) {
      const haystack = item.dataset.keywords ?? "";
      const show = !needle || haystack.includes(needle);
      item.hidden = !show;
      if (show) visible += 1;
    }
    for (const group of groups) {
      const any = [...group.querySelectorAll<HTMLElement>("[data-search-item]")].some((item) => !item.hidden);
      group.hidden = !any;
    }
    if (empty) empty.hidden = visible !== 0;
  };

  filter.addEventListener("input", () => {
    const url = new URL(window.location.href);
    if (filter.value) url.searchParams.set("q", filter.value);
    else url.searchParams.delete("q");
    history.replaceState(null, "", url);
    apply(filter.value);
  });

  const initial = new URL(window.location.href).searchParams.get("q");
  if (initial) {
    filter.value = initial;
    apply(initial);
  }
}
