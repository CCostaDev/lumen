import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { getAvailabilityForWeek } from "../../stores/availabilityStore";
import {
  getWeekKeyServer,
  toHHMM,
  dayName,
  formatDateDDMMYYYY,
} from "../../utils/time";

export async function execute(interaction: ChatInputCommandInteraction) {
  const weekKey = getWeekKeyServer();
  const entries = getAvailabilityForWeek(weekKey);

  if (entries.length === 0) {
    await interaction.reply({
      content: "No availability saved for this week yet.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const lines = entries
    .map((e) => {
      const ranges = e.ranges
        .sort((a, b) => a.day - b.day || a.startMin - b.startMin)
        .map(
          (r) => `${dayName(r.day)} ${toHHMM(r.startMin)}–${toHHMM(r.endMin)}`
        )
        .join(", ");
      return `• <@${e.userId}>: ${ranges || "—"}`;
    })
    .join("\n");

  const isPublic = interaction.options.getBoolean("public") ?? false;

  await interaction.reply({
    content: `📅 **Availability (Week starting Mon ${formatDateDDMMYYYY(
      weekKey
    )})**\n${lines}\n\n*Times shown in server time.*`,
    ...(isPublic ? {} : { flags: MessageFlags.Ephemeral }),
  });
}
