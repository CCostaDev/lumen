import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
  StringSelectMenuBuilder,
} from "discord.js";
import { getBrainItems, BrainItemType } from "../../stores/brainStore";
import { typeEmoji } from "../../utils/emojis";

export async function execute(interaction: ChatInputCommandInteraction) {
  const typeStr = interaction.options.getString("type") as BrainItemType | null;
  const items = getBrainItems(interaction.user.id, typeStr ?? undefined);

  if (items.length === 0) {
    await interaction.reply({
      content: typeStr
        ? `🧽 No ${typeEmoji[typeStr]} **${typeStr}** items to delete.`
        : "🧽 No items to delete.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const options = items.slice(0, 25).map((item) => ({
    label: `${typeEmoji[item.type]} ${item.type}`,
    description: item.text.slice(0, 90),
    value: String(item.id), // internal only
  }));

  const select = new StringSelectMenuBuilder()
    .setCustomId("brain-delete-select")
    .setPlaceholder("Select an item to delete")
    .addOptions(options);

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    select
  );

  await interaction.reply({
    content: "🧽 Choose an item to delete:",
    components: [row],
    flags: MessageFlags.Ephemeral,
  });
}
