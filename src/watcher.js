import Dep from './dep'
let uid = 0

export default class Watcher {
    constructor(wm, expression, cb) {
        this.wm = wm
        this.expression = expression
        this.cb = cb
        this.deps = []
        this.depIds = new Set()
        this.update()
        // expression计算之后的值，用来记录oldValue
        this.value = this.get()
    }

    // 计算expression, 设置Dep.target
    get() {
        Dep.target = this
        const value = this.wm[this.expression]
        Dep.target = null
        return value
    }

    set(value) {
        this.wm[this.expression] = value
    }

    addDep(dep) {
        if(!this.depIds.has(dep.id)) {
            this.deps.push(dep)
            this.depIds.add(dep.id)
            dep.addSub(this)
        }
    }

    update() {
        const oldValue = this.value
        const newValue = this.get()
        if(oldValue !== newValue) {
            this.cb.call(this.wm, newValue, oldValue)
            this.value = newValue
        }
    }
}