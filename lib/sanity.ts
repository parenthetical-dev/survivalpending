import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

// Determine dataset based on NODE_ENV
const dataset = process.env.NODE_ENV === 'production' ? 'production' : 'development'

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_API_PROJECT_ID || 'xh75mh7d',
  dataset: dataset,
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
  token: process.env.SANITY_API_WRITE_TOKEN // Only needed for writing
})

const builder = imageUrlBuilder(sanityClient)

export const urlFor = (source: any) => builder.image(source)