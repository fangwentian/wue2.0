import Wue from '../src/wue.js'

new Wue({
    el: '#app',
    template: `
<div id="app">
    <div>
        <input type="text" w-model="name" class="input mgr"/>
        <span>{name}</span>
    </div>
    <div>
        <button w-on:click="increase" class="mgr">+</button>
        <span>{number}</span><br>
        <span>{'number:' + 2 * number}</span>
    </div>
</div>`,
    data: {
        name: 'basketball',
        number: 0
    },
    methods: {
        increase() {
            this.number += 1
        }
    }
})