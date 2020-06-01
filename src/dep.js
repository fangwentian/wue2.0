let uid = 0

export default class Dep {
    constructor() {
        this.id = uid++
        this.subs = []
    }

    addSub(sub) {
        this.subs.push(sub)
    }

    removeSub(sub) {
        this.subs = this.subs.filter(i => i !== sub)
    }

    depend() {
        Dep.target.addDep(this)
    }

    notify() {
        this.subs.forEach((sub) => {
            sub.update()
        })
    }
}