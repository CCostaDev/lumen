import "dotenv/config";
import { Client, GatewayIntentBits, Events, MessageFlags } from "discord.js";

import * as ping from "./commands/ping";

import * as brainAdd from "./commands/brain/add";
import * as brainList from "./commands/brain/list";
import * as brainRandom from "./commands/brain/random";
import * as brainFocus from "./commands/brain/focus";
import * as brainDelete from "./commands/brain/delete";
import * as brainSelectDelete from "./commands/brain/selectDelete";

const token = process.env.DISCORD_TOKEN;
const ownerId = process.env.OWNER_ID;

if (!token) throw new Error("DISCORD_TOKEN is missing in .env");
if (!ownerId) throw new Error("OWNER_ID is missing in .env");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// “TS cogs” router: commandName + optional subcommand => handler
const chatHandlers: Record<string, (i: any) => Promise<void>> = {
  ping: ping.execute,

  "brain:add": brainAdd.execute,
  "brain:list": brainList.execute,
  "brain:random": brainRandom.execute,
  "brain:focus": brainFocus.execute,
  "brain:delete": brainDelete.execute,
};

// Component handlers (select menus/buttons)
const componentHandlers: Record<string, (i: any) => Promise<void>> = {
  "brain-delete-select": brainSelectDelete.execute,
};

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Lumen is online as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const name = interaction.commandName;

      // brain is owner-only
      if (name === "brain" && interaction.user.id !== ownerId) {
        await interaction.reply({
          content: "This part of Lumen's brain is only wired to Cris 🧠",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const key =
        name === "brain"
          ? `${name}:${interaction.options.getSubcommand()}`
          : name;

      const handler = chatHandlers[key];
      if (!handler) return;

      await handler(interaction);
      return;
    }

    if (interaction.isStringSelectMenu()) {
      const handler = componentHandlers[interaction.customId];
      if (!handler) return;

      if (interaction.user.id !== ownerId) {
        await interaction.update({
          content: "This menu only works for Cris' brain 🧠",
          components: [],
        });
        return;
      }

      await handler(interaction);
    }
  } catch (err) {
    console.error("Error handling interaction:", err);

    if (
      interaction.isRepliable() &&
      !interaction.replied &&
      !interaction.deferred
    ) {
      await interaction.reply({
        content: "Lumen ran into an error 🕯️",
        flags: MessageFlags.Ephemeral,
      });
    }
  }
});

client.login(token);
