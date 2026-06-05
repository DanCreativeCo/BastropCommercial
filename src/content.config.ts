import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * Listings — hand-curated commercial properties.
 * To add a property: drop a new .md file in src/content/listings/.
 * The body (markdown below the frontmatter) becomes the full description.
 */
const listings = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/listings" }),
  schema: z.object({
    title: z.string(),
    price: z.number(), // raw number, used for sorting
    priceLabel: z.string(), // pretty display, e.g. "$22,900,000"
    category: z.enum(["Industrial", "Commercial", "Development Land", "Retail"]),
    status: z.enum(["Available", "Under Contract", "Sold"]).default("Available"),
    acreage: z.number(),
    address: z.string(),
    zoning: z.string().optional(),
    highlights: z.array(z.string()).default([]),
    image: z.string(), // remote URL or /public path; gradient fallback if it fails
    imageAlt: z.string().default(""),
    featured: z.boolean().default(false),
    order: z.number().default(99),
  }),
});

/**
 * Blog / market insights.
 */
const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    date: z.coerce.date(),
    category: z.string().default("Market Insight"),
    readingTime: z.string().default("4 min read"),
    draft: z.boolean().default(false),
  }),
});

export const collections = { listings, posts };
