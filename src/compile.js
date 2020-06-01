import { Directive } from './directives'

const onRE = /^w-on:|^@/
const modelRE = /^w-model/
const textRE = /^w-text/
const wueAttrRE = /^w-([^:]+)(?:$|:(.*)$)/
const directives = []

export default function(Wue) {
    Wue.prototype._compile = function(el, options) {
        // 递归节点，遍历属性，搜集directives描述对象
        if(el.hasChildNodes()) {
            compileNode(el)
            compileNodeList(el.childNodes)
        } else {
            compileNode(el)
        }

        // 遍历directives描述对象，创建new Directive实例
        directives.forEach((dirDesc) => {
            this._directives.push(new Directive(dirDesc, this))
        })

        // 遍历_directives, 调用directive的bind方法
        this._directives.forEach((dir) => {
            dir.bind()
        })
    }
}

const compileNode = (node) => {
    compileDirectives(node, node.attributes)
}

const compileNodeList = (nodeList) => {
    nodeList.forEach((node) => {
        compileNode(node)
        if(node.hasChildNodes()) {
            compileNodeList(node.childNodes)
        }
    })
}

const compileDirectives = (node, attributes) => {
    if(!attributes) {
        return
    }
    
    attributes = Array.from(attributes)
    if(!attributes || !attributes.length) {
        return
    }

    attributes.forEach((attr) => {
        const { name, value } = attr
        if(wueAttrRE.test(name)) {

            if(onRE.test(name)) {
                directives.push({
                    node,
                    name: 'on',
                    arg: name.replace(onRE, ''),
                    value: value,
                    rawName: name,
                    rawValue: value
                })
            } else if(modelRE.test(name)) {
                directives.push({
                    node,
                    name: 'model',
                    arg: name.replace(modelRE, ''),
                    value: value,
                    rawName: name,
                    rawValue: value
                })
            } else if(textRE.test(name)) {
                directives.push({
                    node,
                    name: 'text',
                    arg: name.replace(textRE, ''),
                    value: value,
                    rawName: name,
                    rawValue: value
                })
            }
        }
    })
}