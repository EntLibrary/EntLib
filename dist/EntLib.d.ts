declare module "EntLib/Action" {
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
declare module "EntLib/Statements" {
    export class MultiStatementSkeleton {
        readonly statements: number
        readonly executable = true;
        constructor(statements: number)
        path(blockView: any): string
        magnets(blockView: any): {
            previous: {
                x: number
                y: number
            }
            next: {
                x: number
                y: any
            }
        }
        box(blockView: any): {
            topFieldHeight: number
            offsetX: number
            offsetY: number
            width: any
            height: any
            marginBottom: number
        }
        statementPos(blockView: any): {
            x: number
            y: number
        }[]
        contentPos(blockView: any): {
            x: number
            y: number
        }
    }
}
declare module "EntLib/Parser" {
    import { MultiStatementSkeleton } from "EntLib/Statements"
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
        DROPDOWN = 4,
        STATEMENT = 5
    }
    export interface BlockSyntax {
        template: string
        color: string
        outerLine: string
        skeleton: string
        statements: any[]
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
        statementsKeyMap: {
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
            customSkeletons: {
                [key: string]: MultiStatementSkeleton
            }
        }
        parseButton({ textColor, text, align, action, name, className }: {
            textColor: string
            text: string
            align: 'center' | 'right' | 'left'
            action: Function
            name: string
            className: string
        }): {
            base: BlockSyntax
            neededDynamicDropdown: any[]
            customSkeletons: {}
        }
        static parse(template: string): SyntaxTree
    }
}
declare module "EntLib/Block" {
    import { Action } from "EntLib/Action"
    import { Parser } from "EntLib/Parser"
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
            base: import("EntLib/Parser").BlockSyntax
            neededDynamicDropdown: string[]
            customSkeletons: {
                [key: string]: import("EntLib/Statements").MultiStatementSkeleton
            }
        }
    }
}
declare module "EntLib/IconFixer" {
    export namespace IconFixer {
        let running: boolean
        const run: () => void
    }
}
declare module "EntLib/EventManager" {
    export namespace EventManager {
        const fire: (eventName: string) => void
        let running: boolean
        const run: () => void
    }
}
declare module "EntLib/ProjectLoader" {
    export namespace ProjectLoader {
        let running: boolean
        const run: () => Promise<void>
    }
}
declare module "EntLib/Blocks" {
    const _default: {
        category: string
        blocks: string[]
    }[]
    export default _default
}
declare module "EntLib/Extension" {
    import { Block } from "EntLib/Block"
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
        static banClass(): void
        static unbanClass(): void
    }
}
declare module "EntLib/EventBlock" {
    import { Block } from "EntLib/Block"
    import { Parser } from "EntLib/Parser"
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
            base: import("EntLib/Parser").BlockSyntax
            neededDynamicDropdown: string[]
            customSkeletons: {
                [key: string]: import("EntLib/Statements").MultiStatementSkeleton
            }
        }
    }
}
declare module "EntLib/Button" {
    import { Parser } from "EntLib/Parser"
    import { Block } from "EntLib/Block"
    import { Action } from "Entlib/Action"
    export interface ButtonParam {
        template: string
        textColor: string
        action: Action
        align: 'center' | 'left' | 'right'
    }
    export class Button extends Block {
        align: 'center' | 'left' | 'right'
        constructor({ template, textColor, action, align }: ButtonParam)
        export(parser: Parser, name: string): {
            dynamics: {}
            base: import("EntLib/Parser").BlockSyntax
            neededDynamicDropdown: any[]
            customSkeletons: {}
        }
    }
}
declare module "EntLib/Modal" {
    export type ModalEventListener = (modal: Modal, selectedItems: ModalItem[]) => void
    export interface ModalButton {
        text: string
        type: 'confirm' | 'normal'
        onClick: ModalEventListener
    }
    export interface ModalParams1 {
        title: string
        alertMessage?: string
        confirmText: string
        onConfirm: ModalEventListener
        onCancel?: ModalEventListener
        items?: ModalItem[]
    }
    export interface ModalParams2 {
        title: string
        alertMessage?: string
        buttons: ModalButton[]
        onCancel?: ModalEventListener
        items?: ModalItem[]
    }
    export interface ModalParams3 {
        title: string
        alertMessage?: string
        confirmText: string
        cancelText: string
        onConfirm: ModalEventListener
        onCancel: ModalEventListener
        items?: ModalItem[]
    }
    export interface ItemParams {
        title: string
        description: string
        image: string
        sponserMessage?: string
    }
    export class ModalItem {
        protected pSelected: boolean
        protected domElement: HTMLLIElement
        readonly title: string
        readonly description: string
        readonly image: string
        readonly sponserMessage: string | null
        constructor({ title, description, image, sponserMessage }: ItemParams)
        getDOMElement(): HTMLLIElement
        set selected(v: boolean)
        get selected(): boolean
    }
    export class Modal {
        protected pIsDestroyed: boolean
        protected domElement: HTMLDivElement
        readonly title: string
        readonly buttons: ModalButton[]
        readonly alertMessage: string | null
        readonly items: ModalItem[]
        constructor(p: ModalParams1)
        constructor(p: ModalParams2)
        constructor(p: ModalParams3)
        addItems(...items: ModalItem[]): void
        show(): void
        hide(): void
        destroy(): void
        get isDestroyed(): boolean
    }
}
declare namespace EntLib {
    export * from "EntLib/Block"
    export * from "EntLib/Parser"
    export * from "EntLib/Extension"
    export * from "EntLib/Action"
    export * from "EntLib/IconFixer"
    export * from "EntLib/EventBlock"
    export * from "EntLib/EventManager"
    export * from "EntLib/Statements"
    export * from "EntLib/Button"
    export * from "EntLib/Modal"
}