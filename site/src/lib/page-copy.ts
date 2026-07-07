export type PageCopy = {
  nav: {
    about: string;
    reading: string;
    projects: string;
    blog: string;
  };
  home: {
    eyebrow: string;
    headline: string;
    lead: string;
    now: string;
    latestWriting: string;
    projects: string;
    allPosts: string;
    viewProjects: string;
  };
  about: {
    title: string;
    intro: string;
    sidebarName: string;
    bio: string;
    bioExtended: string;
    blogLink: string;
  };
  reading: {
    title: string;
    intro: string;
    empty: string;
    statusReading: string;
    statusFinished: string;
    statusQueue: string;
  };
  projects: {
    title: string;
    intro: string;
    backLink: string;
    visitLink: string;
  };
  blog: {
    title: string;
    intro: string;
    empty: string;
    backLink: string;
  };
  footer: {
    copyrightName: string;
    adminLink: string;
  };
};

export const defaultPageCopy: PageCopy = {
  nav: {
    about: "About",
    reading: "Reading",
    projects: "Projects",
    blog: "Blog",
  },
  home: {
    eyebrow: "Product builder and designer-engineer",
    headline: "Erik",
    lead: "I build focused productivity tools for knowledge workers — products that turn messy real-world input into structured output you can actually use.",
    now: "Now",
    latestWriting: "Latest writing",
    projects: "Projects",
    allPosts: "All posts",
    viewProjects: "View all",
  },
  about: {
    title: "About",
    intro: "Product builder and designer-engineer",
    sidebarName: "Erik",
    bio: "I'm a product builder who cares about editorial craft in software. I work at the intersection of design and engineering, shipping tools that solve specific jobs instead of generic dashboards.",
    bioExtended:
      "Most of my recent work lives in the career and productivity space: capturing accomplishments, tracking commitments, and reloading context when you switch projects. I prefer warm typography, hairline rules, and interfaces that feel like documents rather than apps.\n\nWhen I'm not building, I'm reading, taking notes, and collecting ideas for the next thing worth making.",
    blogLink: "Blog",
  },
  reading: {
    title: "Reading",
    intro: "Books and articles on the shelf, in progress, or queued up next.",
    empty: "Nothing on the shelf yet.",
    statusReading: "Reading",
    statusFinished: "Finished",
    statusQueue: "Queue",
  },
  projects: {
    title: "Projects",
    intro: "Focused productivity tools for knowledge workers — each solving a specific job.",
    backLink: "Back to projects",
    visitLink: "Visit project",
  },
  blog: {
    title: "Blog",
    intro: "Notes on building, design, and what is worth paying attention to.",
    empty: "No posts yet.",
    backLink: "Back to blog",
  },
  footer: {
    copyrightName: "Erik",
    adminLink: "Admin",
  },
};

type LegacyHomeLabels = Partial<PageCopy["home"]>;

type LegacySiteFields = {
  name?: string | null;
  tagline?: string | null;
  intro?: string | null;
  bio?: string | null;
  bioExtended?: string | null;
};

function mergeString(value: string | undefined, fallback: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

export function mergePageCopyWithLegacy(
  parsed: Partial<PageCopy>,
  legacy: LegacySiteFields,
): PageCopy {
  const base = parsePageCopy(JSON.stringify(parsed));

  return {
    ...base,
    home: {
      ...base.home,
      eyebrow: mergeString(parsed.home?.eyebrow, legacy.tagline?.trim() || base.home.eyebrow),
      headline: mergeString(parsed.home?.headline, legacy.name?.trim() || base.home.headline),
      lead: mergeString(parsed.home?.lead, legacy.intro?.trim() || base.home.lead),
    },
    about: {
      ...base.about,
      intro: mergeString(parsed.about?.intro, legacy.tagline?.trim() || base.about.intro),
      sidebarName: mergeString(parsed.about?.sidebarName, legacy.name?.trim() || base.about.sidebarName),
      bio: mergeString(parsed.about?.bio, legacy.bio?.trim() || base.about.bio),
      bioExtended: mergeString(
        parsed.about?.bioExtended,
        legacy.bioExtended?.trim() || legacy.bio?.trim() || base.about.bioExtended,
      ),
    },
    footer: {
      ...base.footer,
      copyrightName: mergeString(parsed.footer?.copyrightName, legacy.name?.trim() || base.footer.copyrightName),
    },
  };
}

export function parsePageCopy(value: string | null | undefined): PageCopy {
  if (!value) return defaultPageCopy;

  try {
    const parsed = JSON.parse(value) as Partial<PageCopy> & LegacyHomeLabels;

    if ("now" in parsed && !("home" in parsed)) {
      return mergePageCopyWithLegacy(
        {
          home: {
            now: parsed.now?.trim() || defaultPageCopy.home.now,
            latestWriting: parsed.latestWriting?.trim() || defaultPageCopy.home.latestWriting,
            projects: parsed.projects?.trim() || defaultPageCopy.home.projects,
            allPosts: parsed.allPosts?.trim() || defaultPageCopy.home.allPosts,
            viewProjects: parsed.viewProjects?.trim() || defaultPageCopy.home.viewProjects,
          },
        } as Partial<PageCopy>,
        {},
      );
    }

    return {
      nav: {
        about: parsed.nav?.about?.trim() || defaultPageCopy.nav.about,
        reading: parsed.nav?.reading?.trim() || defaultPageCopy.nav.reading,
        projects: parsed.nav?.projects?.trim() || defaultPageCopy.nav.projects,
        blog: parsed.nav?.blog?.trim() || defaultPageCopy.nav.blog,
      },
      home: {
        eyebrow: parsed.home?.eyebrow?.trim() || defaultPageCopy.home.eyebrow,
        headline: parsed.home?.headline?.trim() || defaultPageCopy.home.headline,
        lead: parsed.home?.lead?.trim() || defaultPageCopy.home.lead,
        now: parsed.home?.now?.trim() || defaultPageCopy.home.now,
        latestWriting: parsed.home?.latestWriting?.trim() || defaultPageCopy.home.latestWriting,
        projects: parsed.home?.projects?.trim() || defaultPageCopy.home.projects,
        allPosts: parsed.home?.allPosts?.trim() || defaultPageCopy.home.allPosts,
        viewProjects: parsed.home?.viewProjects?.trim() || defaultPageCopy.home.viewProjects,
      },
      about: {
        title: parsed.about?.title?.trim() || defaultPageCopy.about.title,
        intro: parsed.about?.intro?.trim() || defaultPageCopy.about.intro,
        sidebarName: parsed.about?.sidebarName?.trim() || defaultPageCopy.about.sidebarName,
        bio: parsed.about?.bio?.trim() || defaultPageCopy.about.bio,
        bioExtended: parsed.about?.bioExtended?.trim() || defaultPageCopy.about.bioExtended,
        blogLink: parsed.about?.blogLink?.trim() || defaultPageCopy.about.blogLink,
      },
      reading: {
        title: parsed.reading?.title?.trim() || defaultPageCopy.reading.title,
        intro: parsed.reading?.intro?.trim() || defaultPageCopy.reading.intro,
        empty: parsed.reading?.empty?.trim() || defaultPageCopy.reading.empty,
        statusReading: parsed.reading?.statusReading?.trim() || defaultPageCopy.reading.statusReading,
        statusFinished: parsed.reading?.statusFinished?.trim() || defaultPageCopy.reading.statusFinished,
        statusQueue: parsed.reading?.statusQueue?.trim() || defaultPageCopy.reading.statusQueue,
      },
      projects: {
        title: parsed.projects?.title?.trim() || defaultPageCopy.projects.title,
        intro: parsed.projects?.intro?.trim() || defaultPageCopy.projects.intro,
        backLink: parsed.projects?.backLink?.trim() || defaultPageCopy.projects.backLink,
        visitLink: parsed.projects?.visitLink?.trim() || defaultPageCopy.projects.visitLink,
      },
      blog: {
        title: parsed.blog?.title?.trim() || defaultPageCopy.blog.title,
        intro: parsed.blog?.intro?.trim() || defaultPageCopy.blog.intro,
        empty: parsed.blog?.empty?.trim() || defaultPageCopy.blog.empty,
        backLink: parsed.blog?.backLink?.trim() || defaultPageCopy.blog.backLink,
      },
      footer: {
        copyrightName: parsed.footer?.copyrightName?.trim() || defaultPageCopy.footer.copyrightName,
        adminLink: parsed.footer?.adminLink?.trim() || defaultPageCopy.footer.adminLink,
      },
    };
  } catch {
    return defaultPageCopy;
  }
}

export function pageCopyToLegacyFields(pageCopy: PageCopy) {
  return {
    name: pageCopy.footer.copyrightName,
    tagline: pageCopy.home.eyebrow,
    intro: pageCopy.home.lead,
    bio: pageCopy.about.bio,
    bioExtended: pageCopy.about.bioExtended,
  };
}
