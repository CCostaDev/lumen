import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { getBrainItems, BrainItemType } from "../../stores/brainStore";
import { typeEmoji } from "../../utils/emojis";

export async function execute(interaction: ChatInputCommandInteraction) {
  const typeStr = interaction.options.getString("type") as BrainItemType | null;
  const items = getBrainItems(interaction.user.id, typeStr ?? undefined);

  if (items.length === 0) {
    await interaction.reply({
      content: typeStr
        ? `🎲 No ${typeEmoji[typeStr]} **${typeStr}** items to pick from.`
        : "🎲 Your brain has no items to choose from.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const pick = items[Math.floor(Math.random() * items.length)];

  await interaction.reply({
    content: `🎲 Random pick:\n${typeEmoji[pick.type]} **${pick.type}** – ${
      pick.text
    }`,
    flags: MessageFlags.Ephemeral,
  });
}
