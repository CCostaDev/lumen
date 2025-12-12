import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { getBrainItems, BrainItemType } from "../../stores/brainStore";
import { typeEmoji } from "../../utils/emojis";

export async function execute(interaction: ChatInputCommandInteraction) {
  const typeStr = interaction.options.getString("type") as BrainItemType | null;
  const items = getBrainItems(interaction.user.id, typeStr ?? undefined);

  if (items.length === 0) {
    await interaction.reply({
      content: typeStr
        ? `🔍 No ${typeEmoji[typeStr]} **${typeStr}** items to focus on.`
        : "🔍 No items to focus on.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  // Oldest = smallest id
  const oldest = [...items].sort((a, b) => a.id - b.id)[0];

  await interaction.reply({
    content: `🔍 Focus suggestion:\n${typeEmoji[oldest.type]} **${
      oldest.type
    }** – ${oldest.text}`,
    flags: MessageFlags.Ephemeral,
  });
}
