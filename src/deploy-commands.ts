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
