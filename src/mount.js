const snabbdom = require('snabbdom');
const patch = snabbdom.init([
  require('snabbdom/modules/class').default,
  require('snabbdom/modules/props').default,
  require('snabbdom/modules/style').default,
  require('snabbdom/modules/attributes').default,
  require('snabbdom/modules/eventlisteners').default,
]);

export default function(Wue) {
    Wue.prototype._mount = function() {
        const vnode = this.renderFn.call(this)
        patch(this._vnode || this.el, vnode)
        this._vnode = vnode
    }
}