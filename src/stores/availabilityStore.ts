import fs from "fs";
import path from "path";

export interface AvailabilityRange {
  // 0..6 (Mon..Sun)
  day: number;
  // minutes from midnight in SERVER time
  startMin: number;
  endMin: number;
}

export interface AvailabilityEntry {
  userId: string;
  weekKey: string; // YYYY-MM-DD (Monday)
  ranges: AvailabilityRange[];
  updatedAt: string;
}

interface AvailabilityStoreData {
  entries: AvailabilityEntry[];
}

const DATA_FILE = path.join(__dirname, "..", "availability-data.json");

function loadStore(): AvailabilityStoreData {
  if (!fs.existsSync(DATA_FILE)) {
    return { entries: [] };
  }

  const raw = fs.readFileSync(DATA_FILE, "utf8");
  try {
    return JSON.parse(raw) as AvailabilityStoreData;
  } catch {
    return { entries: [] };
  }
}

function saveStore(data: AvailabilityStoreData) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

export function upsertAvailability(
  userId: string,
  weekKey: string,
  ranges: AvailabilityRange[]
): AvailabilityEntry {
  const store = loadStore();
  const now = new Date().toISOString();

  const existing = store.entries.find(
    (e) => e.userId === userId && e.weekKey === weekKey
  );

  if (existing) {
    existing.ranges = ranges;
    existing.updatedAt = now;
    saveStore(store);
    return existing;
  }

  const created: AvailabilityEntry = {
    userId,
    weekKey,
    ranges,
    updatedAt: now,
  };

  store.entries.push(created);
  saveStore(store);
  return created;
}

export function getAvailabilityForWeek(weekKey: string): AvailabilityEntry[] {
  const store = loadStore();
  return store.entries.filter((e) => e.weekKey === weekKey);
}

export function clearAvailability(userId: string, weekKey: string): boolean {
  const store = loadStore();
  const before = store.entries.length;

  store.entries = store.entries.filter(
    (e) => !(e.userId === userId && e.weekKey === weekKey)
  );

  if (store.entries.length === before) return false;

  saveStore(store);
  return true;
}

export function getUserAvailability(
  userId: string,
  weekKey: string
): AvailabilityEntry | undefined {
  const store = loadStore();
  return store.entries.find(
    (e) => e.userId === userId && e.weekKey === weekKey
  );
}
