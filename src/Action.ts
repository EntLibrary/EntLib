export interface Parameter {
    sender: {
        entity: any
        script: any
    }
    [key: string]: any
}
export type Action = ({ sender }: Parameter) => any
export const executeAction = async (action: Action, entity: any, script: any, params: { [key: string]: any }) => {
    try {
        return await action({ sender: { entity, script }, ...params })
    } catch (e) {
        alert('확장블록에서 오류가 발생했습니다.\n확장블록 개발자에게 문의해주세요.')
        throw new Error()
    }
}