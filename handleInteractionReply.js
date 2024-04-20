module.exports = async (interaction, reply) => {
	if (interaction.deferred || interaction.replied)
		return await interaction.editReply(reply);
	await interaction.reply(reply);
};
