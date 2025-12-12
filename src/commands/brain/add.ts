import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { addBrainItem, BrainItemType } from "../../stores/brainStore";
import { typeEmoji } from "../../utils/emojis";

export async function execute(interaction: ChatInputCommandInteraction) {
  const type = interaction.options.getString("type", true) as BrainItemType;
  const text = interaction.options.getString("text", true);

  const item = addBrainItem(interaction.user.id, type, text);

  await interaction.reply({
    content: `🧠 Stored ${typeEmoji[item.type]} **${item.type}** – ${
      item.text
    }`,
    flags: MessageFlags.Ephemeral,
  });
}
