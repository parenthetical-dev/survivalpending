import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas'

export default defineConfig({
  name: 'default',
  title: 'Survival Pending',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xh75mh7d',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'development',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },

  basePath: '/studio',
})