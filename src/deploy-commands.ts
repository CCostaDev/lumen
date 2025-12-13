import "dotenv/config";
import { REST, Routes, SlashCommandBuilder } from "discord.js";

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

if (!token) throw new Error("DISCORD_TOKEN missing from .env");
if (!clientId) throw new Error("CLIENT_ID missing from .env");

const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong from Lumen 🕯️"),

  new SlashCommandBuilder()
    .setName("brain")
    .setDescription("Manage your second brain")
    // /brain add
    .addSubcommand((sub) =>
      sub
        .setName("add")
        .setDescription("Add an item to your brain")
        .addStringOption((opt) =>
          opt
            .setName("type")
            .setDescription("Type of item")
            .setRequired(true)
            .addChoices(
              { name: "Idea", value: "idea" },
              { name: "Bug", value: "bug" },
              { name: "Task", value: "task" },
              { name: "Note", value: "note" }
            )
        )
        .addStringOption((opt) =>
          opt
            .setName("text")
            .setDescription("What do you want Lumen to remember?")
            .setRequired(true)
        )
    )
    // /brain list
    .addSubcommand((sub) =>
      sub
        .setName("list")
        .setDescription("List items in your brain")
        .addStringOption((opt) =>
          opt
            .setName("type")
            .setDescription("Filter by type")
            .setRequired(false)
            .addChoices(
              { name: "Idea", value: "idea" },
              { name: "Bug", value: "bug" },
              { name: "Task", value: "task" },
              { name: "Note", value: "note" }
            )
        )
    )
    // /brain delete
    .addSubcommand((sub) =>
      sub
        .setName("delete")
        .setDescription("Delete an item from your brain")
        .addStringOption((opt) =>
          opt
            .setName("type")
            .setDescription("Filter by type")
            .setRequired(false)
            .addChoices(
              { name: "Idea", value: "idea" },
              { name: "Bug", value: "bug" },
              { name: "Task", value: "task" },
              { name: "Note", value: "note" }
            )
        )
    )
    // /brain random
    .addSubcommand((sub) =>
      sub
        .setName("random")
        .setDescription("Pick a random item from your brain")
        .addStringOption((opt) =>
          opt
            .setName("type")
            .setDescription("Filter by type")
            .setRequired(false)
            .addChoices(
              { name: "Idea", value: "idea" },
              { name: "Bug", value: "bug" },
              { name: "Task", value: "task" },
              { name: "Note", value: "note" }
            )
        )
    )
    // /brain focus
    .addSubcommand((sub) =>
      sub
        .setName("focus")
        .setDescription("Pick the oldest item you should focus on")
        .addStringOption((opt) =>
          opt
            .setName("type")
            .setDescription("Filter by type")
            .setRequired(false)
            .addChoices(
              { name: "Idea", value: "idea" },
              { name: "Bug", value: "bug" },
              { name: "Task", value: "task" },
              { name: "Note", value: "note" }
            )
        )
    ),

  // -------------------------
  // Timezone (simple offset)
  // -------------------------
  new SlashCommandBuilder()
    .setName("tz")
    .setDescription("Set/show your timezone offset")
    .addSubcommand((sub) =>
      sub
        .setName("set")
        .setDescription(
          "Set your timezone offset in minutes (e.g. London = -60)"
        )
        .addIntegerOption((opt) =>
          opt
            .setName("offset")
            .setDescription("Offset from server time, in minutes (e.g. -60)")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub.setName("show").setDescription("Show your saved timezone offset")
    ),

  // -------------------------
  // Availability (weekly)
  // -------------------------
  new SlashCommandBuilder()
    .setName("availability")
    .setDescription("Set/view weekly availability and find overlaps")
    .addSubcommand((sub) =>
      sub
        .setName("set")
        .setDescription("Set your availability (in your local time)")
        .addIntegerOption((opt) =>
          opt
            .setName("day")
            .setDescription("Day of week")
            .setRequired(true)
            .addChoices(
              { name: "Mon", value: 0 },
              { name: "Tue", value: 1 },
              { name: "Wed", value: 2 },
              { name: "Thu", value: 3 },
              { name: "Fri", value: 4 },
              { name: "Sat", value: 5 },
              { name: "Sun", value: 6 }
            )
        )
        .addStringOption((opt) =>
          opt
            .setName("start")
            .setDescription("Start time (HH:mm) e.g. 20:00")
            .setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName("end")
            .setDescription("End time (HH:mm) e.g. 23:00")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("view")
        .setDescription("View availability for this week")
        .addBooleanOption((opt) =>
          opt
            .setName("public")
            .setDescription("Post in the channel instead of only you")
            .setRequired(false)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("best")
        .setDescription("Find the best overlap times for this week")
        .addIntegerOption((opt) =>
          opt
            .setName("min_players")
            .setDescription(
              "Minimum number of people needed (default: everyone)"
            )
            .setRequired(false)
        )
        .addBooleanOption((opt) =>
          opt
            .setName("public")
            .setDescription("Post in the channel instead of only you")
            .setRequired(false)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("clear")
        .setDescription("Clear your availability for this week")
    ),
].map((cmd) => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log("Registering application (/) commands...");

    await rest.put(Routes.applicationCommands(clientId), { body: commands });

    console.log("✅ Successfully registered commands.");
  } catch (error) {
    console.error("❌ Error registering commands:", error);
  }
})();
