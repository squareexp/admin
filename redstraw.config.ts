import { defineCollection, defineConfig, s } from 'redstraw'

const terms = defineCollection({
  name: "Terms",
  pattern: "terms/*.mdx",
  schema: s.object({
    title: s.string(),
    description: s.string().optional(),
    content: s.markdown()
  })
})

const privacy = defineCollection({
  name: "Privacy",
  pattern: "privacy/*.mdx",
  schema: s.object({
    title: s.string(),
    description: s.string().optional(),
    content: s.markdown()
  })
})

const guide = defineCollection({
  name: "Guide",
  pattern: "guide/*.mdx",
  schema: s.object({
    title: s.string(),
    description: s.string().optional(),
    content: s.markdown()
  })
})

export default defineConfig({
  root: 'docs',
  collections: { terms, privacy, guide }
})
