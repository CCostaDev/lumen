import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { getBrainItems, BrainItemType } from "../../stores/brainStore";
import { typeEmoji } from "../../utils/emojis";

export async function execute(interaction: ChatInputCommandInteraction) {
  const typeStr = interaction.options.getString("type") as BrainItemType | null;
  const items = getBrainItems(interaction.user.id, typeStr ?? undefined);

  if (items.length === 0) {
    await interaction.reply({
      content: typeStr
        ? `🧠 No ${typeEmoji[typeStr]} **${typeStr}** items yet.`
        : "🧠 Your brain is currently empty.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const lines = items
    .slice(0, 25)
    .map((item) => `• ${typeEmoji[item.type]} **${item.type}** – ${item.text}`);

  await interaction.reply({
    content:
      (typeStr
        ? `🧠 Items in your brain (${typeEmoji[typeStr]} **${typeStr}**):\n`
        : "🧠 Items in your brain:\n") + lines.join("\n"),
    flags: MessageFlags.Ephemeral,
  });
}
