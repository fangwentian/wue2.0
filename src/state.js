import observe from './observe'

const dataProxy = (data, wm) => {
    Object.entries(data).forEach(([key, value]) => {
        Object.defineProperty(wm, key, {
            configurable: true,
            enumerable: true,
            get() {
                return wm.$data[key]
            },
            set(val) {
                wm.$data[key] = val
            }
        })
    })
}

export default function (Wue) {
    Wue.prototype._initState = function(options) {
        const { data } = options
        this.$data = data ? (typeof data == 'function' ? data() : data) : {}

        // 数据访问代理
        dataProxy(this.$data, this)

        // 数据监听
        observe(this.$data, this)
    }
}