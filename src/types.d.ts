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
    /**@default false*/
    footer?: boolean
}
type Settings = {
    [key: string]: BaseSettings | StringSettings | NumberSettings
}
interface BaseSettings {
    /**uses key if undefined*/
    title?: string

    description?: string

    default: boolean

    /**key to group related settings*/
    relation?: typeof relationMap[keyof typeof relationMap] | string

    /**keys of settings to have as dependencies*/
    uses?: Array<keyof typeof settingsMap>

    /**if this setting should be show in the settings popout
     * @default true*/
    popout?: boolean

}
interface StringSettings extends BaseSettings {
    default: string | string[]

    /**creates a dropdown
     * uses #default to determine if it should allow multiple values*/
    options?: string[] | {
        /**key: "text"*/
        [key: string]: string
    }
}
interface NumberSettings extends BaseSettings {
    default: number

    /**[min, max]*/
    range?: [number, number]
}


type importItem = string | {
    tag: keyof HTMLElementTagNameMap
    data?: { [key: string]: any }
}


type Change = string | {
    text: string
    setting: string
} | {
    title: string
    changes: Change[]
}

export interface ChangeLog {
    [key: string]: {
        state?: string
        date?: string
        changes: Change[]
    }
}