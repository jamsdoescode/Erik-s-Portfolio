const DEFAULT_ROOT_DOMAIN = "keitz.dev";

export function getRootDomain(): string {
  return process.env.ROOT_DOMAIN?.trim() || DEFAULT_ROOT_DOMAIN;
}

export function companyPageUrl(slug: string): string {
  return `https://${slug}.${getRootDomain()}`;
}

export function extractSubdomain(host: string): string | null {
  const hostname = host.split(":")[0].toLowerCase();
  const rootDomain = getRootDomain().toLowerCase();

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return null;
  }

  if (hostname === rootDomain || hostname === `www.${rootDomain}`) {
    return null;
  }

  if (hostname.endsWith(`.${rootDomain}`)) {
    const subdomain = hostname.slice(0, -(rootDomain.length + 1));
    if (subdomain && subdomain !== "www") {
      return subdomain;
    }
    return null;
  }

  if (hostname.endsWith(".localhost")) {
    const subdomain = hostname.slice(0, -".localhost".length);
    if (subdomain && subdomain !== "www") {
      return subdomain;
    }
  }

  return null;
}
