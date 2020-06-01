export default function (Wue) {
    Wue.prototype._callHook = function(hook) {
        this[hook].call(this)
    }
}