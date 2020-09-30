declare module 'src/Action' {
	export interface Parameter {
		sender: {
			entity: any
			script: any
		}
		[key: string]: any
	}
	export type Action = ({ sender }: Parameter) => any
	export const executeAction: (action: Action, entity: any, script: any, params: {
		[key: string]: any
	}) => Promise<any>

}
declare module 'src/Parser' {
	export class SyntaxTree {
		type: SyntaxCode
		content: (SyntaxTree | string)[]
		constructor(type: SyntaxCode, content: (SyntaxTree | string)[])
	}
	export enum IndicatorType {
		EVENT = 0,
		DEFAULT = 1
	}
	export enum SyntaxCode {
		BLOCK = 0,
		CONDITION = 1,
		PARAM = 2,
		TEXT = 3,
		DROPDOWN = 4
	}
	export interface BlockSyntax {
		template: string
		color: string
		outerLine: string
		skeleton: string
		statements: []
		params: any[]
		events: {
			[key: string]: Function[]
		}
		def: {
			params: any[]
			type: string
		}
		paramsKeyMap: {
			[key: string]: number
		}
		class: string
		func: Function
		event?: string
	}
	export class Parser {
		parse(template: string, isParameter?: boolean): SyntaxTree
		syntaxTreeToBlock({ name, className, color, outline, action, darkenColor, indicator, indicatorType, event }: {
			name: string
			className: string
			color: string
			outline: string
			action: Function
			darkenColor: string
			indicator?: string
			indicatorType?: IndicatorType
			event?: string
		}, tree: SyntaxTree): {
			base: BlockSyntax
			neededDynamicDropdown: string[]
		}
		static parse(template: string): SyntaxTree
	}

}
declare module 'src/Block' {
	import { Action } from 'src/Action'
	import { Parser } from 'src/Parser'
	export interface BlockParam {
		template: string
		className?: string
		color?: string
		darkenColor?: string
		action: Action
		dynamics?: {
			[key: string]: any
		}
		indicator?: string
	}
	export class Block {
		template: string
		action: Action
		className: string
		color: string
		darkenColor: string
		indicator: string
		dynamics: {
			[key: string]: any
		}
		constructor({ template, color, darkenColor, className, action, dynamics, indicator }: BlockParam)
		export(parser: Parser, name: string): {
			dynamics: {
				[key: string]: any
			}
			base: import("./Parser").BlockSyntax
			neededDynamicDropdown: string[]
		}
	}

}
declare module 'src/Blocks' {
	const _default: {
		category: string
		blocks: string[]
	}[]
	export default _default

}
declare module 'src/IconFixer' {
	export namespace IconFixer {
		let running: boolean
		const run: () => void
	}

}
declare module 'src/EventManager' {
	export namespace EventManager {
		const fire: (eventName: string) => void
		let running: boolean
		const run: () => void
	}

}
declare module 'src/ProjectLoader' {
	export namespace ProjectLoader {
		let running: boolean
		const run: () => Promise<void>
	}

}
declare module 'src/Extension' {
	import { Block } from 'src/Block'
	interface ExtensionParam {
		displayName?: string
		blocks?: {
			[key: string]: Block
		}
		enabledIcon?: string
		disabledIcon?: string
		enabledColor?: string
		disabledColor?: string
		defaultColor?: string
		defaultDarkenColor?: string
		defaultIndicator?: string
	}
	export const extensions: Set<Extension>
	export const neededDynamicDropdowns: {
		[key: string]: () => [string, string][]
	}
	export class Extension {
		readonly id: string
		displayName: string
		blocks: {
			[key: string]: Block
		}
		enabledIcon: string
		disabledIcon: string
		enabledColor: string
		disabledColor: string
		disabled: boolean
		defaultColor: string
		defaultDarkenColor: string
		defaultIndicator: string
		constructor({ displayName, blocks, enabledIcon, disabledIcon, enabledColor, disabledColor, defaultColor, defaultDarkenColor, defaultIndicator }: ExtensionParam)
		enable(): void
		disable(): void
		protected apply(): void
		static allExtensionsLoaded(): void
	}
	export { }

}
declare module 'src/EventBlock' {
	import { Block } from 'src/Block'
	import { Parser } from 'src/Parser'
	export interface EventBlockParam {
		template: string
		className?: string
		color?: string
		darkenColor?: string
		dynamics?: {
			[key: string]: any
		}
		indicator?: string
		eventName: string
	}
	export class EventBlock extends Block {
		eventName: string
		constructor({ template, color, darkenColor, className, dynamics, indicator, eventName }: EventBlockParam)
		export(parser: Parser, name: string): {
			dynamics: {
				[key: string]: any
			}
			base: import("./Parser").BlockSyntax
			neededDynamicDropdown: string[]
		}
	}

}
declare namespace EntLib {
	export * from 'src/Block'
	export * from 'src/Parser'
	export * from 'src/Extension'
	export * from 'src/Action'
	export * from 'src/IconFixer'
	export * from 'src/EventBlock'
	export * from 'src/EventManager'
}
declare module 'EntLib' {
	export * from 'src/Block'
	export * from 'src/Parser'
	export * from 'src/Extension'
	export * from 'src/Action'
	export * from 'src/IconFixer'
	export * from 'src/EventBlock'
	export * from 'src/EventManager'
}
declare const Entry: any
declare const EntryStatic: any