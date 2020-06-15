import Watcher from '../watcher'
const h = require('snabbdom/h').default;
let wm = null

export default function codegen (ast, Wue, _wm) {
    wm = _wm
    
    Wue.prototype._h = h

    Wue.prototype._f = function(func) {
        return this[func].bind(this)
    }

    return `with(this){return ${generateElements(ast)}}`
}

const generateElements = (elements) => {
    // 过滤掉空白
    return elements.filter(ele => !(ele.tag == 'text' && /^\s*$/.test(ele.text))).map(ele => {
        // 插值表达式
        if(ele.tag == 'text' && ele.expression !== undefined) {
            console.log(ele.expression)
            // 异步的方式添加watcher
            Promise.resolve().then(() => {
                new Watcher(
                    wm,
                    ele.expression,
                    wm._mount
                )
            })
            return ele.expression.trim()
        }

        // 普通文本
        if(ele.tag == 'text') {
            return `"${ele.text}"`
        }

        // 其他非文本的节点
        return `_h("${ele.tag}",${generateAttr(ele)},[${generateChildren(ele)}])`
    }).join(',')
}

const generateAttr = (element) => {
    const { attrs, events, directives } = element
    const dirModel = directives.filter(dir => dir.name == 'model')[0]

    const attrStr = (() => {
        let res = 'attrs: {'
        if(attrs) {
            res += `${JSON.stringify(attrs).slice(1, -1)},`
        }
        // 处理w-model，设置value
        if(dirModel) {
            res += `value: '${wm[dirModel.value]}',`
        }
        res = res.slice(0, -1) + '}'
        return res
    })()

    const eventStr = (() => {
        if(events && Object.keys(events).length || dirModel) {
            let res = ',on:{'
            Object.keys(events).forEach(key => {
                res += `'${key}': _f('${events[key]}'),`
            })
            // 处理w-model，绑定input事件
            if(dirModel) {
                res += `input: function($event){${dirModel.value} = $event.target.value},`
            }
            res = res.slice(0, -1) + '}'
            return res
        }
        return ''
    })()

    return `{${attrStr}${eventStr}}`
}

const generateChildren = (element) => {
    const children = element.children
    if(children && children.length) {
        return generateElements(children)
    }
    return ''
}