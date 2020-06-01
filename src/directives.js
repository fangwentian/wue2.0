import Watcher from './watcher'

const config = {
    model: {
        bind(dir) {
            const { descriptor: { node }} = dir
            node.addEventListener('input', () => {
                dir._watcher && dir._watcher.set(node.value)
            })
        },
        update(newValue, oldValue, dir) {
            const { descriptor: { node }} = dir
            node.value = newValue
        }
    },
    on: {
        bind(dir) {
            const { wm, descriptor: { node, arg, value }} = dir
            if (arg === 'click') {
                node.addEventListener('click', wm[value].bind(wm))
            }
        }
    },
    text: {
        update(newValue, oldValue, dir) {
            const { descriptor: { node }} = dir
            node.innerHTML = newValue
        }
    },
}

export class Directive {
    constructor(descriptor, wm) {
        this.descriptor = descriptor
        this.wm = wm
        this._watcher = null
    }

    bind() {
        const { name } = this.descriptor
        const { bind, update } = config[name]

        // 执行对应指令的bind方法，进行事件绑定
        if(bind) {
            bind(this)
        }

        // 设置watcher的callback, 即更新函数
        if(update) {
            this._update = (newVal, oldVal) => {
                update(newVal, oldVal, this)
            }
        } else {
            this._update = () => {}
        }

        this._watcher = new Watcher(
            this.wm,
            this.descriptor.value,
            this._update
        )
    }
}