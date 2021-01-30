import { Block } from './Block'
import { Parser } from './Parser'
import { IconFixer } from './IconFixer'
import { EventManager } from './EventManager'
import { ProjectLoader } from './ProjectLoader'
import blocks from './Blocks'

EntryStatic._getAllBlocks = EntryStatic.getAllBlocks

EntryStatic.getAllBlocks = () => {
    const b = <typeof blocks> JSON.parse(JSON.stringify(blocks))
    Array.from(extensions).forEach(extension => {
        b.push({
            category: extension.id,
            blocks: Object.keys(extension.blocks)
        })
    })
    return b
}

interface ExtensionParam {
    displayName?: string
    blocks?: { [key: string]: Block }
    enabledIcon?: string
    disabledIcon?: string
    enabledColor?: string
    disabledColor?: string
    defaultColor?: string
    defaultDarkenColor?: string
    defaultIndicator?: string
}

export const extensions: Set<Extension> = new Set<Extension>()

export const neededDynamicDropdowns: { [key: string]: () => [string, string][] } = {}

export class Extension {
    public readonly id: string
    public displayName: string
    public blocks: { [key: string]: Block }
    public enabledIcon: string
    public disabledIcon: string
    public enabledColor: string
    public disabledColor: string
    public disabled: boolean = true
    public defaultColor: string
    public defaultDarkenColor: string
    public defaultIndicator: string

    constructor({
        displayName = '확장블록',
        blocks = {},
        enabledIcon = 'https://playentry.org/lib/entry-js/images/hardware_on.svg',
        disabledIcon = 'https://playentry.org/lib/entry-js/images/hardware.svg',
        enabledColor = '#00b6b1',
        disabledColor = 'transparent',
        defaultColor = '#00b6b1',
        defaultDarkenColor = '#008380',
        defaultIndicator = 'https://playentry.org/lib/entry-js/images/block_icon/hardware_icon.svg'
    }: ExtensionParam) {
        this.displayName = displayName
        this.blocks = blocks
        this.enabledIcon = enabledIcon
        this.disabledIcon = disabledIcon
        this.enabledColor = enabledColor
        this.disabledColor = disabledColor
        this.defaultColor = defaultColor
        this.defaultDarkenColor = defaultDarkenColor
        this.defaultIndicator = defaultIndicator
        this.id = Entry.Utils.generateId()
    }

    public enable() {
        if (!this.disabled) throw new Error('Already Enabled')
        extensions.add(this)
        this.apply()
        this.disabled = false
    }

    public disable() {
        if (this.disabled) throw new Error('Disabled Extension')
        extensions.delete(this)
        this.disabled = true
    }

    protected apply() {
        const parser = new Parser()
        const exportedBlocks = Object.keys(this.blocks).map(key => {
            const block = this.blocks[key]
            if (block.color == 'default') block.color = this.defaultColor
            if (block.darkenColor == 'default') block.darkenColor = this.defaultDarkenColor
            if (block.indicator == 'default') block.indicator = this.defaultIndicator
            return { name: key, block: block.export(parser, key) }
        })
        exportedBlocks.forEach(block => {
            block.block.neededDynamicDropdown.forEach(dynamicDropdownName => {
                if (!(dynamicDropdownName in neededDynamicDropdowns)) {
                    neededDynamicDropdowns[dynamicDropdownName] = block.block.dynamics[dynamicDropdownName] ? (() => {
                        const value = block.block.dynamics[dynamicDropdownName]()
                        return <[string, string][]> Object.keys(value).map(key => {
                            return [value[key], key]
                        })
                    }) : (() => {
                        return [['대상없음', 'null']]
                    })
                }
            })
            for (const key in block.block.customSkeletons) {
                Entry.skeleton[key] = block.block.customSkeletons[key]
            }
            Entry.block[block.name] = block.block.base
        })
        if (!Entry.container.getDropdownList.__isProxy) {
            Entry.container.getDropdownList = new Proxy(Entry.container.getDropdownList, {
                apply(target, thisArg, args) {
                    if (args[0] in neededDynamicDropdowns) {
                        return neededDynamicDropdowns[args[0]].call(thisArg)
                    }
                    return target.apply(thisArg, args)
                },
                get(target, prop, receiver) {
                    if (prop == '__isProxy') {
                        return true
                    }
                    return Reflect.get(target, prop, receiver)
                }
            })
        }
        if (Entry.getMainWS()) {
            document.querySelector(`#EntLib_Category_${this.id}`)?.remove()
            const styleElement = document.createElement('style')
            styleElement.innerHTML = `
                #entryCategory${this.id} {
                        background-repeat: no-repeat !important;
                        background-color: ${this.disabledColor};
                        background-image: url(${this.disabledIcon});
                        border-color: ${this.disabledColor};
                }
                .entrySelectedCategory#entryCategory${this.id} {
                        background-repeat: no-repeat !important;
                        background-color: ${this.enabledColor} !important;
                        background-image: url(${this.enabledIcon}) !important;
                        border-color: ${this.enabledColor} !important;
                }
            `.replace(/    /gi, '').replace(/\n/g, '')
            document.head.appendChild(styleElement)
            Entry.playground.mainWorkspace.blockMenu._clearCategory()
            Entry.playground.mainWorkspace.blockMenu._generateCategoryView([
                { category: 'start', visible: true },
                { category: 'flow', visible: true },
                { category: 'moving', visible: true },
                { category: 'looks', visible: true },
                { category: 'brush', visible: true },
                { category: 'text', visible: true },
                { category: 'sound', visible: true },
                { category: 'judgement', visible: true },
                { category: 'calc', visible: true },
                { category: 'variable', visible: true },
                { category: 'func', visible: true },
                { category: 'analysis', visible: true },
                { category: 'ai_utilize', visible: true },
                { category: 'expansion', visible: true },
            ].concat(
                ...[...extensions].map(extension => ({ category: extension.id, visible: true }))
            ).concat({ category: 'arduino', visible: true }))
            document.querySelectorAll('.entryCategoryElementWorkspace').forEach(element => {
                if (element.getAttribute('id') != 'entryCategorytext') element.setAttribute('class', 'entryCategoryElementWorkspace')
            })
            Entry.playground.blockMenu._categoryData = EntryStatic.getAllBlocks()
            Entry.playground.blockMenu._generateCategoryCodes([
                'start',
                'flow',
                'moving',
                'looks',
                'brush',
                'text',
                'sound',
                'judgement',
                'calc',
                'variable',
                'func',
                'analysis',
                'ai_utilize',
                'expansion',
            ].concat(...[...extensions].map(extension => extension.id)).concat('arduino'))
            extensions.forEach(extension => {
                (<HTMLElement> document.querySelector(`#entryCategory${extension.id}`)).innerText = extension.displayName
            })
        }
    }

    public static allExtensionsLoaded() {
        Entry.FieldLineBreak.prototype.align = function (targetStatementIndex: number) {
            const bv = this._blockView
            if (bv._statements.length === 0) return
            if (!bv._statements[targetStatementIndex]) return
            this.box.set({
                y:
                    bv._statements.slice(0, targetStatementIndex).reduce((acc: number, cur: any) => acc += Math.max(cur.height, 20), 0)
                    + (bv._statements[targetStatementIndex].height || 20) + (28 * (targetStatementIndex + 1))
            })
        }
        if (Entry.getMainWS()) {
            if (Entry.projectId) {
                if (!ProjectLoader.running) {
                    ProjectLoader.run().then(() => {
                        if (!IconFixer.running) IconFixer.run()
                        if (!EventManager.running) EventManager.run()
                    })
                }
            } else {
                if (!IconFixer.running) IconFixer.run()
                if (!EventManager.running) EventManager.run()
            }
        } else {
            if (!EventManager.running) EventManager.run()
        }
    }

    public static hideClass(className: string) {
        if (Entry.getMainWS()) Entry.getMainWS().blockMenu.banClass(className)
    }

    public static showClass(className: string) {
        if (Entry.getMainWS()) Entry.getMainWS().blockMenu.unbanClass(className)
    }
}