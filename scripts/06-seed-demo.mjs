/**
 * Copyright (c) 2025 Asher Buk
 * SPDX-License-Identifier: MIT
 */

// Seed demo users, posts, likes, and comments using Supabase Admin API
// Requirements:
// - Environment variables:
//   SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)
//   SUPABASE_SERVICE_ROLE_KEY (Service Role key)
// - Run: node scripts/06-seed-demo.mjs

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env variables.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
})

const users = [
  {
    fullName: 'David Cohen',
    username: 'david_cohen',
    email: 'david.cohen@example.com',
  },
  {
    fullName: 'Rivka Levi',
    username: 'rivka_levi',
    email: 'rivka.levi@example.com',
  },
  {
    fullName: 'Moshe Katz',
    username: 'moshe_katz',
    email: 'moshe.katz@example.com',
  },
  {
    fullName: 'Yael Ben-Ami',
    username: 'yael_benami',
    email: 'yael.benami@example.com',
  },
  {
    fullName: 'Noam Shapiro',
    username: 'noam_shapiro',
    email: 'noam.shapiro@example.com',
  },
  {
    fullName: 'Eliav Goldstein',
    username: 'eliav_goldstein',
    email: 'eliav.goldstein@example.com',
  },
  {
    fullName: 'Shira Rosen',
    username: 'shira_rosen',
    email: 'shira.rosen@example.com',
  },
  {
    fullName: 'Avi Mizrahi',
    username: 'avi_mizrahi',
    email: 'avi.mizrahi@example.com',
  },
  {
    fullName: 'Talia Weiss',
    username: 'talia_weiss',
    email: 'talia.weiss@example.com',
  },
  {
    fullName: 'Yossi Bar-On',
    username: 'yossi_baron',
    email: 'yossi.baron@example.com',
  },
]

// Reliable demo images
const demoImages = [
  'https://picsum.photos/seed/david/1200/1200',
  'https://picsum.photos/seed/rivka/1200/1200',
  'https://picsum.photos/seed/moshe/1200/1200',
  'https://picsum.photos/seed/yael/1200/1200',
  'https://picsum.photos/seed/noam/1200/1200',
  'https://picsum.photos/seed/eliav/1200/1200',
  'https://picsum.photos/seed/shira/1200/1200',
  'https://picsum.photos/seed/avi/1200/1200',
  'https://picsum.photos/seed/talia/1200/1200',
  'https://picsum.photos/seed/yossi/1200/1200',
]

const demoComments = [
  'Beautiful shot!',
  'Kol hakavod!',
  'Love the colors here',
  'Amazing composition',
  'This is stunning',
  'Great perspective',
  'Wow, just wow',
  'So inspiring',
  "Feels like I'm there",
  'Love this!',
]

async function ensureBucket() {
  // Bucket 'images' expected to exist per scripts/02-create-storage-bucket.sql
  // This is a no-op. Keeping for completeness.
}

async function createUsers() {
  const created = []
  for (const u of users) {
    const password = 'Password123!' // demo
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password,
      email_confirm: true,
      user_metadata: { username: u.username, full_name: u.fullName },
    })
    if (error) {
      // If user exists, resolve by email via Admin API and ensure profile
      const existingUser = await findUserByEmail(u.email)
      if (!existingUser) {
        console.error('Failed to create user and could not find existing:', u.email, error.message)
        process.exit(1)
      }
      await ensureProfileForUser(existingUser.id, u)
      created.push({ id: existingUser.id, ...u })
      continue
    }
    // Ensure profile exists (idempotent in case trigger wasn't set earlier)
    await ensureProfileForUser(data.user.id, u)
    created.push({ id: data.user.id, ...u })
  }
  return created
}

async function findUserByEmail(email) {
  // Paginate through users to find by email (Admin API lacks direct email lookup)
  let page = 1
  const perPage = 1000
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
    if (error) throw error
    const found = data.users.find((usr) => (usr.email || '').toLowerCase() === email.toLowerCase())
    if (found) return found
    if (!data.users || data.users.length < perPage) return null
    page += 1
  }
}

async function ensureProfileForUser(userId, meta) {
  const username = meta.username
  const fullName = meta.fullName || ''
  const { data: existing } = await supabase.from('profiles').select('id').eq('id', userId).single()
  if (existing) {
    // Update only missing fields
    await supabase
      .from('profiles')
      .update({ username, full_name: fullName })
      .eq('id', userId)
  } else {
    await supabase
      .from('profiles')
      .insert({ id: userId, username, full_name: fullName, avatar_url: '' })
  }
}

// For demo we use direct remote URLs (no storage upload required)

async function createPostsForUsers(createdUsers) {
  const posts = []
  let imgIdx = 0
  for (const u of createdUsers) {
    // 1-2 posts per user
    const numPosts = 1 + Math.floor(Math.random() * 2)
    for (let i = 0; i < numPosts; i++) {
      const imgUrl = demoImages[imgIdx % demoImages.length]
      imgIdx++
      const title = `Photo by ${u.fullName}`
      const description = `Captured by ${u.fullName}`
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: u.id,
          title,
          description,
          image_url: imgUrl,
        })
        .select()
        .single()
      if (error) throw error
      posts.push(data)
    }
  }
  return posts
}

async function seedLikesAndComments(createdUsers, posts) {
  for (const post of posts) {
    // Random likes
    for (const u of createdUsers) {
      if (Math.random() < 0.5) {
        await supabase.from('likes').insert({ user_id: u.id, post_id: post.id })
      }
    }
    // 1-3 random comments
    const commentsCount = 1 + Math.floor(Math.random() * 3)
    for (let i = 0; i < commentsCount; i++) {
      const commenter = createdUsers[Math.floor(Math.random() * createdUsers.length)]
      const content = demoComments[Math.floor(Math.random() * demoComments.length)]
      await supabase.from('comments').insert({ user_id: commenter.id, post_id: post.id, content })
    }
  }
}

async function main() {
  console.log('Seeding demo data...')
  await ensureBucket()
  const createdUsers = await createUsers()
  console.log(`Created/ensured ${createdUsers.length} users.`)
  const posts = await createPostsForUsers(createdUsers)
  console.log(`Created ${posts.length} posts.`)
  await seedLikesAndComments(createdUsers, posts)
  console.log('Likes and comments seeded.')
  console.log('Done.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
