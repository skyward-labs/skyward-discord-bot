const { SlashCommandBuilder } = require('discord.js');
const { openaiUrl } = require('../../config.json');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gpt')
		.setDescription('Ask anything!')
		.addStringOption(option => option.setName('prompt')
			.setDescription('Enter your prompt here.')
			.setRequired(true)),

	async execute(interaction) {
		try {
			await interaction.deferReply();

			const response = await axios.get(`${openaiUrl}/discord`, {
				params: { prompt: interaction.options.getString('prompt'), }
			});

			const answerParts = await this.generateAnswerParts(response.data);

			answerParts.forEach(async element => {
				interaction.channel.send(element);
			});

			await interaction.editReply('Done!');
		}
		catch (error) {
			interaction.editReply({ content: `An exception has ocurred. ${error}` });
		}
	},

	async generateAnswerParts(answer) {
		// Separate code snippets from the answer using regex
		const codeSnippetPattern = /```[\s\S]*?```/g;
		const codeSnippets = Array.from(answer.matchAll(codeSnippetPattern)).map(m => m[0]);
		const nonCodeParts = answer.split(codeSnippetPattern);

		// Combine non-code parts and code snippets into a new list
		let answerParts = [];
		let snippetCount = codeSnippets.length;
		for (let i = 0; i < nonCodeParts.length; i++) {
			const nonCodePart = nonCodeParts[i].trim();
			const codeSnippet = i < snippetCount ? codeSnippets[i].trim() : '';

			if (nonCodePart) {
				answerParts.push(nonCodePart);
			}
			if (codeSnippet) {
				answerParts.push(codeSnippet);
			}
		}

		// Split the answer parts if they exceed the character limit
		const maxLength = 2000;
		let splitAnswerParts = [];
		for (const part of answerParts) {
			for (let i = 0; i < part.length; i += maxLength) {
				const blockSize = Math.min(maxLength, part.length - i);
				splitAnswerParts.push(part.substring(i, i + blockSize));
			}
		}

		return splitAnswerParts;
	}
};  
