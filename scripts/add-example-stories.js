#!/usr/bin/env node

/**
 * Script to add the 8 example stories with real content
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

// Sanity client setup
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xh75mh7d',
  dataset: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN
});

const stories = [
  {
    username: 'steadfast_oak_4823',
    demographics: {
      ageRange: '35-44',
      genderIdentity: 'trans_man',
      racialIdentity: 'white',
      urbanicity: 'suburban',
      state: 'OH'
    },
    content: `[EXAMPLE] Started testosterone four years ago. My endo just told me she's closing her practice - too many "regulatory challenges." She was the only one within 90 miles who'd see trans patients.

I've been calling clinics for three weeks. "We don't do that." "Not accepting new patients." "Have you tried Cleveland?" Cleveland is four hours away. I work retail. I don't have four-hour-drive money.

My shot is next Tuesday. I have two vials left. After that, I go back to bleeding every month, back to being called ma'am, back to wanting to crawl out of my skin. Four years of stability, gone.

Started a spreadsheet of every clinic in surrounding states. Color-coded by wait times. Green means under 6 months. There's no green yet.

My coworker asked why I've been quiet lately. How do you explain that your body is about to betray you again? That all your progress might disappear? That you're rationing medication like it's the apocalypse?

It kind of is, though. My apocalypse, anyway.`,
    voiceId: 'voice_2',
    categories: ['Healthcare', 'Discrimination', 'Identity']
  },
  {
    username: 'searching_willow_1592',
    demographics: {
      ageRange: '13-17',
      genderIdentity: 'questioning',
      racialIdentity: 'hispanic',
      urbanicity: 'rural',
      state: 'FL'
    },
    content: `[EXAMPLE] My school board just banned "gender ideology" books. They took 47 books from our library. I counted.

My parents think it's good. "Too much confusion these days," Mom says. Dad nods along. They don't know I had three of those books hidden under my bed. Threw them in the pond behind our house yesterday. Couldn't risk it.

I used to use the library computer to research things. Can't anymore - they installed monitoring software. I clear my phone history every night. Delete Discord every morning, reinstall after school. My friends think I'm paranoid.

Maybe I am. But Maria's parents found her Pinterest board full of pride flags. Haven't seen her in school for a week. "Visiting family," they said.

I practice being normal in the mirror. Lower my voice. Stand differently. It's exhausting being someone else all day. Sometimes I forget which version is real.

There's this tree I bike to after school. Carved a tiny "they" into the bark where no one can see. It's stupid, but it's mine. Proof I exist, even if it's just to a tree.

Two more years. 730 days. Then college somewhere far away. Somewhere I can breathe. If I make it that long.`,
    voiceId: 'voice_5',
    categories: ['Identity', 'Family', 'Discrimination']
  },
  {
    username: 'allied_cedar_3847',
    demographics: {
      ageRange: '55-64',
      genderIdentity: 'cis_man',
      racialIdentity: 'black',
      urbanicity: 'urban',
      state: 'GA'
    },
    content: `[EXAMPLE] Ran this bookstore for 22 years. Survived Amazon, COVID, gentrification. Might not survive this.

Started getting reviews last month. One star. "Woke indoctrination center." "Grooming kids." All because we have a rainbow sticker on the door and a small LGBTQ section.

I'm not even gay. Just believe everyone should see themselves in books. My daughter came out five years ago. Wanted her to feel welcome in her dad's shop.

Yesterday, someone spray-painted slurs on our window. Insurance company says it's the third claim this month for "similar incidents" in the area. Premiums going up.

The cops took a report. Seemed bored. "Kids probably," they said, looking at security footage of grown men.

My landlord called today. "Concerned about the property's reputation." Rent's been on time for two decades, but suddenly that's not enough.

We're doing a fundraiser next week. Community's showing up. But I'm tired. Sixty-one years old and sleeping in my store because I'm scared they'll come back.

My daughter says I should take the sticker down. "It's just a sticker, Dad." But it's not. It's saying she belongs here. We all do.

Still open. Still here. But damn, I'm tired.`,
    voiceId: 'voice_6',
    categories: ['Support', 'Discrimination', 'Community']
  },
  {
    username: 'caring_river_2156',
    demographics: {
      ageRange: '25-34',
      genderIdentity: 'non_binary',
      racialIdentity: 'asian',
      urbanicity: 'suburban',
      state: 'MN'
    },
    content: `[EXAMPLE] My partner attempted last week. They're home now. I'm trying to make our apartment feel safe again.

The hospital was a nightmare. Wrong name on every form. Wrong pronouns from every nurse. They were there for mental health crisis and spent the whole time being misgendered. "It's policy," they said. Policy to make suffering worse?

I've taken two weeks off work. Can't afford it, but can't afford to lose them either. We watch movies. I make their safe foods. We don't talk about the election.

Their parents don't know. Mine don't either. It's just us in this apartment, holding each other together with scotch tape and stubbornness.

The therapist says to focus on small victories. Today they showered. Yesterday they laughed at a TikTok. Tomorrow maybe they'll want to go outside.

I changed all the news apps to need a password. Hid their doom-scrolling devices. Built us a blanket fort like we're kids. We kind of are - twenty-somethings playing house while the world burns.

But they're here. Breathing. That's everything.

We're not thriving. Not even surviving yet. Just pending. But pending together.`,
    voiceId: 'voice_3',
    categories: ['Relationships', 'Healthcare', 'Support']
  },
  {
    username: 'warrior_eagle_5923',
    demographics: {
      ageRange: '45-54',
      genderIdentity: 'trans_woman',
      racialIdentity: 'native',
      urbanicity: 'rural',
      state: 'NM'
    },
    content: `[EXAMPLE] Twenty years in the Army. Three tours. Transitioned after discharge. Thought the hard part was over.

The VA just changed their policy. No more hormones. "Reviewing treatment guidelines." I fought for this country in the wrong body. Now this country says that body isn't valid.

On the rez, it's complicated. Two-Spirit tradition runs deep, but colonization runs deeper. Some elders get it. Some don't. Most just want me to stop causing trouble.

Started driving three hours to Mexico for hormones. Border agents know my face now. "Medical tourism," I joke. They don't laugh.

My niece asked why I'm growing a beard again. How do you explain systems failing to a twelve-year-old? How do you say the country you bled for doesn't see you as human?

I teach her old stories instead. How people like us existed before contact. How we were sacred once. How colonizers tried to erase that too.

They didn't succeed then. Won't now.

My service medals sit in a box. Can't look at them. But I keep my grandmother's necklace close. She would understand. She survived boarding schools. I'll survive this.

Different war. Same fight. Still here.`,
    voiceId: 'voice_4',
    categories: ['Healthcare', 'Identity', 'Discrimination']
  },
  {
    username: 'teaching_heart_7234',
    demographics: {
      ageRange: '35-44',
      genderIdentity: 'cis_woman',
      racialIdentity: 'white',
      urbanicity: 'urban',
      state: 'OR'
    },
    content: `[EXAMPLE] They transferred me to a different school. "Restructuring," they said. Really it's because I refused to out kids to their parents.

Sixteen years of teaching. Perfect reviews. But I wouldn't betray a kid's trust, so here I am.

You know what though? My new school is incredible. The principal pulled me aside day one: "I specifically requested you. We need teachers with backbone." Turns out she's got a trans son.

Started an after-school "Creative Writing Club." Wink wink. Safe space for kids to be themselves. We "write stories." Sometimes those stories are about kids discovering who they are. Sometimes we just eat snacks and exist without fear.

Last week, a student slipped me a note: "Thank you for seeing me." I keep it in my desk drawer next to twenty others just like it.

The other teachers are catching on. The art teacher started "Abstract Expression Hour." The librarian has "Silent Reading Space" that's never actually silent. We're building an underground railroad of care, one club at a time.

They can transfer me. They can rewrite policies. But they can't stop me from loving these kids. Can't stop us from protecting each other.

Teaching is resistance now. I'm good with that.`,
    voiceId: 'voice_1',
    categories: ['Support', 'Work/School', 'Community']
  },
  {
    username: 'growing_greenhouse_4892',
    demographics: {
      ageRange: '18-24',
      genderIdentity: 'genderfluid',
      racialIdentity: 'mixed',
      urbanicity: 'urban',
      state: 'IL'
    },
    content: `[EXAMPLE] My bio family kicked me out last year. Spent two nights at a shelter before Jamie found me. "You're coming home with me," they said. Didn't even know my last name yet.

Now I live with three other queer kids in a two-bedroom apartment that violates every occupancy law. It's perfect. We call it the Greenhouse because we're all growing into ourselves.

Alex teaches us to cook with food bank ingredients. Makes magic with rice and beans. Sam fixes everyone's bikes for free - keeps us mobile. Jamie does everyone's taxes and insurance paperwork. I mend clothes and cut hair. We're a functioning ecosystem.

Started a Sunday dinner thing. First week was just us four. Last week we had seventeen people crammed around a table meant for four. Chosen family expanding like ripples in water.

The group chat is 24/7 support. "Who's near Walgreens? Maya needs pickup." "Emergency: someone needs a binder, size M." "Victory: Jordan got the job!!!" We celebrate everything. Mourn together too.

My bio mom called last month. "Come home if you stop this nonsense." I looked around at my real family - Alex cooking, Sam laughing, Jamie helping someone with homework. "I am home," I said.

We're not just surviving. We're thriving. Building the world we need, one Sunday dinner at a time.

Love is our rebellion.`,
    voiceId: 'voice_7',
    categories: ['Family', 'Community', 'Support']
  },
  {
    username: 'elder_wisdom_1987',
    demographics: {
      ageRange: '65+',
      genderIdentity: 'trans_woman',
      racialIdentity: 'black',
      urbanicity: 'urban',
      state: 'NY'
    },
    content: `[EXAMPLE] Transitioned in 1987. Buried too many friends in the 90s. Thought I'd seen the worst. Maybe I have. That's why I'm not scared now.

Started a support group in my apartment. Every Wednesday, 6 PM. Tea, cookies, and truth. The young ones come thinking I'll be bitter. Instead, I show them photos: Me at the ball in '89. At the march in '93. Getting married in '14.

"We've always been here," I tell them. "We'll always be here."

They worry about everything. I teach them what I learned: Find your people. Document everything. Love fiercely. Dance when you can.

My walls are covered in pictures of my kids - not biological, but mine nonetheless. Every trans person I've mentored over 40 years. Hundreds of faces. Doctors now, artists, parents, teachers. Alive.

Started a rapid response fund with my retirement savings. Kid needs hormones? Covered. Someone facing eviction? Not on my watch. The young ones protest. "Save your money, Ms. E." Please. What am I saving for? This IS my legacy.

Just helped my 200th person get their name change. Keep every thank you card in a box labeled "Evidence of Joy." When they come for our history, I'll have receipts.

My knees hurt. My back aches. But every Wednesday at 6 PM, my apartment fills with laughter and tears and hope. We plot, we plan, we persist.

Been surviving since before some of these politicians were born. I'll outlive them too, out of spite if nothing else.

Still here, honey. Still fabulous. Still fighting. And teaching the babies to fight too.`,
    voiceId: 'voice_8',
    categories: ['Community', 'Support', 'Resilience']
  }
];

async function syncToSanity(story, username, categories) {
  try {
    const storyDocument = {
      _type: 'story',
      storyId: story.id,
      username: username,
      content: story.contentText,
      contentSanitized: story.contentSanitized || story.contentText,
      voiceId: story.voiceId,
      audioUrl: story.audioUrl,
      status: 'pending',
      sentimentFlags: {
        highRisk: false,
        crisisContent: false,
        positiveResilience: true
      },
      createdAt: story.createdAt.toISOString(),
      categories: categories,
      tags: []
    };

    const result = await sanityClient.create(storyDocument);
    console.log(`  ✓ Synced to Sanity: ${result._id}`);
    return result;
  } catch (error) {
    console.error('  ✗ Failed to sync to Sanity:', error.message);
    throw error;
  }
}

async function addExampleStories() {
  console.log('🌟 Adding example stories with real content...\n');
  const password = 'ExampleStory123!';
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    for (let i = 0; i < stories.length; i++) {
      const storyData = stories[i];
      console.log(`\nCreating story ${i + 1}/8: ${storyData.username}`);
      
      // Create user
      const user = await prisma.user.create({
        data: {
          username: storyData.username,
          passwordHash: passwordHash,
          hasCompletedOnboarding: true,
        }
      });
      console.log(`  ✓ Created user: ${user.username}`);

      // Create demographics
      if (storyData.demographics) {
        await prisma.userDemographics.create({
          data: {
            userId: user.id,
            ageRange: storyData.demographics.ageRange,
            genderIdentity: storyData.demographics.genderIdentity,
            racialIdentity: storyData.demographics.racialIdentity,
            urbanicity: storyData.demographics.urbanicity,
            state: storyData.demographics.state,
          }
        });
        console.log(`  ✓ Added demographics`);
      }

      // Create story
      const story = await prisma.story.create({
        data: {
          userId: user.id,
          contentText: storyData.content,
          contentSanitized: storyData.content,
          voiceId: storyData.voiceId,
          status: 'PENDING',
          flaggedHighRisk: false,
          flaggedCrisis: false,
          flaggedPositive: true,
          sentimentFlags: {
            hasCrisisContent: false,
            riskLevel: 'none',
            categories: ['none']
          },
          // Audio will be generated by the API when accessed
          audioUrl: null
        },
        include: {
          user: true
        }
      });
      console.log(`  ✓ Created story: ${story.id}`);

      // Sync to Sanity
      await syncToSanity(story, storyData.username, storyData.categories);
    }

    console.log('\n✅ Successfully created all example stories!');
    console.log('\n📝 Login credentials for all users:');
    console.log(`Password: ${password}`);
    console.log('\nUsernames:');
    stories.forEach(s => console.log(`  - ${s.username}`));
    
    console.log('\n🎙️ Note: Audio will be generated automatically when stories are accessed.');
    console.log('Stories are marked as PENDING and will need approval in Sanity Studio.');
    
  } catch (error) {
    console.error('❌ Error creating example stories:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addExampleStories();