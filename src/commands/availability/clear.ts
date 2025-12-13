import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { clearAvailability } from "../../stores/availabilityStore";
import { getWeekKeyServer } from "../../utils/time";

export async function execute(interaction: ChatInputCommandInteraction) {
  const weekKey = getWeekKeyServer();
  const ok = clearAvailability(interaction.user.id, weekKey);

  await interaction.reply({
    content: ok
      ? "🧹 Cleared your availability for this week."
      : "Nothing to clear for this week.",
    flags: MessageFlags.Ephemeral,
  });
}
