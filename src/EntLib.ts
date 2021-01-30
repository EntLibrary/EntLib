export * from './Block'
export * from './Parser'
export * from './Extension'
export * from './Action'
export * from './IconFixer'
export * from './EventBlock'
export * from './EventManager'
export * from './Statements'
export * from './Button'
export * from './Modal'

declare global {
    interface Window {
        EntLib: any
    }
}

if (window) {
    window.EntLib = module.exports
}