import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import {
  clearWeekForEveryone,
  getAvailabilityForWeek,
} from "../../stores/availabilityStore";
import { getWeekKeyServer, formatDateDDMMYYYY } from "../../utils/time";

export async function execute(interaction: ChatInputCommandInteraction) {
  const ownerId = process.env.OWNER_ID;
  if (interaction.user.id !== ownerId) {
    await interaction.reply({
      content: "Only Panda can reset the availability week 🕯️",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const isPublic = interaction.options.getBoolean("public") ?? false;
  const weekKey = getWeekKeyServer();

  const removed = clearWeekForEveryone(weekKey);

  const message =
    removed === 0
      ? `No availability entries to clear for week starting ${formatDateDDMMYYYY(
          weekKey
        )}.`
      : `🧹 Cleared availability for **${removed}** people (week starting ${formatDateDDMMYYYY(
          weekKey
        )}).`;

  await interaction.reply({
    content: message,
    ...(isPublic ? {} : { flags: MessageFlags.Ephemeral }),
  });
}
