export interface SiteOptions {
  basePath: string;
  origin: string;
}

export function normalizeBasePath(value: string | undefined): string {
  if (value === undefined) return "";
  const trimmed = value.trim();
  if (trimmed === "" || trimmed === "/") return "";
  return `/${trimmed.replace(/^\/+|\/+$/g, "")}`;
}

export function siteOptions(overrides?: Partial<SiteOptions>): SiteOptions {
  return {
    basePath: normalizeBasePath(
      overrides?.basePath ?? process.env.BASE_PATH,
    ),
    origin: (overrides?.origin ?? process.env.SITE_ORIGIN ?? "").replace(
      /\/+$/,
      "",
    ),
  };
}

export function withBase(basePath: string, route: string): string {
  if (!route.startsWith("/")) {
    throw new Error(`route must start with /: ${route}`);
  }
  const base = normalizeBasePath(basePath);
  if (route === "/") return base === "" ? "/" : `${base}/`;
  return `${base}${route}`;
}

export function publicUrl(site: SiteOptions, route: string): string {
  const path = withBase(site.basePath, route);
  if (!site.origin) return path;
  return `${site.origin}${path}`;
}
