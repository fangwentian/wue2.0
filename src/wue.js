import Watcher from './watcher'

import state from './state'
import lifecycle from './lifecycle'
import compile from './compile'
import mount from './mount.js'

class Wue {
    constructor(options = {}) {
        this._directives = []
        this._vnode = null
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

        this.mergeMethods(options)

        // from state.js
        this._initState(options)

        // from compile.js
        this.renderFn = this._compile(el, options)

        this._mount()
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
mount(Wue)

export default Wue