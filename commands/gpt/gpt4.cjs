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
		interaction.deferReply();

		const response = await axios.get(`${openaiUrl}/discord`, {
			params: { prompt: interaction.options.getString('prompt'), }
		});

		const responseParts = await this.generateResponseParts(response.data);

		await Promise.all(responseParts.map(part => interaction.channel.send(part)));

		interaction.editReply('-----------------//-----------------');
	},

	async generateResponseParts(response) {
		// Separate code snippets from the response using regex
		const codeSnippetPattern = /```[\s\S]*?```/g;
		const codeSnippets = Array.from(response.matchAll(codeSnippetPattern)).map(m => m[0]);
		const nonCodeParts = response.split(codeSnippetPattern);

		// Combine non-code parts and code snippets into a new list
		let responseParts = [];
		let snippetCount = codeSnippets.length;
		
		for (let i = 0; i < nonCodeParts.length; i++) {
			const nonCodePart = nonCodeParts[i].trim();
			const codeSnippet = i < snippetCount ? codeSnippets[i].trim() : '';
			if (nonCodePart) { responseParts.push(nonCodePart); }
			if (codeSnippet) { responseParts.push(codeSnippet); }
		}

		// Split the response parts if they exceed the character limit
		const maxLength = 2000;
		let splitResponseParts = [];

		for (const part of responseParts) {
			for (let i = 0; i < part.length; i += maxLength) {
				const blockSize = Math.min(maxLength, part.length - i);
				splitResponseParts.push(part.substring(i, i + blockSize));
			}
		}

		return splitResponseParts;
	},
};
