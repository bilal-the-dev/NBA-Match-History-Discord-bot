const { Client, IntentsBitField, Partials } = require("discord.js");
const WOK = require("wokcommands");
const puppeteer = require("puppeteer");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: ".env" });

const { TOKEN } = process.env;

const client = new Client({
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.GuildMembers,
		IntentsBitField.Flags.DirectMessages,
		IntentsBitField.Flags.MessageContent,
		IntentsBitField.Flags.GuildInvites,
	],
	partials: [Partials.Channel],
});

client.on("ready", async (readyClient) => {
	console.log(`${readyClient.user.username} is running 🥗`);

	const { DefaultCommands } = WOK;
	new WOK({
		client,
		commandsDir: path.join(__dirname, "./commands"),
		events: {
			dir: path.join(__dirname, "events"),
		},
		disabledDefaultCommands: [
			DefaultCommands.ChannelCommand,
			DefaultCommands.CustomCommand,
			DefaultCommands.Prefix,
			DefaultCommands.RequiredPermissions,
			DefaultCommands.RequiredRoles,
			DefaultCommands.ToggleCommand,
		],
		cooldownConfig: {
			errorMessage: "Please wait {TIME} before doing that again.",
			botOwnersBypass: false,
			dbRequired: 300,
		},
	});
});

(async function () {
	client.browser = await puppeteer.launch({ headless: false });
})();

process.on("exit", async (code) => {
	console.log(`Node.js process exited with code ${code}`);

	if (client.browser.isConnected()) {
		console.log("the browser is closing");
		await client.browser.close();
		client.browser = null;
	}
});
client.login(TOKEN);
