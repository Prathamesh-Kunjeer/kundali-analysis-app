// ============================================================
//  PROFILE STORAGE UTILITY
//  Centralizes all localStorage access for profiles.
//  No UI imports — pure data utility.
// ============================================================

import type { BirthData } from '../core/models';

export interface Profile {
  id: string;
  name: string;           // display name for the profile card
  birth: BirthData;
  createdAt: string;      // ISO timestamp
  updatedAt: string;
}

const KEY_PROFILES   = 'jv_profiles';
const KEY_LAST_ID    = 'jv_last_profile';

function now() { return new Date().toISOString(); }
function uid() { return Math.random().toString(36).slice(2, 10); }

export function loadProfiles(): Profile[] {
  try {
    const raw = localStorage.getItem(KEY_PROFILES);
    return raw ? (JSON.parse(raw) as Profile[]) : [];
  } catch { return []; }
}

export function saveProfiles(profiles: Profile[]): void {
  localStorage.setItem(KEY_PROFILES, JSON.stringify(profiles));
}

export function createProfile(name: string, birth: BirthData): Profile {
  const p: Profile = { id: uid(), name, birth, createdAt: now(), updatedAt: now() };
  const all = loadProfiles();
  all.unshift(p);
  saveProfiles(all);
  return p;
}

export function updateProfile(id: string, name: string, birth: BirthData): Profile | null {
  const all = loadProfiles();
  const idx = all.findIndex(p => p.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], name, birth, updatedAt: now() };
  saveProfiles(all);
  return all[idx];
}

export function deleteProfile(id: string): void {
  const all = loadProfiles().filter(p => p.id !== id);
  saveProfiles(all);
  if (getLastProfileId() === id) clearLastProfileId();
}

export function getLastProfileId(): string | null {
  return localStorage.getItem(KEY_LAST_ID);
}

export function setLastProfileId(id: string): void {
  localStorage.setItem(KEY_LAST_ID, id);
}

export function clearLastProfileId(): void {
  localStorage.removeItem(KEY_LAST_ID);
}
