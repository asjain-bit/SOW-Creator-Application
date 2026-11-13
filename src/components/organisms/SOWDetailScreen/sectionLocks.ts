'use client'

/**
 * Section locks for the Planning and Draft pages.
 *
 * Whoever types in a section locks it for everyone else. The 5 minute countdown starts once the person
 * has been idle for 2 seconds; any further edit puts it back to the full 5 minutes and pauses it again,
 * and when it reaches 0 the section is free for everybody. A person holds one lock per page, so moving to another section hands the first
 * one back.
 *
 * Locks live in localStorage (and are shared across tabs with the storage event), so a second tab or
 * a switch of the viewer role behaves like another person working in the same SOW.
 */

import { useEffect, useState, useSyncExternalStore } from 'react'

export const LOCK_MS = 5 * 60 * 1000
/** The 5 minutes only start counting once the person has been idle for this long */
export const IDLE_MS = 2000

export interface SectionLock {
  /** The role the person is working as (stands in for the person) */
  owner: string
  ownerName: string
  expiresAt: number
}

const STORAGE_KEY = 'sow-section-locks'
type LockMap = Record<string, SectionLock>

const isBrowser = () => typeof window !== 'undefined'

function readStored(): LockMap {
  if (!isBrowser()) return {}
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}') as LockMap
    const now = Date.now()
    return Object.fromEntries(Object.entries(parsed).filter(([, l]) => l && l.expiresAt > now))
  } catch {
    return {}
  }
}

let locks: LockMap = readStored()
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function commit(next: LockMap) {
  locks = next
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // storage can be blocked; the lock still works inside this tab
    }
  }
  emit()
}

if (isBrowser()) {
  window.addEventListener('storage', (e) => {
    if (e.key !== STORAGE_KEY) return
    locks = readStored()
    emit()
  })
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const getSnapshot = () => locks
const getServerSnapshot = (): LockMap => ({})

/** The lock on a section if somebody holds it right now */
export function activeLock(map: LockMap, key: string, now: number): SectionLock | undefined {
  const l = map[key]
  return l && l.expiresAt > now ? l : undefined
}

/**
 * Locks (or keeps, and restarts the 5 minutes on) a section for this person.
 * `pagePrefix` is shared by every section of the page; it is how the person's earlier lock is found and released.
 * Returns false when somebody else holds the section.
 */
export function touchSectionLock(key: string, pagePrefix: string, owner: string, ownerName: string): boolean {
  const now = Date.now()
  const existing = activeLock(locks, key, now)
  if (existing && existing.owner !== owner) return false
  const next: LockMap = {}
  Object.entries(locks).forEach(([k, l]) => {
    if (l.expiresAt <= now) return
    // One lock per person per page
    if (k.startsWith(pagePrefix) && l.owner === owner && k !== key) return
    next[k] = l
  })
  // While the person keeps editing the countdown stays at the full 5 minutes; it starts after 2 seconds without an edit
  next[key] = { owner, ownerName, expiresAt: now + IDLE_MS + LOCK_MS }
  commit(next)
  return true
}

/** Subscribes to the locks and ticks once a second so countdowns stay current */
export function useSectionLocks(): { locks: LockMap; now: number } {
  const map = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  return { locks: map, now }
}

/** Time left on a lock: the full 5 minutes until the person has been idle for 2 seconds, then counting down */
export function lockRemaining(lock: SectionLock, now: number): number {
  return Math.min(LOCK_MS, Math.max(0, lock.expiresAt - now))
}

/** "4:32" */
export function formatLockTime(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

/** The lock this person holds on a page, if any */
export function myLockOnPage(map: LockMap, pagePrefix: string, owner: string, now: number): { key: string; lock: SectionLock } | null {
  for (const [key, lock] of Object.entries(map)) {
    if (key.startsWith(pagePrefix) && lock.owner === owner && lock.expiresAt > now) return { key, lock }
  }
  return null
}
