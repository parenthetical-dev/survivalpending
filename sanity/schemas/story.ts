import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'story',
  title: 'Story',
  type: 'document',
  fields: [
    defineField({
      name: 'storyId',
      title: 'Story ID',
      type: 'string',
      description: 'Reference to the database story ID',
      readOnly: true,
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'username',
      title: 'Username',
      type: 'string',
      description: 'Anonymous username (adjective_noun_1234 format)',
      readOnly: true,
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'text',
      description: 'Original story content',
      readOnly: true,
      validation: Rule => Rule.required().max(1000)
    }),
    defineField({
      name: 'contentSanitized',
      title: 'Content Sanitized',
      type: 'text',
      description: 'Sanitized/refined version of the story',
      readOnly: true
    }),
    defineField({
      name: 'voiceId',
      title: 'Voice ID',
      type: 'string',
      description: 'Selected voice identifier',
      options: {
        list: [
          { title: 'Voice 1 - Warm, Conversational', value: 'voice_1' },
          { title: 'Voice 2 - Clear, Professional', value: 'voice_2' },
          { title: 'Voice 3 - Gentle, Soothing', value: 'voice_3' },
          { title: 'Voice 4 - Strong, Confident', value: 'voice_4' },
          { title: 'Voice 5 - Youthful, Energetic', value: 'voice_5' },
          { title: 'Voice 6 - Mature, Wise', value: 'voice_6' },
          { title: 'Voice 7 - Neutral, Balanced', value: 'voice_7' },
          { title: 'Voice 8 - Expressive, Dynamic', value: 'voice_8' }
        ]
      },
      readOnly: true
    }),
    defineField({
      name: 'audioUrl',
      title: 'Audio URL',
      type: 'url',
      description: 'URL to the generated audio file',
      readOnly: true
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Approved', value: 'approved' },
          { title: 'Rejected', value: 'rejected' }
        ],
        layout: 'radio'
      },
      initialValue: 'pending',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'sentimentFlags',
      title: 'Sentiment Flags',
      type: 'object',
      fields: [
        defineField({
          name: 'highRisk',
          title: 'High Risk',
          type: 'boolean',
          initialValue: false
        }),
        defineField({
          name: 'crisisContent',
          title: 'Crisis Content',
          type: 'boolean',
          initialValue: false
        }),
        defineField({
          name: 'positiveResilience',
          title: 'Positive Resilience',
          type: 'boolean',
          initialValue: false
        })
      ],
      readOnly: true
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Coming Out', value: 'coming-out' },
          { title: 'Identity', value: 'identity' },
          { title: 'Family', value: 'family' },
          { title: 'Relationships', value: 'relationships' },
          { title: 'Discrimination', value: 'discrimination' },
          { title: 'Healthcare', value: 'healthcare' },
          { title: 'Work/School', value: 'work-school' },
          { title: 'Community', value: 'community' },
          { title: 'Resilience', value: 'resilience' },
          { title: 'Support', value: 'support' }
        ]
      }
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags'
      }
    }),
    defineField({
      name: 'moderationNotes',
      title: 'Moderation Notes',
      type: 'text',
      description: 'Internal notes for moderation team'
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      readOnly: true,
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'approvedAt',
      title: 'Approved At',
      type: 'datetime',
      readOnly: true
    }),
    defineField({
      name: 'approvedBy',
      title: 'Approved By',
      type: 'string',
      description: 'Admin/moderator who approved the story',
      readOnly: true
    }),
    defineField({
      name: 'showOnHomepage',
      title: 'Show on Homepage',
      type: 'boolean',
      description: 'Display this story on the homepage',
      initialValue: false,
      hidden: ({ document }) => document?.status !== 'approved'
    })
  ],
  preview: {
    select: {
      title: 'username',
      subtitle: 'status',
      content: 'content',
      createdAt: 'createdAt'
    },
    prepare(selection) {
      const { title, subtitle, content, createdAt } = selection
      const date = new Date(createdAt).toLocaleDateString()
      const preview = content ? content.substring(0, 100) + '...' : ''
      
      return {
        title: `${title} - ${date}`,
        subtitle: `${subtitle.toUpperCase()} - ${preview}`
      }
    }
  },
  orderings: [
    {
      title: 'Created Date, New',
      name: 'createdAtDesc',
      by: [
        { field: 'createdAt', direction: 'desc' }
      ]
    },
    {
      title: 'Status',
      name: 'status',
      by: [
        { field: 'status', direction: 'asc' }
      ]
    }
  ]
})