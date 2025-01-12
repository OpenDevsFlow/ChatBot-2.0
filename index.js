/**
 * @author OpenDevsFlow
 * @website https://opendevsflow.xyz
 * @discord https://discord.gg/6UGYjhSS5v
 * @license MIT
 */

const { Client, GatewayIntentBits, Partials, AttachmentBuilder, ActivityType } = require("discord.odf");
const { NextChat } = require("enplex.js");
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.once("ready", () => {
  console.log(`Bot logged in as ${client.user.tag}`);
  client.user.setActivity("OpenDevsFlow!", { type: ActivityType.Playing });
});

/**
 * Determines if a message should trigger a bot response.
 * @param {Message} message The Discord message object.
 * @returns {boolean} True if the bot should respond, false otherwise.
 */
function shouldProcess(message) {
  if (message.author.bot) return false;

  const prompt = message.content.replace(`<@${client.user.id}>`, "").trim();

  return (
    (message.mentions.has(client.user) && !message.mentions.everyone && !message.mentions.here)
  );
}

/**
 * Checks if a prompt is an image generation request.
 * @param {string} prompt The message content.
 * @returns {boolean}
 */
const isImageRequest = (prompt) => /^(imagine|draw|image)\b/i.test(prompt);

/**
 * Checks if a prompt is a text-to-speech request.
 * @param {string} prompt The message content.
 * @returns {boolean}
 */
const isTTSRequest = (prompt) => /^tts\b/i.test(prompt);

client.on("messageCreate", async (message) => {
  if (!shouldProcess(message)) return;

  const prompt = message.content.replace(`<@${client.user.id}>`, "").trim();

  try {
    message.channel.sendTyping();

    if (shouldProcess(message) && isImageRequest(prompt)) {
      const response = await NextChat.imagine(prompt, { model: "mageai" });
      const attachment = new AttachmentBuilder(Buffer.from(response, "base64"), { name: "image.png" });
      await message.reply({ content: "Generated Image:", files: [attachment] });
    } else if (shouldProcess(message) && isTTSRequest(prompt)) {
      const response = await NextChat.tts(prompt.replace(/^tts\b/i, "").trim());
      const attachment = new AttachmentBuilder(Buffer.from(response, "base64"), { name: "audio.mp3" });
      await message.reply({ content: "Generated Audio:", files: [attachment] });
    } else {
      const response = await NextChat.ask(prompt, { model: "gemini", cache: true });

      if (response.length > 2000) {
        const chunks = response.match(new RegExp(`[\\s\\S]{1,${2000}}`, 'g')) || [];
        for (const chunk of chunks) {
          await message.reply({ content: chunk });
        }
      } else {
        await message.reply({ content: response });
      }
    }
  } catch (error) {
    console.error("Error processing request:", error);
    message.reply("An error occurred. Please try again later.");
  }
});

client.login(process.env.TOKEN);

/**
 * @author OpenDevsFlow
 * @website https://opendevsflow.xyz
 * @discord https://discord.gg/6UGYjhSS5v
 * @license MIT
 */
