import { Block } from './Block'
import { IndicatorType, Parser, SyntaxCode, SyntaxTree } from './Parser'

export interface EventBlockParam {
    template: string
    className?: string
    color?: string
    darkenColor?: string
    dynamics?: { [key: string]: any }
    indicator?: string
    eventName: string
}

export class EventBlock extends Block {
    public eventName: string

    constructor({
        template,
        color = 'default',
        darkenColor = 'default',
        className = 'default',
        dynamics = {},
        indicator = 'default',
        eventName
    }: EventBlockParam) {
        super({ template, color, darkenColor, className, dynamics, indicator, action: () => { } })
        this.eventName = eventName
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
            action: () => { },
            indicator: this.indicator == 'none' ? undefined : this.indicator,
            indicatorType: IndicatorType.EVENT,
            event: this.eventName
        }, syntaxTree)
        return {
            ...ret, dynamics: Object.keys(this.dynamics).reduce((acc, cur) => {
                acc[cur.toLowerCase()] = this.dynamics[cur]
                return acc
            }, <{ [key: string]: any }> {})
        }
    }
}