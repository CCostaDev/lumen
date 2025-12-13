import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { getUserOffset } from "../../stores/userSettingsStore";

export async function execute(interaction: ChatInputCommandInteraction) {
  const offset = getUserOffset(interaction.user.id);
  const sign = offset >= 0 ? "+" : "";

  await interaction.reply({
    content: `🕰️ Your saved offset is **${sign}${offset} min** vs server time.`,
    flags: MessageFlags.Ephemeral,
  });
}
