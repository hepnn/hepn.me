import { defineCollection, z } from "astro:content";

const blog = defineCollection({
    type: "content",
    schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.coerce.date(),
        icon: z.string().optional(),
        draft: z.boolean().optional(),
    }),
});

const projects = defineCollection({
    type: "content",
    schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.coerce.date(),
        icon: z.string().optional(),
        draft: z.boolean().optional(),
        demoURL: z.string().optional(),
        repoURL: z.string().optional(),
        order: z.number().default(0),
    }),
});

export const collections = { blog, projects };