export default (config) => {
    const toCamelCase = (str) => str.replace(/-[A-z]/g, (s) => s[1].toUpperCase())
    const isOldNav = document.querySelector('[data-controller="header"]')?.classList.contains('site-header')
    const focusClass = document.getElementById('account_menu_dark_mode_switch')?.checked ? 'lcx-foucsBg' : 'lcx-foucsBg-light'

    const panels = {}
    // sets up manus/dropdowns
    for (const id of config.betterDropdownIds) {
        const panelToggle = document.getElementById(id)
        if (!panelToggle) continue;


        const label = document.querySelector(`label[for="${id}"]`)
        label?.setAttribute('tabindex', 0) // makes all menu labels focusable
        if (isOldNav) label?.classList.add(focusClass)


        // makes dropdown children unfocusable while hidden
        panels[id] = isOldNav ? panelToggle.parentElement.children.item(2) : document.querySelector(`[data-header-target="${toCamelCase(id)}"]`)

        const check = () => panels[id].classList[!panelToggle.checked ? 'add' : 'remove']('hidden')
        if (!panelToggle.checked) check()
        panelToggle.addEventListener('click', check)

        panels[id].querySelectorAll(config.selector.betterDropdownItems).forEach(e => {
            e.setAttribute('tabIndex', '-1')
            e.classList.add(focusClass)
        })
    }

    var open, openChildren, lastOn
    window.addEventListener('keyup', (e) => {
        if (!['Tab', 'Enter', 'Escape'].includes(e.key)) return;

        const id = e.target.getAttribute('for') || open
        const getItems = () => panels[id].querySelectorAll(config.selector.betterDropdownItems)
        if (e.key === 'Enter') {
            if (!config.betterDropdownIds.includes(id)) return;

            e.target.click() // makes the dropdown auto open when tabbing through
            open = id

            const items = getItems()
            items.forEach(e => e.removeAttribute('tabIndex'))
            setTimeout(() => items[0].focus(), 50);
            return items[0].focus()
        }
        if (!open) return


        if (e.key === 'Tab') {
            if (!openChildren) openChildren = Array.from(getItems())

            const last = openChildren.slice(-1)[0]
            console.log(e.target, lastOn, last)
            if (lastOn === last && !e.shiftKey) {
                openChildren[0].focus()
                lastOn = undefined
            }
            else if (lastOn === openChildren[0] || (!lastOn && e.shiftKey)) {
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