const htmlparser2 = require("htmlparser2");
const onRE = /^w-on:|^@/
const wueAttrRE = /^w-([^:]+)(?:$|:(.*)$)/

export default function parse (template) {
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
                // 处理插值
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