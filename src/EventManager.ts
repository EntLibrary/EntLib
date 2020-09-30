export namespace EventManager {
    export const fire = (eventName: string) => {
        if (!running) throw new Error('Not Running')
        Entry.engine.fireEvent(eventName)
    }

    export let running = false
    export const run = () => {
        if (running) throw new Error('Already Running')
        const scripts = Entry.container.getAllObjects().map((l: any) => Object.values(l.script._blockMap)).flat()
        scripts.forEach((thread: any) => {
            if (!Entry.block[thread.type].event) return
            const eventMap = thread.thread.parent.object.script._eventMap
            eventMap[Entry.block[thread.type].event] ||= []
            if (!eventMap[Entry.block[thread.type].event].includes(thread)) eventMap[Entry.block[thread.type].event].push(thread)
        })
        running = true
    }
}