with(this) {
    return _c('div', {
            attrs: {
                "id": "app"
            }
        },
        [
            _c('div',
                [
                    _c('input', {
                        directives: [{
                            name: "model",
                            rawName: "v-model",
                            value: (name),
                            expression: "name"
                        }],
                        attrs: {
                            "type": "text"
                        },
                        domProps: {
                            "value": (name)
                        },
                        on: {
                            "input": function ($event) {
                                if ($event.target.composing) return;
                                name = $event.target.value
                            }
                        }
                    }),
                    _v(" "),
                    _c('span', {
                        domProps: {
                            "textContent": _s(name)
                        }
                    })
                ]
            ),
            _v(" "),
            _c('div',
                [
                    _c('button', {
                            on: {
                                "click": increase
                            }
                        },
                        [
                            _v("+")
                        ]),
                    _v(" "),
                    _c('span', {
                        domProps: {
                            "textContent": _s(number)
                        }
                    })
                ]
            )
        ]
    )
}