import "dotenv/config";
import { REST, Routes, SlashCommandBuilder } from "discord.js";

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

if (!token) throw new Error("DISCORD_TOKEN missing in .env");
if (!clientId) throw new Error("CLIENT_ID missing in .env");

const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong from Lumen 🕯️"),
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
