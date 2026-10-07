import { site } from "../config/site";

/** Prefix an internal path with the GitHub Pages base. */
export function href(path = "/"): string {
  const base = import.meta.env.BASE_URL;
  const hashAt = path.indexOf("#");
  const hash = hashAt >= 0 ? path.slice(hashAt) : "";
  const bare = hashAt >= 0 ? path.slice(0, hashAt) : path;
  if (!bare || bare === "/") return `${base}${hash}`;
  let clean = bare.startsWith("/") ? bare.slice(1) : bare;
  const isFile = /\.[a-z0-9]+$/i.test(clean);
  if (!isFile && !clean.endsWith("/")) clean += "/";
  return `${base}${clean}${hash}`;
}

export function absoluteUrl(path = "/"): string {
  return new URL(href(path), site.origin).href;
}

export function isCurrent(pathname: string, path: string): boolean {
  const target = href(path);
  if (path === "/") return pathname === target;
  return pathname === target || pathname.startsWith(target);
}
