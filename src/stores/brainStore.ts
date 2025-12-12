import fs from "fs";
import path from "path";

export type BrainItemType = "idea" | "bug" | "task" | "note";

export interface BrainItem {
  id: number;
  userId: string;
  type: BrainItemType;
  text: string;
  createdAt: string;
}

interface BrainStoreData {
  lastId: number;
  items: BrainItem[];
}

const DATA_FILE = path.join(__dirname, "..", "brain-data.json");

function loadStore(): BrainStoreData {
  if (!fs.existsSync(DATA_FILE)) {
    return { lastId: 0, items: [] };
  }

  const raw = fs.readFileSync(DATA_FILE, "utf8");
  try {
    return JSON.parse(raw) as BrainStoreData;
  } catch {
    return { lastId: 0, items: [] };
  }
}

function saveStore(data: BrainStoreData) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

export function addBrainItem(
  userId: string,
  type: BrainItemType,
  text: string
): BrainItem {
  const store = loadStore();
  const newItem: BrainItem = {
    id: store.lastId + 1,
    userId,
    type,
    text,
    createdAt: new Date().toISOString(),
  };

  store.lastId = newItem.id;
  store.items.push(newItem);
  saveStore(store);

  return newItem;
}

export function getBrainItems(
  userId: string,
  type?: BrainItemType
): BrainItem[] {
  const store = loadStore();
  return store.items.filter((item) => {
    if (item.userId !== userId) return false;
    if (type && item.type !== type) return false;
    return true;
  });
}

export function deleteBrainItem(userId: string, id: number): boolean {
  const store = loadStore();

  const index = store.items.findIndex(
    (item) => item.id === id && item.userId === userId
  );

  if (index === -1) {
    return false;
  }

  store.items.splice(index, 1);
  saveStore(store);
  return true;
}

export function getBrainItemById(
  userId: string,
  id: number
): BrainItem | undefined {
  const store = loadStore();
  return store.items.find((item) => item.id === id && item.userId === userId);
}
