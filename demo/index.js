import Wue from '../src/wue.js'

new Wue({
    el: '#app',
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