export class MultiStatementSkeleton {
    public readonly executable = true

    constructor(public readonly statements: number) {
        if (this.statements < 3) throw new Error('statement length must be larger than 2')
    }

    public path(blockView: any) {
        const width = Math.max(0, blockView.contentWidth + 2 - Math.max(30, blockView.contentHeight % 1000000 + 2) / 2)
        const states = blockView._statements
        const bw = width - 8

        return `m 0 0
                l 6 6
                l 6 -6
                h ${width}
                a 14 14 0 0 1 0 28
                H 26
                l -6 6
                l -6 -6
                ${new Array(this.statements - 1).fill(null).map((_, i) => `v ${Math.max(states[i]?.height ?? 20, 20)}
                l 6 6
                l 6 -6
                h ${bw - 6}
                a 14 14 0 0 1 0 28
                H 26
                l -6 6
                l -6 -6`).join('')}
                v ${Math.max(states[this.statements - 1]?.height ?? 20, 20)}
                l 6 6
                l 6 -6
                h ${bw}
                a 7.5 7.5 0 0 1 0 15
                H 12
                l -6 6
                l -6 -6
                z`
    }

    public magnets(blockView: any) {
        const contentHeight1 = Math.max(blockView.contentHeight % 1000000 + 2, 28)
        const contentHeight2 = Math.max(Math.floor(blockView.contentHeight / 1000000) + 2, 28)
        const states: any[] = blockView._statements
        return {
            previous: { x: 0, y: 0 },
            next: {
                x: 0,
                y:
                    states.slice(0, this.statements).reduce((acc, cur) => {
                        acc += Math.max(cur.height ?? 20, 20)
                        return acc
                    }, 0) +
                    contentHeight1 +
                    contentHeight2 +
                    43 + (28 * Math.max(0, this.statements - 3)) +
                    blockView.offsetY
            }
        }
    }

    public box(blockView: any) {
        const contentWidth = blockView.contentWidth
        const contentHeight1 = Math.max(blockView.contentHeight % 1000000 + 2, 28)
        const contentHeight2 = Math.max(Math.floor(blockView.contentHeight / 1000000) + 2, 28)
        const states: any[] = blockView._statements
        return {
            topFieldHeight: contentHeight1,
            offsetX: -8,
            offsetY: 0,
            width: contentWidth + 30,
            height: contentHeight1 + contentHeight2 + states.slice(0, this.statements).reduce((acc, cur) => {
                acc += Math.max(cur.height ?? 20, 20)
                return acc
            }, 0) + 45 + (15 * Math.max(0, this.statements - 3)),
            marginBottom: 0
        }
    }

    public statementPos(blockView: any) {
        const getStatementHeight = (i: number) => Math.max(20, blockView._statements[i] ? blockView._statements[i].height % 1000000 : 20)
        const heights: number[] = []
        for (let i = 0; i < this.statements; i++) {
            if (i == 0) heights.push(Math.max(30, (blockView.contentHeight % 1000000) + 2) + 1)
            else heights.push(heights[i - 1] + Math.max(20, getStatementHeight(i - 1)) + Math.max(30, (blockView.contentHeight % 1000000) + 2) + 1)
        }
        return heights.map((l, i) => ({ x: 14, y: l - ((i + 1) * 3) }))
    }

    public contentPos(blockView: any) {
        const height = Math.max(blockView.contentHeight % 1000000, 28)
        return { x: 14, y: height / 2 }
    }
}