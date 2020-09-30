export namespace IconFixer {
    export let running: boolean = false

    export const run = () => {
        Object.keys(Entry.Command).forEach(l => {
            if (Entry.Command[l].do) {
                Entry.Command[l].do = new Proxy(Entry.Command[l].do, {
                    apply(target, thisArg, args) {
                        const id = setInterval(() => {
                            const findedObjects = Array.from(document.querySelectorAll('image')).filter(l => l.getAttribute('href')?.startsWith('/lib/entry-js/images/https://'))
                            findedObjects.forEach(l => l.setAttribute('href', l.getAttribute('href')?.replace('/lib/entry-js/images/', '') || ''))
                        }, 50)
                        setTimeout(() => {
                            clearInterval(id)
                        }, 1000)
                        return target.apply(thisArg, args)
                    }
                })
            }
        })
        setInterval(() => {
            const findedObjects = Array.from(document.querySelectorAll('image')).filter(l => l.getAttribute('href')?.startsWith('/lib/entry-js/images/https://'))
            findedObjects.forEach(l => l.setAttribute('href', l.getAttribute('href')?.replace('/lib/entry-js/images/', '') || ''))
        }, 100)
        running = true
    }
}