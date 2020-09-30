export namespace ProjectLoader {
    export let running = false
    export const run = async () => {
        const exportedProject = Entry.exportProject()
        const projectData = await (await fetch(`https://playentry.org/api/project/${Entry.projectId}`)).json()
        Entry.clearProject()
        Entry.loadProject(Object.keys(exportedProject).reduce((acc, cur) => {
            acc[cur] = projectData[cur]
            return acc
        }, <any> {}))
    }
}