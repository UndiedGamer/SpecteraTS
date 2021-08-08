import ms from 'ms';
import { CallbackFunction, Command } from '../interfaces/Command';
import { EmbedFieldData, MessageEmbed } from 'discord.js';
import { Anything } from '../interfaces/Anything';
import { guildPrefixes } from '../mongodb/LoadPrefixes';

export const run: CallbackFunction = async (client, message, args) => {
	const prefix = guildPrefixes[message.guild.id];
	const fields: Array<EmbedFieldData> = [...client.categories].map(
		(category) => {
			return {
				name: `${category[0].toUpperCase() + category.slice(1)} [${
					client.commands.filter(
						(command: Command) => command.category == category
					).size
				}]`,
				value: client.commands
					.filter((cmd: Command) => cmd.category == category)
					.map((cmd: Command) => `\`${cmd.name}\``)
					.join(', '),
			};
		}
	);
	const commandEmbed: MessageEmbed = client.neutralEmbed(
		{ fields, description: '**Help Command**' },
		message
	);
	if (!args.length) return message.reply({ embeds: [commandEmbed] });
	const cmd: Command =
		client.commands.get(args[0].toLowerCase()) ||
		client.commands.get(client.aliases.get(args[0].toLowerCase()));
	if (!cmd) return message.reply({ embeds: [commandEmbed] });
	message.channel.send({
		embeds: [
			client.neutralEmbed(
				{
					description: Object.entries(cmd)
						.filter((data) => typeof data[1] != 'function')
						.map((data) =>
							data[0] == 'usage'
								? `**Usage**: \`\`\`yaml\n${prefix}${(cmd as Anything).name} ${data[1]}\`\`\``
								: `**${data[0][0].toUpperCase() + data[0].slice(1)}**: ${
										data[1].map
											? data[1].map((d: unknown) => `\`${d}\``).join(', ')
											: typeof data[1] == 'number'
											? `\`${ms(data[1], { long: true })}\``
											: `\`${data[1]}\``
								  }`
						)
						.join('\n'),
					title: `Prefix: ${prefix}`,
				},
				message
			),
		],
	});
};

export const name = 'help';
export const category = 'misc';
export const usage = '<command>';
export const args = true