import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  Events,
  ChatInputCommandInteraction,
} from "discord.js";

const token = process.env.DISCORD_TOKEN;
if (!token) throw new Error("DISCORD_TOKEN missing in .env");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// v15-safe event name
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Lumen is online as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("Pong 🕯️");
  }
});

client.login(token);
