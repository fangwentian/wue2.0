import parse from './parse'
import codegen from './codegen'

export default function(Wue) {
    Wue.prototype._compile = function(el, options) {
        const template = options.template || getTemplate(el)
        console.log(template)

        const ast = parse(template)
        console.log(ast)

        const code = codegen(ast, Wue, this)
        console.log(code)

        const renderFn = getFunction(code)
        return renderFn
    }
}

const getTemplate = (el) => {
    return el.outerHTML.trim()
}

const getFunction = (string) => {
    return new Function(string)
}