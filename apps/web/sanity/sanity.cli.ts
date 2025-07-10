import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xh75mh7d',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'development'
  },
  studioHost: 'survivalpending'
})