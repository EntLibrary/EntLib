import { IndicatorType, Parser, SyntaxCode, SyntaxTree } from "./Parser"
import { Block } from "./Block"
import { executeAction } from "./Action"
import { Action } from "Entlib/Action"

export interface ButtonParam {
    template: string
    textColor: string
    action: Action
    align: 'center' | 'left' | 'right'
}

export class Button extends Block {
    public align: 'center' | 'left' | 'right'

    constructor({
        template,
        textColor = 'default',
        action,
        align = 'center'
    }: ButtonParam) {
        super({
            template,
            color: textColor,
            action
        })
        this.align = align
    }

    public export(parser: Parser, name: string) {
        const ret = parser.parseButton({
            textColor: this.color,
            text: this.template,
            align: this.align,
            action: async (event: any) => {
                return await executeAction(this.action, null, null, { event })
            },
            name,
            className: this.className,
        })

        return {
            ...ret,
            dynamics: {}
        }
    }
}