import toVnode from 'snabbdom/tovnode'

import state from './state'
import lifecycle from './lifecycle'
import compile from './compile'

class Wue {
    constructor(options = {}) {
        this._directives = []
        const valid = this.check(options)
        if(valid) {
            this.init(options)
        } else {
            console.log('参数错误')
        }
    }

    check(options) {
        const { el } = options
        if(!el) {
            return false
        }
        return true
    }

    init(options) {
        this.$options = options
        const el = this.el = document.querySelector(options.el)
        const vnode = toVnode(el)
        console.log(vnode, 'vnode')

        this.mergeMethods(options)

        // from state.js
        this._initState(options)

        // from compile.js
        this._compile(el, options)
    }

    mergeMethods(options) {
        const { methods = {}} = options
        Object.keys(methods).forEach((key) => {
            this[key] = methods[key]
        })
    }
}

state(Wue)
lifecycle(Wue)
compile(Wue)

export default Wue