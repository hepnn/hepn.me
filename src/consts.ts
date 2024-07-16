import type { Metadata, Site, Socials } from "./types.ts";

export const SITE: Site = {
    TITLE: "Martins Svikkalns",
    DESCRIPTION: "Mobile App Developer, based in Riga, Latvia.",
    EMAIL: "martinssvikkalns@gmail.com",
    NUM_POSTS_ON_HOMEPAGE: 5,
    NUM_PROJECTS_ON_HOMEPAGE: 4,
};

export const HOME: Metadata = {
    TITLE: "Home",
    DESCRIPTION: "About me and my work.",
};

export const BLOG: Metadata = {
    TITLE: "Blog",
    DESCRIPTION: "My writings",
};

export const PROJECTS: Metadata = {
    TITLE: "Projects",
    DESCRIPTION:
        "Collection of my personal and professional projects.",
};

export const SOCIALS: Socials = [
    {
        NAME: "GitHub",
        HREF: "https://github.com/hepnn",
    },
    {
        NAME: "LinkedIn",
        HREF: "https://www.linkedin.com/in/m%C4%81rti%C5%86%C5%A1-svi%C4%B7kalns-79687a22b/",
    },
];