const { SlashCommandBuilder } = require('discord.js');
const { openaiUrl } = require('../../config.json');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dalle')
		.setDescription('Generate anything!')
		.addStringOption(option => option.setName('prompt')
			.setDescription('Enter your prompt here.')
			.setRequired(true)),

	async execute(interaction) {
		interaction.deferReply();

		const response = await axios.get(`${openaiUrl}/dall-e`, {
			params: { prompt: interaction.options.getString('prompt'), }
		});

        interaction.channel.send(response.data)

		interaction.editReply('----------------------------------//----------------------------------');
	},
};
