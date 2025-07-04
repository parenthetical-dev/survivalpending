'use client'

import { NextStudio } from 'sanity'
import config from '@/sanity/sanity.config'

export default function StudioPage() {
  return <NextStudio config={config} />
}