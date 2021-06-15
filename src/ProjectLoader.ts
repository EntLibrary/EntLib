export namespace ProjectLoader {
    export let running = false
    export const run = async () => {
        const exportedProject = Entry.exportProject()
        const projectData = await (await fetch(`https://playentry.org/graphql`, {
            method: 'POST',
            body: JSON.stringify({
                query: "\n    query($id: ID! $groupId: ID) {\n        project(id: $id, groupId: $groupId) {\n            \n    id\n    name\n    user {\n        \n    id\n    nickname\n    username\n    profileImage {\n        \n    id\n    name\n    label {\n        \n    ko\n    en\n    ja\n    vn\n\n    }\n    filename\n    imageType\n    dimension {\n        \n    width\n    height\n\n    }\n    trimmed {\n        filename\n        width\n        height\n    }\n\n    }\n    status {\n        following\n        follower\n    }\n    description\n    role\n\n    }\n    visit\n    speed\n    objects\n    variables\n    messages\n    functions\n    tables\n    scenes\n    thumb\n    isopen\n    blamed\n    isPracticalCourse\n    category\n    categoryCode\n    created\n    updated\n    shortenUrl\n    parent {\n        id\n        name\n        user {\n            id\n            username\n            nickname\n        }\n    }\n    likeCnt\n    favorite\n    special\n    isForLecture\n    isForStudy\n    isForSubmit\n    hashId\n    complexity\n    staffPicked\n    ranked\n    submitId {\n        id\n    }\n    description\n    description2\n    description3\n    hasRealTimeVariable\n    realTimeVariable {\n        \n    variableType\n    key\n    value\n    array {\n        key\n        data\n    }\n    minValue\n    maxValue\n    visible\n    x\n    y\n    width\n    height\n    object\n\n    }\n    commentGroup {\n        group\n        count\n    }\n    likeCntGroup {\n        group\n        count\n    }\n    visitGroup {\n        group\n        count\n    }\n    recentGroup {\n        group\n        count\n    }\n    learning\n    expansionBlocks\n    aiUtilizeBlocks\n\n        }\n     }\n",
                variables: { id: Entry.projectId }
            }),
            headers: new Headers({
                'content-type': 'application/json'
            })
        })).json()
        Entry.clearProject()
        Entry.loadProject(Object.keys(exportedProject).reduce((acc, cur) => {
            acc[cur] = projectData.data.project[cur]
            return acc
        }, <any> {}))
    }
}