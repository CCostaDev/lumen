import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { getUserOffset } from "../../stores/userSettingsStore";
import {
  upsertAvailability,
  getUserAvailability,
} from "../../stores/availabilityStore";
import { parseHHMM, getWeekKeyServer, dayName } from "../../utils/time";

export async function execute(interaction: ChatInputCommandInteraction) {
  const userId = interaction.user.id;

  const day = interaction.options.getInteger("day", true);
  const startStr = interaction.options.getString("start", true);
  const endStr = interaction.options.getString("end", true);

  const weekKey = getWeekKeyServer();
  const offset = getUserOffset(userId);

  try {
    let startMinLocal = parseHHMM(startStr);
    let endMinLocal = parseHHMM(endStr);

    if (endMinLocal <= startMinLocal) {
      await interaction.reply({
        content: "For v1, **end** must be after **start** (same day).",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Convert local -> server by subtracting the user's offset
    // (London offset -60 => server = local - (-60) => +60)
    const startMinServer = startMinLocal - offset;
    const endMinServer = endMinLocal - offset;

    const existing = getUserAvailability(userId, weekKey);
    const ranges = existing?.ranges ?? [];

    // Replace range for that day
    const next = ranges.filter((r) => r.day !== day);
    next.push({ day, startMin: startMinServer, endMin: endMinServer });

    upsertAvailability(userId, weekKey, next);

    await interaction.reply({
      content: `📌 Saved: **${dayName(
        day
      )} ${startStr}–${endStr}** (your local).`,
      flags: MessageFlags.Ephemeral,
    });
  } catch (e: any) {
    await interaction.reply({
      content: `⚠️ ${e?.message ?? "Invalid time format."}`,
      flags: MessageFlags.Ephemeral,
    });
  }
}
