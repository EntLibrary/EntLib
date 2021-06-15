const sel = <K extends keyof HTMLElementTagNameMap = 'div'>(selector: string) => {
    return document.querySelector(selector) as HTMLElementTagNameMap[K] | null
}

let id: string = 'null'

if (Entry.getMainWS()) {
    sel('.popup')!.style.display = 'none'
    Entry.Command[1103].do()

    const nid = sel('.popup')!.children[0].className.replace('popup_wrap__', '')
    id = nid

    sel(`.btn_back__${id}`)!.click()
    sel('.popup')!.style.display = ''
}

export type ModalEventListener = (modal: Modal, selectedItems: ModalItem[]) => void

export interface ModalButton {
    text: string,
    type: 'confirm' | 'normal',
    onClick: ModalEventListener
}

export interface ModalParams1 {
    title: string
    alertMessage?: string
    confirmText: string
    onConfirm: ModalEventListener
    onCancel?: ModalEventListener
    items?: ModalItem[]
}

export interface ModalParams2 {
    title: string
    alertMessage?: string
    buttons: ModalButton[]
    onCancel?: ModalEventListener
    items?: ModalItem[]
}

export interface ModalParams3 {
    title: string
    alertMessage?: string
    confirmText: string
    cancelText: string
    onConfirm: ModalEventListener
    onCancel: ModalEventListener
    items?: ModalItem[]
}

const defaultDOM = `
<div class="popup_wrap__${id}">
<header class="pop_header__${id}">
   <h1>{TITLE}</h1>
   <button class="btn_back__${id} imbtn_pop_back__${id}"><span class="blind__${id}">Menus.history_back</span></button>
</header>
<section class="extend_content__${id} pop_content__${id}">
   <div class="section_cont__${id}">
      <h2 class="blind__${id}">BIG ICON LIST</h2>
      <div class="cont_box__${id}">
         <div class="desc__${id}">
            <div class="imico_exclamation_mark__${id}"></div>
            <div class="content__${id}">{ALERT_MESSAGE}</div>
         </div>
         <div class="extend_block__${id}">
            <ul class="list__${id}"></ul>
         </div>
      </div>
   </div>
</section>
<div class="pop_btn_box__${id}"></div>
</div>`.trim()

const defaultItemDOM = `
<li>
   <div class="link__${id}">
      <div class="thmb__${id}" style="background-image: url({BACKGROUND_IMAGE}); background-repeat: no-repeat; position: relative;">
         <div class="sponser_text__${id}"><span class="sponser_text_span__${id}">{SPONSER_MESSAGE}</span></div>
      </div>
      <div class="inner_box__${id}">
         <strong class="sjt__${id}">{TITLE}</strong>
         <div class="dsc__${id}">{DESCRIPTION}</div>
      </div>
   </div>
</li>`.trim()

const parseDOM = <K extends keyof HTMLElementTagNameMap>(h: string) => {
    return new DOMParser().parseFromString(h, 'text/html').body.childNodes[0] as HTMLElementTagNameMap[K]
}

export interface ItemParams {
    title: string
    description: string
    image: string
    sponserMessage?: string
}

export class ModalItem {
    protected pSelected: boolean = false
    protected domElement: HTMLLIElement

    public readonly title: string
    public readonly description: string
    public readonly image: string
    public readonly sponserMessage: string | null

    constructor({ title, description, image, sponserMessage }: ItemParams) {
        if (!Entry.getMainWS()) throw new Error('Modal is only available in ws-mode')

        this.title = title
        this.image = image
        this.description = description
        this.sponserMessage = sponserMessage ?? null

        this.domElement = parseDOM<'li'>(defaultItemDOM
            .replace('{TITLE}', title)
            .replace('{DESCRIPTION}', description)
            .replace('{BACKGROUND_IMAGE}', image)
            .replace('{SPONSER_MESSAGE}', sponserMessage ?? '')
        )

        this.domElement.addEventListener('click', () => {
            this.selected = !this.selected
        })

        if (!this.sponserMessage) this.domElement.querySelector<HTMLDivElement>(`.sponser_text__${id}`)!.style.display = 'none'
    }

    public getDOMElement() {
        return this.domElement
    }

    set selected(v: boolean) {
        if (v) this.domElement.classList.add(`on__${id}`)
        else this.domElement.classList.remove(`on__${id}`)
        this.pSelected = v
    }

    get selected() {
        return this.pSelected
    }
}

export class Modal {
    protected pIsDestroyed: boolean = false
    protected domElement: HTMLDivElement

    public readonly title: string = ''
    public readonly buttons: ModalButton[] = []
    public readonly alertMessage: string | null = null
    public readonly items: ModalItem[] = []
    public readonly onCancel: ModalEventListener | null = null

    constructor(p: ModalParams1)
    constructor(p: ModalParams2)
    constructor(p: ModalParams3)
    constructor({ title, alertMessage, confirmText, cancelText, onConfirm, onCancel, buttons, items }: any) {
        if (!Entry.getMainWS()) throw new Error('Modal is only available in ws-mode')

        this.onCancel = onCancel ?? null

        if (buttons) {
            this.buttons = buttons
        } else {
            const arr: ModalButton[] = [{
                text: confirmText,
                type: 'confirm',
                onClick: onConfirm
            }]

            if (cancelText) arr.push({
                text: cancelText,
                type: 'normal',
                onClick: onCancel
            })

            this.buttons = arr
        }

        this.title = title
        this.alertMessage = alertMessage ?? null
        this.items = items ?? []

        this.domElement = parseDOM<'div'>(defaultDOM
            .replace('{TITLE}', title)
            .replace('{ALERT_MESSAGE}', this.alertMessage ?? '')
        )

        if (!this.alertMessage) this.domElement.querySelector<HTMLDivElement>(`.desc__${id}`)!.style.display = 'none'

        const buttonContainer = this.domElement.querySelector<HTMLDivElement>(`.pop_btn_box__${id}`)!

        this.domElement.querySelector<HTMLDivElement>(`btn_back__${id}`)!.addEventListener('click', () => {
            if (this.onCancel) {
                this.onCancel(this, this.items.filter(item => item.selected))
            } else {
                this.destroy()
            }
        })

        this.buttons.forEach(btn => {
            const elem = document.createElement('a')

            elem.addEventListener('click', () => {
                btn.onClick(this, this.items.filter(item => item.selected))
            })

            if (btn.type == 'confirm') elem.classList.add(`active__${id}`)

            elem.innerText = btn.text

            buttonContainer.appendChild(elem)
        })
    }

    public addItems(...items: ModalItem[]) {
        if (this.isDestroyed) throw new Error('Modal destroyed')
        this.items.push(...items)
    }

    public show() {
        if (this.isDestroyed) throw new Error('Modal destroyed')

        const itemContainer = this.domElement.querySelector<HTMLUListElement>(`.list__${id}`)!

        itemContainer.innerHTML = ''

        this.items.forEach(item => {
            itemContainer.appendChild(item.getDOMElement())
        })

        sel('.popup')!.appendChild(this.domElement)

        sel('.modal')!.style.display = 'block'
        this.domElement.style.display = ''
    }

    public hide() {
        if (this.isDestroyed) throw new Error('Modal destroyed')
        sel('.modal')!.style.display = 'none'
        this.domElement.style.display = 'none'
    }

    public destroy() {
        this.pIsDestroyed = true
        this.domElement.remove()
    }

    public get isDestroyed() {
        return this.pIsDestroyed
    }
}