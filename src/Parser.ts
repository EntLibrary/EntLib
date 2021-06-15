import { MultiStatementSkeleton } from "./Statements"

export class SyntaxTree {
    public type: SyntaxCode
    public content: (SyntaxTree | string)[]

    constructor(type: SyntaxCode, content: (SyntaxTree | string)[]) {
        this.type = type
        this.content = content
    }
}

export enum IndicatorType {
    EVENT,
    DEFAULT
}

export enum SyntaxCode {
    BLOCK,
    CONDITION,
    PARAM,
    TEXT,
    DROPDOWN,
    STATEMENT
}

export interface BlockSyntax {
    template: string
    color: string
    outerLine: string
    skeleton: string
    statements: any[]
    params: any[]
    events: { [key: string]: Function[] }
    def: {
        params: any[]
        type: string
    },
    paramsKeyMap: { [key: string]: number }
    statementsKeyMap: { [key: string]: number }
    class: string
    func: Function
    event?: string
}

export class Parser {
    public parse(template: string, isParameter: boolean = false): SyntaxTree {
        let templateType: SyntaxCode
        let tree: SyntaxTree = null!
        let retIndex: number = 0
        let passCount: number = 0
        let openedBracket: number = 1
        let isDefaultValue: boolean = false
        try {
            template.split('').forEach((char, i, arr) => {
                if (passCount > 0) return passCount--
                if (i == 0) {
                    if (char == '[') templateType = isParameter ? SyntaxCode.DROPDOWN : SyntaxCode.BLOCK
                    else if (char == '(') templateType = SyntaxCode.PARAM
                    else if (char == '<') templateType = SyntaxCode.CONDITION
                    else if (char == '{') templateType = SyntaxCode.STATEMENT
                    else templateType = SyntaxCode.TEXT
                    tree = new SyntaxTree(templateType, [])
                    if (templateType == SyntaxCode.TEXT) tree.content.push('') && (tree.content[tree.content.length - 1] += char)
                    return
                }
                if (isParameter && ['[', '(', '<', '{'].includes(char)) openedBracket++
                if ([']', ')', '>', '}'].includes(char)) openedBracket--
                if (!isParameter && openedBracket < 1 && arr.length - 1 != i) throw new SyntaxError('Invalid Syntax: Multiple-Root-Brackets are not allowed.')
                if (((arr.length - 1 == i) || (isParameter && [']', ')', '>', '}'].includes(char) && openedBracket == 0)) && templateType != SyntaxCode.TEXT) {
                    if ((templateType == SyntaxCode.BLOCK || templateType == SyntaxCode.DROPDOWN) && char != ']') throw new SyntaxError('Invalid Syntax: Required \']\'')
                    if (templateType == SyntaxCode.PARAM && char != ')') throw new SyntaxError('Invalid Syntax: Required \')\'')
                    if (templateType == SyntaxCode.CONDITION && char != '>') throw new SyntaxError('Invalid Syntax: Required \'>\'')
                    if (templateType == SyntaxCode.STATEMENT && char != '}') throw new SyntaxError('Invalid Syntax: Required \'}\'')
                    retIndex = i
                    throw 'break'
                }
                if (isParameter || templateType == SyntaxCode.TEXT ? true : !['[', '(', '<', '{'].includes(char)) {
                    if (typeof tree.content[tree.content.length - 1] != 'string') tree.content.push('')
                    if (isParameter) {
                        if (char == ':' && templateType != SyntaxCode.STATEMENT) {
                            tree.content.push('')
                            isDefaultValue = true
                        } else if (isDefaultValue ? char != ' ' : true) {
                            if (templateType != SyntaxCode.DROPDOWN) {
                                tree.content[tree.content.length - 1] += char
                            } else {
                                if (isDefaultValue) {
                                    tree.content[tree.content.length - 1] = (char == '@').toString()
                                    tree.content.push(char == '@' ? '' : char)
                                } else {
                                    if (tree.content[1] == 'true' && char != '@') {
                                        tree.content[tree.content.length - 1] += char
                                    } else {
                                        if (char == '=' || char == ',') tree.content.push('')
                                        else tree.content[tree.content.length - 1] += char
                                    }
                                }
                            }
                            isDefaultValue = false
                        }
                    } else {
                        tree.content[tree.content.length - 1] += char
                    }
                } else if (!isParameter) {
                    const parsed = <any> this.parse(template.substring(i), true)
                    passCount = parsed.len
                    tree.content.push(parsed.tree)
                }
            })
        } catch (e) {
            if (e != 'break') throw e
        }
        if (isParameter) return <any> { tree, len: retIndex }
        else return <any> tree
    }

    public syntaxTreeToBlock({ name, className, color, outline, action, darkenColor, indicator, indicatorType = IndicatorType.DEFAULT, event }: {
        name: string
        className: string
        color: string
        outline: string,
        action: Function
        darkenColor: string
        indicator?: string
        indicatorType?: IndicatorType
        event?: string
    }, tree: SyntaxTree) {
        switch (tree.type) {
            case SyntaxCode.TEXT: {
                const base: BlockSyntax = {
                    template: '%1',
                    color: 'transparent',
                    outerLine: 'transparent',
                    skeleton: 'basic_text',
                    statements: [],
                    params: [{
                        type: 'Text',
                        text: tree.content[0],
                        color: typeof EntryStatic != 'undefined' ? EntryStatic.colorSet.common.TEXT : '#333',
                        class: 'bold',
                        align: 'center'
                    }],
                    events: {},
                    def: {
                        params: [null],
                        type: name
                    },
                    paramsKeyMap: {},
                    statementsKeyMap: {},
                    class: className,
                    func: action
                }
                return { base, neededDynamicDropdown: [], customSkeletons: {} }
            }
            case SyntaxCode.CONDITION:
            case SyntaxCode.PARAM:
            case SyntaxCode.BLOCK: {
                const base: BlockSyntax = {
                    template: '',
                    color,
                    outerLine: outline,
                    skeleton: event ? 'basic_event' : ({
                        [SyntaxCode.BLOCK]: 'basic',
                        [SyntaxCode.CONDITION]: 'basic_boolean_field',
                        [SyntaxCode.PARAM]: 'basic_string_field'
                    })[tree.type],
                    statements: [],
                    params: [],
                    events: {},
                    def: {
                        params: [],
                        type: name
                    },
                    paramsKeyMap: {},
                    statementsKeyMap: {},
                    class: className,
                    func: action
                }
                if (event) base.event = event
                const neededDynamicDropdown: string[] = []
                const customSkeletons: { [key: string]: MultiStatementSkeleton } = {}
                let paramCount = 0
                let lineBreakCount = 0
                let indicatorGenerated = false
                if (indicator && indicatorType == IndicatorType.EVENT) {
                    base.template += `%${++paramCount}`
                    base.params.push({
                        type: 'Indicator',
                        img: indicator,
                        size: 14,
                        position: { x: 0, y: -2 }
                    })
                    base.def.params.push(null)
                }
                tree.content.forEach(content => {
                    if (typeof content == 'string') {
                        base.template += content
                    } else {
                        base.template += `%${++paramCount}`
                        if (content.content.length >= 2) {
                            if (content.type == SyntaxCode.PARAM) {
                                base.params.push({
                                    type: 'Block',
                                    accept: 'string'
                                })
                                base.def.params.push({
                                    type: 'text',
                                    params: [content.content[1]]
                                })
                                base.paramsKeyMap[(<string> content.content[0]).toUpperCase().trim()] = paramCount - 1
                            } else if (content.type == SyntaxCode.CONDITION) {
                                base.params.push({
                                    type: 'Block',
                                    accept: 'boolean'
                                })
                                base.def.params.push({
                                    type: (<string> content.content[1]).toLowerCase().trim() == 'true' ? 'True' : 'False',
                                })
                                base.paramsKeyMap[(<string> content.content[0]).toUpperCase().trim()] = paramCount - 1
                            } else if (content.type == SyntaxCode.DROPDOWN) {
                                const dropdown = {
                                    key: (<string> content.content[0]).trim(),
                                    isDynamic: content.content[1] == 'true',
                                    map: <[string, string][]>(content.content[1] != 'true' ? content.content.slice(2).reduce((acc, cur, i, arr) => {
                                        if (!(acc[acc.length - 1] instanceof Array)) acc.push([])
                                        acc[acc.length - 1].push(<string> cur)
                                        if (i % 2 == 1 && i != arr.length - 1) acc.push([])
                                        return acc
                                    }, <string[][]>[]).map(l => {
                                        const arr = [l[0], l[1]]
                                        const temp = arr[0]
                                        arr[0] = arr[1]
                                        arr[1] = temp
                                        return arr
                                    }) : []),
                                    menuName: content.content[1] == 'true' ? content.content[2] as string : null
                                }
                                if (!dropdown.isDynamic) {
                                    base.params.push({
                                        type: "Dropdown",
                                        options: dropdown.map,
                                        fontSize: 11,
                                        value: dropdown.map[0][1],
                                        bgColor: darkenColor,
                                        arrowColor: '#ffffff'
                                    })
                                    base.def.params.push(null)
                                } else {
                                    const menuName = <string> dropdown.menuName?.toLowerCase()
                                    base.params.push({
                                        type: "DropdownDynamic",
                                        menuName,
                                        fontSize: 11,
                                        value: null,
                                        bgColor: darkenColor,
                                        arrowColor: '#ffffff'
                                    })
                                    if (![
                                        "sprites",
                                        "allSprites",
                                        "spritesWithMouse",
                                        "spritesWithSelf",
                                        "textBoxWithSelf",
                                        "collision",
                                        "pictures",
                                        "messages",
                                        "variables",
                                        "lists",
                                        "tables",
                                        "scenes",
                                        "sounds",
                                        "clone",
                                        "objectSequence",
                                        "fonts"
                                    ].includes(menuName)) neededDynamicDropdown.push(menuName)
                                    base.def.params.push(null)
                                }
                                base.paramsKeyMap[dropdown.key.toUpperCase()] = paramCount - 1
                            }
                        } else if (content.content.length == 1) {
                            if (content.type == SyntaxCode.PARAM) {
                                base.params.push({
                                    type: 'Block',
                                    accept: 'string'
                                })
                                base.def.params.push({
                                    type: 'text',
                                    params: [content.content[0]]
                                })
                            } else if (content.type == SyntaxCode.CONDITION) {
                                base.params.push({
                                    type: 'Block',
                                    accept: 'boolean'
                                })
                                base.def.params.push({
                                    type: (<string> content.content[0]).toLowerCase().trim() == 'true' ? 'True' : 'False',
                                })
                            } else if (content.type == SyntaxCode.STATEMENT) {
                                const statementCount = tree.content.filter((content: any) => content.type == SyntaxCode.STATEMENT).length
                                if (statementCount > 1 && lineBreakCount < statementCount - 1) {
                                    if (!indicatorGenerated) {
                                        base.template += ` %${++paramCount}`
                                        base.params.push({
                                            type: 'Indicator',
                                            img: indicator,
                                            size: 11
                                        })
                                        base.def.params.push(null)
                                        base.statementsKeyMap[(content.content[0] as string).toUpperCase().trim()] = paramCount - 2
                                        indicatorGenerated = true
                                    } else {
                                        base.statementsKeyMap[(content.content[0] as string).toUpperCase().trim()] = paramCount - 1
                                    }
                                    base.params.push({
                                        type: 'LineBreak'
                                    })
                                    lineBreakCount++
                                } else {
                                    base.template = base.template.slice(0, (1 + paramCount.toString().length) * -1)
                                    paramCount--
                                    if (!indicatorGenerated) {
                                        base.template += ` %${++paramCount}`
                                        base.params.push({
                                            type: 'Indicator',
                                            img: indicator,
                                            size: 11
                                        })
                                        base.def.params.push(null)
                                        base.statementsKeyMap[(content.content[0] as string).toUpperCase().trim()] = paramCount - 2
                                        indicatorGenerated = true
                                    } else {
                                        base.statementsKeyMap[(content.content[0] as string).toUpperCase().trim()] = paramCount - 1
                                    }
                                }
                                if (statementCount == 1) base.skeleton = 'basic_loop'
                                else if (statementCount == 2) base.skeleton = 'basic_double_loop'
                                base.statements.push({ accept: 'basic' })
                            }
                        }
                    }
                })
                const statementCount = tree.content.filter((content: any) => content.type == SyntaxCode.STATEMENT).length
                if (indicator && indicatorType == IndicatorType.DEFAULT && statementCount == 0 && tree.type == SyntaxCode.BLOCK) {
                    base.template += ` %${++paramCount}`
                    base.params.push({
                        type: 'Indicator',
                        img: indicator,
                        size: 11
                    })
                    base.def.params.push(null)
                }
                if (statementCount > 2) {
                    const id = Math.random().toString(36).substr(2, 4)
                    base.skeleton = id
                    customSkeletons[id] = new MultiStatementSkeleton(statementCount)
                }
                return { base, neededDynamicDropdown, customSkeletons }
            }
            default: {
                const base: BlockSyntax = {
                    template: '%1',
                    color: 'transparent',
                    outerLine: 'transparent',
                    skeleton: 'basic_text',
                    statements: [],
                    params: [{
                        type: 'Text',
                        text: 'Error',
                        color: '#ff0000',
                        class: 'bold',
                        align: 'center'
                    }],
                    events: {},
                    def: {
                        params: [null],
                        type: name
                    },
                    paramsKeyMap: {},
                    statementsKeyMap: {},
                    class: className,
                    func: action
                }
                return { base, neededDynamicDropdown: [], customSkeletons: {} }
            }
        }
    }

    public parseButton({ textColor, text, align, action, name, className }: {
        textColor: string
        text: string
        align: 'center' | 'right' | 'left'
        action: Function
        name: string
        className: string
    }) {
        const base: BlockSyntax = {
            template: '%1',
            color: '#eee',
            skeleton: 'basic_button',
            params: [{
                type: 'Text',
                text,
                align,
                color: textColor
            }],
            events: { mousedown: [action] },
            def: {
                params: [null],
                type: name
            },
            func: null!,
            class: null!,
            outerLine: null!,
            statements: null!,
            paramsKeyMap: null!,
            statementsKeyMap: null!
        }

        return {
            base, neededDynamicDropdown: [], customSkeletons: {}
        }
    }

    public static parse(template: string) {
        return new Parser().parse(template)
    }
}