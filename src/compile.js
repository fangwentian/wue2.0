import Watcher from './watcher'
const htmlparser2 = require("htmlparser2");
const h = require('snabbdom/h').default;

const onRE = /^w-on:|^@/
const wueAttrRE = /^w-([^:]+)(?:$|:(.*)$)/
let wm = null

export default function(Wue) {
    Wue.prototype._compile = function(el, options) {
        wm = this
        const template = getTemplate(el)
        const ast = parse(template, options)
        console.log(ast)

        const code = generate(ast)
        console.log(code)

        const renderFn = getFunction(code)
        return renderFn
    }

    Wue.prototype._h = h

    Wue.prototype._e = function(expression) {
        return this[expression]
    }

    Wue.prototype._f = function(func) {
        return this[func].bind(this)
    }
}

const getTemplate = (el) => {
    return el.outerHTML.trim()
}

const getFunction = (string) => {
    return new Function(string)
}

const parse = (template, options) => {
    let result = []
    let level = -1
    let arr = []

    const parser = new htmlparser2.Parser(
        {
            onopentag(name, attrs) {
                level++
                const directives = []
                const events = {}

                // attrs只放置非指令
                const filteredAttr = Object.keys(attrs).filter(key => !wueAttrRE.test(key)).reduce((res, cur) => {
                    res[cur] = attrs[cur]
                    return res
                }, {})

                // 搜集directives & events
                Object.keys(attrs).forEach((key) => {
                    const value = attrs[key]
                    if(wueAttrRE.test(key)) {
                        const type = key.split(':')[0].replace(/^w-/, '')
                        const arg = key.split(':')[1]

                        if(onRE.test(key)) {
                            events[arg] = value
                        } else {
                            directives.push({
                                rawName: key,
                                name: type,
                                value,
                                arg
                            })
                        }
                    }
                })

                let current = {
                    tag: name,
                    attrs: filteredAttr,
                    children: [],
                    directives,
                    events
                }

                // 当是根目录的时候，放入result
                if(level == 0) {
                    result.push(current)
                }

                let parent = arr[level - 1]
                if(parent) {
                    parent.children.push(current)
                }
                arr[level] = current
            },
            ontext(text) {
                level++
                let current = {
                    tag: 'text',
                    text,
                    children: []
                }
                // 处理{name}这种取值
                if(/^\{.*\}$/.test(text)) {
                    current.expression = text.slice(1, -1)
                }

                let parent = arr[level - 1]
                if(parent) {
                    parent.children.push(current)
                }
                arr[level] = current
                level--
            },
            onclosetag() {
                level--
            },
        },
        { decodeEntities: true }
    );
    parser.write(template);
    parser.end();
    return result
}

const generate = (ast) => {
    return `with(this){return ${generateElements(ast)}}`
}

const generateElements = (elements) => {
    // 过滤掉空白
    return elements.filter(ele => !(ele.tag == 'text' && /^\s*$/.test(ele.text))).map(ele => {
        // 插值表达式
        if(ele.tag == 'text' && ele.expression !== undefined) {
            // 异步的方式添加watcher
            Promise.resolve().then(() => {
                new Watcher(
                    wm,
                    ele.expression,
                    wm._mount
                )
            })
            return `_e('${ele.expression.trim()}')`
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