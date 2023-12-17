// index.js
interface PageItem {
    regex: RegExp
    background?: VoidFunction
    popup?: string
}
type Alarm = {
    [key: string]: { fn: VoidFunction } & chrome.alarms.AlarmCreateInfo
}


// consts.js
import { relationMap, settingsMap } from "../src/consts"
type Relation = { [key: string]: string }

interface NavItem {
    text: string
    link: string
    home?: boolean
}
interface Settings {
    [key: string]: {
        /**uses key if undefined*/
        title?: string

        description?: string

        default: boolean | string[]

        /**key to group related settings*/
        relation?: typeof relationMap[keyof typeof relationMap]

        /**keys of settings to have as dependencies*/
        uses?: Array<keyof typeof settingsMap>

        /**creates a dropdown
         * uses #default to determine if it should allow multiple values*/
        options?: string[]
    }
}


type importItem = string | {
    tag: keyof HTMLElementTagNameMap
    data?: { [key: string]: any }
}