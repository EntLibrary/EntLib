<h1 align="center">EntLib<h1>

EntLib(EntLibrary)는 코딩교육 플랫폼 엔트리에서 커스텀 블록/카테고리를 만들수 있도록 해주는 라이브러리 입니다.

EntLib을 JavaScript에서 쓸때 EntLib.d.ts를 쓰면 개발을 더 쉽게 할 수 있습니다. 
```js
/// <reference types="/path/to/EntLib" />

new EntLib.Extension()
```

EntLib을 TypeScript에서 쓸때는 EntLib.d.ts가 필요합니다.
JavaScript와 같이 JSDoc으로 불러올 필요는 없습니다.
parcel-bundler, webpack과 같은 번들러를 이용해세요
```ts
import { Extension } from 'EntLib'

new Extension({})
```

예제:
```ts
import { Extension } from 'EntLib'

const extension = new Extension({
    displayName: '확장블록',
    blocks: {
        logToConsole: new Block({
            template: '[콘솔에 (text: Hello world!) 출력하기]',
            action({ text }) {
                console.log(text)
            }
        })
    }
})

extension.enable()
Extension.allExtensionsLoaded()
```
