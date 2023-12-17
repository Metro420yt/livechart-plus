export default (config) => {
    const toCamelCase = (str) => str.replace(/-[A-z]/g, (s) => s[1].toUpperCase())
    // alters manus/dropdowns
    for (const id of config.betterDropdownIds) {
        document.querySelector(`label[for="${id}"]`)?.setAttribute('tabindex', 0) // makes all menu labels focusable


        // makes dropdown children unfocusable while hidden
        const panel = document.querySelector(`[data-header-target="${toCamelCase(id)}"]`)
        const panelToggle = document.getElementById(id)

        const check = () => panel.classList[!panelToggle.checked ? 'add' : 'remove']('hidden')
        if (!panelToggle.checked) check()
        panelToggle.addEventListener('click', check)

        panel.querySelectorAll('li>a').forEach(e => e.setAttribute('tabIndex', '-1'))
    }

    var open, openChildren, lastOn
    window.addEventListener('keyup', (e) => {
        if (!['Tab', 'Enter', 'Escape'].includes(e.key)) return;

        const id = e.target.getAttribute('for')
        const getItems = () => document.querySelectorAll(`[data-header-target="${toCamelCase(open || id)}"] li>a`)
        if (e.key === 'Enter') {
            if (!config.betterDropdownIds.includes(id)) return;

            e.target.click() // makes the dropdown auto open when tabbing through
            open = id

            const items = getItems()
            items.forEach(e => e.removeAttribute('tabIndex'))
            return items[0].focus()
        }
        if (!open) return



        // gets the dropdown parent
        const getParent = () => {
            while (parent?.tagName !== 'BODY') {
                var parent = parent?.parentElement || e.target;
                if (parent.getAttribute('data-header-target')) break;
            }
            return parent?.tagName === 'BODY' ? undefined : parent
        }


        if (e.key === 'Tab') {
            if (!openChildren) openChildren = Array.from(getItems())

            const last = openChildren.slice(-1)[0]
            if (lastOn === last && !e.shiftKey) {
                openChildren[0].focus()
                lastOn = undefined
            }
            else if (lastOn === openChildren[0] || (!lastOn && e.shiftKey) || !getParent()) {
                last.focus()
                lastOn = last
            }
            else lastOn = e.target
        }
        else if (e.key === 'Escape') {
            const label = document.querySelector(`label[for="${open}"`)
            label.focus()
            label.click()
            open = undefined
            openChildren = undefined
            lastOn = undefined
        }
    })
}