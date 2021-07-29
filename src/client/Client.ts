import consola, { Consola } from 'consola';
import {
	Client,
	Collection,
	Message,
	MessageEmbed,
	MessageEmbedOptions,
} from 'discord.js';
import glob from 'glob';
import { promisify } from 'util';
import { Command } from '../interfaces/Command';
import { Config } from '../interfaces/Config';
import { Event } from '../interfaces/Event';

const globPromise = promisify(glob);

export class Obligator extends Client {
	public logger: Consola = consola;
	public categories: Set<string> = new Set();
	public commands: Collection<string, Command> = new Collection();
	public aliases: Collection<string, string> = new Collection();
	public events: Collection<string, Event> = new Collection();
	public config: Config;
	public constructor() {
		super({
			partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBER', 'USER'],
			intents: [
				'GUILDS',
				'GUILD_MESSAGES',
				'GUILD_MEMBERS',
				'GUILD_PRESENCES',
				'DIRECT_MESSAGES',
				'GUILD_BANS',
				'GUILD_WEBHOOKS',
			],
		});
	}
	public async start(config: Config): Promise<void> {
		this.config = config;
		this.login(config.token);
		const commandFiles = await globPromise(
			`${__dirname}/../commands/**/*{.ts, .js}`
		);
		commandFiles.map(async (value: string) => {
			const file: Command = await import(value);
			this.commands.set(file.name, file);
			this.categories.add(file.category);
			if (file.aliases?.length) {
				file.aliases.map((value: string) => this.aliases.set(value, file.name));
			}
		});
		const eventFiles = await globPromise(
			`${__dirname}/../events/**/*{.ts, .js}`
		);
		eventFiles.map(async (value: string) => {
			const file: Event = await import(value);
			this.events.set(file.name, file);
			this.on(file.name, file.run.bind(null, this));
		});
	}
	public embed(data: MessageEmbedOptions, message: Message): MessageEmbed {
		return new MessageEmbed({
			color: 'RANDOM',
			...data,
		});
	}
}
