const htmlparser2 = require("htmlparser2");
const h = require('snabbdom/h').default;

const onRE = /^w-on:|^@/
const wueAttrRE = /^w-([^:]+)(?:$|:(.*)$)/

export default function(Wue) {
    Wue.prototype._compile = function(el, options) {
        const template = getTemplate(el)
        const ast = parse(template, options)
        console.log(ast)

        const code = generate(ast)
        console.log(code)

        const renderFn = getFunction(code)
        return renderFn
    }

    Wue.prototype._h = h

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
                const events = []

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
                            events.push({ [type]: value })
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
    return `with(this){${generateElements(ast)}}`
}

const generateElements = (elements) => {
    return elements.map(ele => {
        return `_h("${ele.tag}",${generateAttr(ele)},[${generateChildren(ele)}])`
    }).join(',')
}

const generateAttr = (element) => {
    const attrs = element.attrs
    return `{"attrs":${attrs ? JSON.stringify(attrs) : '{}'}}`
}

const generateChildren = (element) => {
    const children = element.children
    if(children && children.length) {
        return generateElements(children)
    }
    return ''
}