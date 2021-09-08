import { PieceContext, Args as SapphireArgs, CommandContext, PreconditionEntryResolvable, UserPermissionsPrecondition } from '@sapphire/framework';
import { SubCommandPluginCommand } from '@sapphire/plugin-subcommands';
import type { PermissionResolvable } from 'discord.js';
import { PermissionLevels } from '../types/enums/PermissionLevels';

export abstract class SpecteraSubCommand extends SubCommandPluginCommand {
	public readonly permissionLevel: PermissionLevels;
	public readonly guarded: boolean;
	public readonly hidden: boolean;
	public constructor(context: PieceContext, options: SpecteraSubCommand.Options) {
		super(context, SpecteraSubCommand.resolvePreConditions(context, options));
		this.permissionLevel = options.permissionLevel ?? PermissionLevels.Everyone;
		this.guarded = options.guarded ?? false;
		this.hidden = options.hidden ?? false;
	}

	protected static resolvePreConditions(_context: PieceContext, options: SpecteraSubCommand.Options): SpecteraSubCommand.Options {
		options.generateDashLessAliases ??= true;

		const preconditions = (options.preconditions ??= []) as PreconditionEntryResolvable[];

		if (options.permissions) {
			preconditions.push(new UserPermissionsPrecondition(options.permissions));
		}

		const permissionLevelPreCondition = this.resolvePermissionLevelPreCondition(options.permissionLevel);
		if (permissionLevelPreCondition !== null) {
			preconditions.push(permissionLevelPreCondition);
		}
		if (options.bucket && options.cooldown) {
			preconditions.push({
				name: 'Cooldown',
				context: { limit: options.bucket, delay: options.cooldown }
			});
		}

		return options;
	}

	protected static resolvePermissionLevelPreCondition(permissionLevel = 0): PreconditionEntryResolvable | null {
		if (permissionLevel === 0) return null;
		if (permissionLevel <= PermissionLevels.Moderator) {
			return ['BotOwner', 'Moderator'];
		}
		if (permissionLevel <= PermissionLevels.Administrator) {
			return ['BotOwner', 'Administrator'];
		}
		if (permissionLevel <= PermissionLevels.BotOwner) return 'BotOwner';
		return null;
	}
}

export namespace SpecteraSubCommand {
	export type Options = SubCommandPluginCommand.Options & {
		permissionLevel?: number;
		permissions?: PermissionResolvable;
		guarded?: boolean;
		hidden?: boolean;
		bucket?: number;
		cooldown?: number;
	};
	export type Args = SapphireArgs;
	export type Context = CommandContext;
}
