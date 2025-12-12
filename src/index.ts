import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  Events,
  ChatInputCommandInteraction,
  MessageFlags,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import {
  addBrainItem,
  getBrainItems,
  deleteBrainItem,
  BrainItemType,
} from "./brainStore";

const token = process.env.DISCORD_TOKEN;
const ownerId = process.env.OWNER_ID;

if (!token) throw new Error("DISCORD_TOKEN is missing in .env");
if (!ownerId) throw new Error("OWNER_ID is missing in .env");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Lumen is online as ${readyClient.user.tag}`);
});

const typeEmoji: Record<BrainItemType, string> = {
  idea: "💡",
  task: "📌",
  bug: "👾",
  note: "📝",
};

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    // Slash commands
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === "ping") {
        await interaction.reply("Pong 🕯️");
        return;
      }

      if (interaction.commandName === "brain") {
        if (interaction.user.id !== ownerId) {
          await interaction.reply({
            content: "This part of Lumen's brain is only wired to Panda 🧠",
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        console.log(`Brain subcommand: ${interaction.options.getSubcommand()}`);
        await handleBrainCommand(interaction);
        return;
      }
    }

    // Select menu for delete
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === "brain-delete-select") {
        if (interaction.user.id !== ownerId) {
          await interaction.update({
            content: "This menu only works for Panda's brain 🧠",
            components: [],
          });
          return;
        }

        const selected = interaction.values[0];
        const id = Number(selected);

        const success = deleteBrainItem(interaction.user.id, id);

        if (!success) {
          await interaction.update({
            content: `❌ Lumen couldn't find an item with id \`#${id}\`.`,
            components: [],
          });
          return;
        }

        await interaction.update({
          content: `🧽 Removed item \`#${id}\` from your brain.`,
          components: [],
        });
      }
    }
  } catch (error) {
    console.error("Error handling interaction:", error);
    if (
      interaction.isRepliable() &&
      !interaction.replied &&
      !interaction.deferred
    ) {
      await interaction.reply({
        content: "Lumen ran into an error handling that interaction 🕯️",
        flags: MessageFlags.Ephemeral,
      });
    }
  }
});

async function handleBrainCommand(interaction: ChatInputCommandInteraction) {
  const sub = interaction.options.getSubcommand();

  switch (sub) {
    case "add": {
      const type = interaction.options.getString("type", true) as BrainItemType;
      const text = interaction.options.getString("text", true);

      const item = addBrainItem(interaction.user.id, type, text);

      await interaction.reply({
        content: `🧠 Stored **${type}** #${item.id}: ${item.text}`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    case "list": {
      const typeStr = interaction.options.getString(
        "type"
      ) as BrainItemType | null;

      const items = getBrainItems(interaction.user.id, typeStr ?? undefined);

      if (items.length === 0) {
        await interaction.reply({
          content: typeStr
            ? `🧠 No **${typeStr}** items in your brain yet.`
            : "🧠 Your brain is currently empty.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const lines = items
        .slice(0, 25)
        .map(
          (item) => `• ${typeEmoji[item.type]} **${item.type}** – ${item.text}`
        );

      await interaction.reply({
        content:
          (typeStr
            ? `🧠 Items in your brain (**${typeStr}**):\n`
            : "🧠 Items in your brain:\n") + lines.join("\n"),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    case "delete": {
      const typeStr = interaction.options.getString(
        "type"
      ) as BrainItemType | null;

      const items = getBrainItems(interaction.user.id, typeStr ?? undefined);

      if (items.length === 0) {
        await interaction.reply({
          content: typeStr
            ? `🧠 No **${typeStr}** items of type **${typeStr}** to delete.`
            : "🧠 Your brain has no items to delete.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const options = items.slice(0, 25).map((item) => ({
        label: `${typeEmoji[item.type]} ${item.type}`,
        description: item.text.slice(0, 90),
        value: String(item.id),
      }));

      const select = new StringSelectMenuBuilder()
        .setCustomId("brain-delete-select")
        .setPlaceholder("Select an item to delete")
        .addOptions(options);

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        select
      );

      await interaction.reply({
        content: "🧽 Choose an item to delete from your brain:",
        components: [row],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    case "random": {
      const typeStr = interaction.options.getString(
        "type"
      ) as BrainItemType | null;

      const items = getBrainItems(interaction.user.id, typeStr ?? undefined);

      if (items.length === 0) {
        await interaction.reply({
          content: typeStr
            ? `🎲 No **${typeStr}** items to select randomly.`
            : "🎲 Your brain has no items to choose from.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const randomItem = items[Math.floor(Math.random() * items.length)];

      await interaction.reply({
        content: `🎲 Random pick:\n${typeEmoji[randomItem.type]}**${
          randomItem.type
        }** – ${randomItem.text}`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    case "focus": {
      const typeStr = interaction.options.getString(
        "type"
      ) as BrainItemType | null;

      const items = getBrainItems(interaction.user.id, typeStr ?? undefined);

      if (items.length === 0) {
        await interaction.reply({
          content: typeStr
            ? `🔍 No **${typeStr}** items found to focus on.`
            : "🔍 No items found to focus on.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const oldest = [...items].sort((a, b) => a.id - b.id)[0];

      await interaction.reply({
        content: `🔍 Focus suggestion:\n${typeEmoji[oldest.type]}**${
          oldest.type
        }** – ${oldest.text}`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    default: {
      await interaction.reply({
        content: "Lumen doesn't recognise that part of the brain yet 🧠",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
  }
}

client.login(token);
