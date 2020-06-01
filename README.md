# wue1.0
## 数据侧
defineReactive -> get -> if(Dep.target) { dep.depend() } ->  Dep.target.addDep(this) -> 将dep放入watcher的deps数组 -> 同时 dep的subs中放入watcher
defineReactive -> set -> dep.notify -> 依次执行subs里的watcher的update方法

Watch.get -> Dep.target = this -> 计算取值 -> 触发get

## 模板侧
compile -> 有无child -> compileNode -> compileDirectives -> 解析节点上的每一个属性 -> new Directive实例，搜集到vm._directives  -> 遍历依次进行 directive.bind -> new Watcher -> watcher.update() -> watcher.get()

## Tips
一个指令  ->  一个expression  ->  new 一个watcher

data的每个属性 -> 一个dep -> 多个watcher


# wue2.0
compile -> ast -> render function -> vnode -> 真实dom (diff & patch)