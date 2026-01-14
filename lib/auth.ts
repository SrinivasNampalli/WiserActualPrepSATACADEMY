// Simple auth utilities for user management
// In production, use a proper auth provider like Supabase Auth or Auth.js

export interface User {
  id: string
  email: string
  name: string
  plan?: string
  createdAt: Date
}

// Mock user storage (in production, use a database)
const users: Map<string, User> = new Map()

export function createUser(email: string, password: string, name: string): User {
  const user: User = {
    id: Math.random().toString(36).substring(7),
    email,
    name,
    createdAt: new Date(),
  }
  users.set(email, user)
  return user
}

export function getUser(email: string): User | undefined {
  return users.get(email)
}

export function updateUserPlan(email: string, planId: string) {
  const user = users.get(email)
  if (user) {
    user.plan = planId
    users.set(email, user)
  }
}
