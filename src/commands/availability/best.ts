import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { getAvailabilityForWeek } from "../../stores/availabilityStore";
import {
  getWeekKeyServer,
  toHHMM,
  dayName,
  formatDateDDMMYYYY,
} from "../../utils/time";

const BLOCK_SIZE = 30; // minutes

export async function execute(interaction: ChatInputCommandInteraction) {
  const weekKey = getWeekKeyServer();
  const entries = getAvailabilityForWeek(weekKey);

  if (entries.length === 0) {
    await interaction.reply({
      content: "No availability saved for this week yet.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const minPlayers =
    interaction.options.getInteger("min_players") ?? entries.length;

  // day -> blockStartMin -> set(userId)
  const blocks: Map<number, Map<number, Set<string>>> = new Map();

  for (const entry of entries) {
    for (const range of entry.ranges) {
      for (
        let t = range.startMin;
        t + BLOCK_SIZE <= range.endMin;
        t += BLOCK_SIZE
      ) {
        if (!blocks.has(range.day)) blocks.set(range.day, new Map());
        const dayMap = blocks.get(range.day)!;

        if (!dayMap.has(t)) dayMap.set(t, new Set());
        dayMap.get(t)!.add(entry.userId);
      }
    }
  }

  type Window = {
    day: number;
    start: number;
    end: number;
    users: Set<string>;
  };

  const windows: Window[] = [];

  for (const [day, dayMap] of blocks.entries()) {
    const times = [...dayMap.keys()].sort((a, b) => a - b);

    let current: Window | null = null;

    for (const t of times) {
      const users = dayMap.get(t)!;

      if (users.size < minPlayers) {
        current = null;
        continue;
      }

      if (current && current.end === t && setsEqual(current.users, users)) {
        current.end += BLOCK_SIZE;
      } else {
        current = {
          day,
          start: t,
          end: t + BLOCK_SIZE,
          users,
        };
        windows.push(current);
      }
    }
  }

  if (windows.length === 0) {
    await interaction.reply({
      content: `No overlap found with **${minPlayers}** players available.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  // Sort by: most people → longest duration
  windows.sort((a, b) => {
    if (b.users.size !== a.users.size) {
      return b.users.size - a.users.size;
    }
    return b.end - b.start - (a.end - a.start);
  });

  const top = windows.slice(0, 3);

  const lines = top.map((w) => {
    const mentions = [...w.users].map((id) => `<@${id}>`).join(" ");
    return `• **${dayName(w.day)} ${toHHMM(w.start)}–${toHHMM(w.end)}** (${
      w.users.size
    }/${entries.length})\n  ${mentions}`;
  });

  const isPublic = interaction.options.getBoolean("public") ?? false;

  await interaction.reply({
    content: `✨ **Best overlap times (Week starting Mon ${formatDateDDMMYYYY(
      weekKey
    )})**\n${lines.join("\n")}\n\n*Times shown in server time.*`,
    ...(isPublic ? {} : { flags: MessageFlags.Ephemeral }),
  });
}

// ---- helpers ----
function setsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const v of a) if (!b.has(v)) return false;
  return true;
}
