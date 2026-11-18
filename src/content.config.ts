import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

const notes = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    description: z.string().nullish(),
    updated: z.coerce.date().optional(),
    order: z.number().default(0),
    draft: z.boolean().default(false),
    hidden: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    year: z.number(),
    venue: z.string().optional(),
    authors: z.string().optional(),
    abstract: z.string().optional(),
    code: z.string().url().optional(),
    pdf: z.string().optional(),
    link: z.string().optional(),
    image: z.string().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
  }),
});

const travel = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/travel' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      place: z.string(),
      coords: z.tuple([z.number(), z.number()]),
      date: z.coerce.date(),
      country: z.string().optional(),
      description: z.string().nullish(),
      cover: image().optional(),
      draft: z.boolean().default(false),
    }),
});

const books = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/books' }),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    kind: z.enum(['textbook', 'book']).default('book'),
    blurb: z.string().optional(),
    link: z.string().url().optional(),
    notes: z.string().optional(),
    finished: z.coerce.date().optional(),
    pages: z.number().optional(),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

const places = defineCollection({
  loader: file('src/content/places/places.yaml'),
  schema: z.object({
    place: z.string(),
    coords: z.tuple([z.number(), z.number()]),
    year: z.number().optional(),
    country: z.string().optional(),
  }),
});

export const collections = { notes, projects, travel, books, places };
