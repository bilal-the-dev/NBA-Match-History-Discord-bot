const { CommandType } = require("wokcommands");

const { keyAuth } = require("./../config.json");
const {
	handleInteractionError,
	replyOrEditInteraction,
} = require("../utils/interaction");
const { verifyLicense } = require("../utils/keyAuth");
const { sendNotifyEmbed } = require("../utils/embed");

module.exports = {
	// Required for slash commands
	description: "Grab role using your license key",

	type: CommandType.SLASH,
	options: [
		{
			name: "product",
			description: "select the product you wanna get the role for",
			type: 3,
			required: true,
			choices: Object.keys(keyAuth).map((key) => ({ name: key, value: key })),
		},
		{
			name: "key",
			description: "input your license key",
			type: 3,
			required: true,
		},
	],
	// Invoked when a user runs the ping command
	callback: async ({ interaction }) => {
		try {
			const { options, member, client, user } = interaction;

			await interaction.deferReply({ ephemeral: true });

			const productStr = options.getString("product");
			const license = options.getString("key");

			const { APIKey, roleId } = keyAuth[productStr];

			const status = await verifyLicense(APIKey, license);

			if (!status) throw new Error("License key not found ❌");

			await member.roles.add(roleId);

			await replyOrEditInteraction(interaction, {
				content: `Success! added the role <@&${roleId}>`,
			});

			await sendNotifyEmbed({
				title: "Role Given",
				client,
				user,
				license,
				tool: productStr,
				role: `<@&${roleId}>`,
			});
		} catch (error) {
			await handleInteractionError(error, interaction);
		}
	},
};
