import { Action, executeAction } from "./Action"
import { IndicatorType, Parser, SyntaxCode, SyntaxTree } from './Parser'

export interface BlockParam {
    template: string
    className?: string
    color?: string
    darkenColor?: string
    action: Action
    dynamics?: { [key: string]: any }
    indicator?: string
}

export class Block {
    public template: string
    public action: Action
    public className: string
    public color: string
    public darkenColor: string
    public indicator: string
    public dynamics: { [key: string]: any }

    constructor({
        template,
        color = 'default',
        darkenColor = 'default',
        className = 'default',
        action,
        dynamics = {},
        indicator = 'default'
    }: BlockParam) {
        this.template = template
        this.color = color
        this.darkenColor = darkenColor
        this.action = action
        this.className = className
        this.dynamics = dynamics
        this.indicator = indicator
    }

    public export(parser: Parser, name: string) {
        const syntaxTree = parser.parse(this.template)
        const params = <SyntaxTree[]> syntaxTree.content.filter(l => typeof l != 'string')
        const getParams = (script: any) => params.reduce((acc, cur) => {
            const keyName = <string> cur.content[0]
            if (cur.type == SyntaxCode.CONDITION) acc[keyName] = script.getBooleanValue(keyName.toUpperCase(), script)
            if (cur.type == SyntaxCode.DROPDOWN) acc[keyName] = script.getField(keyName.toUpperCase(), script)
            if (cur.type == SyntaxCode.PARAM) acc[keyName] = script.getStringValue(keyName.toUpperCase(), script)
            return acc
        }, <{ [key: string]: any }> {})
        const ret = parser.syntaxTreeToBlock({
            name,
            className: this.className,
            color: this.color,
            outline: this.darkenColor,
            darkenColor: this.darkenColor,
            action: async (entity: any, script: any) => {
                return await executeAction(this.action, entity, script, getParams(script))
            },
            indicator: this.indicator == 'none' ? undefined : this.indicator,
            indicatorType: IndicatorType.DEFAULT
        }, syntaxTree)
        return {
            ...ret,
            dynamics: Object.keys(this.dynamics).reduce((acc, cur) => {
                acc[cur.toLowerCase()] = this.dynamics[cur]
                return acc
            }, <{ [key: string]: any }> {})
        }
    }
}