game.PlayScreen = game.BaseScreen.extend({
    "bgm" : "milksharks",

    "onResetEvent" : function () {
        this.parent();

        // Game progress
        this.area = "path";
        this.command = "info";
        this.bag = {};

        // Command processor
        this.action = "";
        this.args = [];

        // Text output
        this.lines = [];

        // Event handlers
        this.onkeypress = (function (e) {
            var key = e.key || e.keyCode || e.which;

            // Enter/Return key
            if (key === "Enter" || key === 10 || key === 13) {
                this.command = this.$input.val();
                this.$input.val("");
                e.preventDefault();
            }
        }).bind(this);

        // Keep input text box focused
        this.onblur = (function () {
            var input = this.$input[0];
            (function () {
                input.focus();
            }).defer();
        }).bind(this);

        $("body").on({
            "click"     : this.onblur,
            "keydown"   : this.onblur
        });

        // Keep the text input sized proportionally
        var onresize = (function() {
            var width = me.video.getScreenCanvas().width;
            this.$input.css({
                "left"      : ($("#screen").width() - width) / 2,
                "width"     : width,
                "font-size" : (12 * me.sys.scale.x) + "px",
                "height"    : (12 * 1.667) + "px"
            });
            this.onblur();
        }).bind(this);

        this.onresize = me.event.subscribe(
            me.event.WINDOW_ONRESIZE,
            function () {
                setTimeout(onresize, 100);
            }
        );

        // Create input text box
        this.$input = $('<input type="text" />');
        this.$input.on({
            "keypress"  : this.onkeypress,
            "blur"      : this.onblur
        });
        $("#screen").append(this.$input);
        onresize();

        // Fade-in
        me.game.viewport.fadeOut("#000", 1000);
    },

    "onDestroyEvent" : function () {
        this.parent();

        me.event.unsubscribe(this.onresize);

        this.$input.off({
            "keypress"  : this.onkeypress,
            "blur"      : this.onblur
        });
        this.$input = null;
    },

    "update" : function () {
        var self = this;

        // Command parser
        if (this.command) {
            this.args = this.command.toLowerCase().split(" ");
            this.args = this.args.filter(function (word) {
                return !(word in game.text.ignoreWords);
            }).map(function (word) {
                // Dumb-transform plural to singular
                if (word.slice(-1) === "s") {
                    if (word.slice(-3) === "ies") {
                        word = word.slice(0, -3) + "y";
                    }
                    else {
                        word = word.slice(0, -1);
                    }
                }

                // Reserved characters
                word = word.replace(/_/g, "");

                return word;
            });
            this.action = this.args.shift();

            this.command = "";
            this.dirty = true;

            // Command interpreter
            if (this.action in game.commands.local) {
                // "Local" actions, like "look"
                var target = game.text.play[this.area][
                    game.commands.local[this.action]
                ];

                this.lines = (
                    target[this.args[0]] ||     // Local items of interest
                    this.bag[this.args[0]] ||   // Bag contents
                    target._                    // Fallback to area
                );
            }
            else if (this.action in game.commands.global) {
                // "GLobal" actions, like "go" and "use"
                this.lines = game.text.play.global[
                    game.commands.global[this.action]
                ];

                if (!this.lines) {
                    switch (game.commands.global[this.action]) {
                    case "go":
                        this.area = game.text.play[this.area].go[
                            this.args[0] || this.action
                        ] || this.area;
                        this.lines = game.text.play[this.area].info._;
                        break;

                    case "get":
                        this.lines = undefined;

                        var get = game.text.play[this.area].get;
                        var item = this.args[0];
                        if (get && item in get) {
                            var description = get[item];

                            this.lines = [
                                "Got: " + item,
                                "",
                                description
                            ];

                            this.bag[item] = [ description ];
                            delete get[item];
                        }

                        this.lines = this.lines || game.text.play.global._get;
                        break;

                    case "use":
                        // TODO!
                        this.lines = undefined;

                        var use = game.text.play[this.area].use;
                        var item1 = this.args[0];
                        var item2 = this.args[1];

                        if (
                            use &&
                            item1 in this.bag &&
                            item1 in use &&
                            item2 in use[item1]
                        ) {
                            // Use item1 on item2
                            use = use[item1][item2];
                            this.lines = use._;
                            if (use._unlock) {
                                use._unlock();
                            }
                        }
                        else if (
                            use &&
                            item1 in use &&
                            "_" in use[item1]
                        ) {
                            // Use item1
                            use = use[item1];
                            this.lines = use._;
                            if (use._unlock) {
                                use._unlock();
                            }
                        }

                        this.lines = this.lines || game.text.play.global._use;
                        break;

                    case "bag":
                        this.lines = [ "My bag contains:", "" ];
                        Object.keys(this.bag).forEach(function (item) {
                            self.lines.push("    " + item);
                        })
                        break;
                    }
                }
            }
            else {
                this.lines = game.text.play.global.unknown;
            }
        }

        return this.parent();
    },

    "draw" : function (context) {
        this.text = [];
        for (var i = 0; i < 50 - this.lines.length; i++) {
            this.text.push("");
        }
        this.text = this.text.concat(this.lines);
        
        return this.parent(context);
    }
});
