import { ScriptHandler } from "../../../functions.js"
import trueStreamCountFn from "../scripts/trueStreamCount.js"


export default async function ({ tab, settings }) {
    const { config } = await chrome.storage.local.get('config')

    const exec = ScriptHandler(tab.id, settings)
    exec('trueStreamCount', trueStreamCountFn, [config])
}