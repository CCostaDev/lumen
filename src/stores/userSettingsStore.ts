import fs from "fs";
import path from "path";

export interface UserSettings {
  userId: string;
  offsetMin: number; // minutes vs server time (London = -60)
  updatedAt: string;
}

interface UserSettingsStoreData {
  settings: UserSettings[];
}

const DATA_FILE = path.join(__dirname, "..", "user-settings.json");

function loadStore(): UserSettingsStoreData {
  if (!fs.existsSync(DATA_FILE)) {
    return { settings: [] };
  }

  const raw = fs.readFileSync(DATA_FILE, "utf8");
  try {
    return JSON.parse(raw) as UserSettingsStoreData;
  } catch {
    return { settings: [] };
  }
}

function saveStore(data: UserSettingsStoreData) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

export function setUserOffset(userId: string, offsetMin: number): UserSettings {
  const store = loadStore();

  const existing = store.settings.find((s) => s.userId === userId);
  const now = new Date().toISOString();

  if (existing) {
    existing.offsetMin = offsetMin;
    existing.updatedAt = now;
    saveStore(store);
    return existing;
  }

  const created: UserSettings = {
    userId,
    offsetMin,
    updatedAt: now,
  };

  store.settings.push(created);
  saveStore(store);
  return created;
}

export function getUserOffset(userId: string): number {
  const store = loadStore();
  return store.settings.find((s) => s.userId === userId)?.offsetMin ?? 0;
}
