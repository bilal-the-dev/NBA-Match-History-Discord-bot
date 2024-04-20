const puppeteer = require("puppeteer");
const { CommandType, CooldownTypes } = require("wokcommands");
const handleInteractionReply = require("../handleInteractionReply");

const url = "https://www.nba.com/players";

module.exports = {
	// Required for slash commands
	description: "Grab the last five matches of player from NBA website",

	type: CommandType.SLASH,
	cooldowns: {
		type: CooldownTypes.global,
		duration: "25 s",
	},
	options: [
		{
			name: "player_name",
			description:
				"enter the player name (first / last name but correctly spelled)",
			type: 3,
			required: true,
		},
	],
	// Invoked when a user runs the ping command
	callback: async ({ interaction }) => {
		let browser;
		try {
			const { options } = interaction;

			await interaction.deferReply();

			const playerName = options.getString("player_name");

			browser = await puppeteer.launch();
			const page = await browser.newPage();
			await page.setViewport({ width: 1200, height: 800 });

			await page.goto(url);

			const tableBodySelector =
				"#__next > div.Layout_base__6IeUC.Layout_justNav__2H4H0.Layout_withSubNav__ByKRF > div.Layout_mainContent__jXliI > main > div.MaxWidthContainer_mwc__ID5AG > section > div > div.PlayerList_content__kwT7z > div.PlayerList_playerTable__Jno0k > div > div > div > table > tbody";

			await page.waitForSelector(
				"#__next > div.Layout_base__6IeUC.Layout_justNav__2H4H0.Layout_withSubNav__ByKRF > div.Layout_mainContent__jXliI > main > div.MaxWidthContainer_mwc__ID5AG > section",
			);

			function wait(ms) {
				return new Promise((resolve) => setTimeout(resolve, ms));
			}

			await page.type("input[type=text]", playerName);

			await wait(1000 * 2);

			const player = await page.$(
				`${tableBodySelector} > tr:nth-child(1)> td.primary.text.RosterRow_primaryCol__1lto4`,
			);

			if (!player) throw new Error("No player found");

			const hrefLink = await player.$eval("a", (element) => element.href);

			if (!hrefLink) throw new Error("No player found");

			await handleInteractionReply(
				interaction,
				`Found the player, YAY. Getting the games to you in a moment.`,
			);

			await page.goto(hrefLink);

			console.log(hrefLink);

			const lastGamesSelector =
				"#__next > div.Layout_base__6IeUC.Layout_justNav__2H4H0 > div.Layout_mainContent__jXliI > section > div.MaxWidthContainer_mwc__ID5AG.PlayerView_pvSection__whddS > section:nth-child(2)";

			await page.waitForSelector(lastGamesSelector);

			const games = await page.$(lastGamesSelector);

			const boundingBox = await games.boundingBox();

			const encode = await page.screenshot({
				optimizeForSpeed: true,
				clip: {
					x: boundingBox.x,
					y: boundingBox.y,
					width: boundingBox.width,
					height: boundingBox.height,
				},
				encoding: "binary",
			});

			await handleInteractionReply(interaction, {
				content: hrefLink,
				files: [encode],
			});
		} catch (error) {
			console.log(error);
			await handleInteractionReply(interaction, error.message);
		} finally {
			browser && (await browser.close().catch((e) => console.log(e)));
		}
	},
};
