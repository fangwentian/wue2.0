import Dep from './dep'

class Observer {
    constructor(data) {
        this.data = data
        this.walk(data)
    }

    walk(obj) {
        Object.keys(obj).forEach((key) => {
            const value = obj[key]
            this.defineReactive(obj, key, value)

            if(typeof value == 'object') {
                this.walk(value)
            }
        })
    }

    defineReactive(obj, key, value) {
        const dep = new Dep()

        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get() {
                if(Dep.target) {
                    dep.depend()
                }
                return value
            },
            set(val) {
                if(value == val) {
                    return
                }
                value = val
                dep.notify()
            }
        })
    }
}

export default function observe(data, wm) {
    new Observer(data)
}