import { StringSelectMenuInteraction } from "discord.js";
import { deleteBrainItem, getBrainItemById } from "../../stores/brainStore";
import { typeEmoji } from "../../utils/emojis";

export async function execute(interaction: StringSelectMenuInteraction) {
  const id = Number(interaction.values[0]);

  const item = getBrainItemById(interaction.user.id, id);
  if (!item) {
    await interaction.update({
      content: `❌ Lumen couldn't find that item in your brain.`,
      components: [],
    });
    return;
  }

  deleteBrainItem(interaction.user.id, id);

  await interaction.update({
    content: `🧽 Removed ${typeEmoji[item.type]} **${item.type}** – ${
      item.text
    }`,
    components: [],
  });
}
