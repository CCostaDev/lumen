import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { setUserOffset } from "../../stores/userSettingsStore";

export async function execute(interaction: ChatInputCommandInteraction) {
  const offset = interaction.options.getInteger("offset", true);

  if (offset < -720 || offset > 720) {
    await interaction.reply({
      content: "Offset must be between **-720** and **+720** minutes.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  setUserOffset(interaction.user.id, offset);

  await interaction.reply({
    content: `🕰️ Saved your timezone offset as **${offset} min** (vs server).`,
    flags: MessageFlags.Ephemeral,
  });
}
