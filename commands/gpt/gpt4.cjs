const { SlashCommandBuilder } = require('discord.js');
const { openaiUrl } = require('../../config.json');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gpt')
		.setDescription('Ask anything!')
		.addStringOption(option => option.setName('question')
			.setDescription('Enter your question')
			.setRequired(true)),

	async execute(interaction) {
		await interaction.reply({ content: 'Thinking...', ephemeral: false });

		try {
			const response = await axios.get(`${openaiUrl}/discord`, {
				params: { prompt: interaction.options.getString('question'), }
			});

			interaction.editReply({ content: `${response.data}` });
		}
		catch (error) {
			interaction.editReply({ content: `An exception has ocurred.` });
		}
	},
};  
