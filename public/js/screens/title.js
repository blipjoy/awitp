game.Bird = Object.extend({
    "init" : function (x, y, dir) {
        this.x = x;
        this.y = y;
        this.dir = dir || 0;

        this.action = 0;
        this.dest = -1;
        this.hop = 0;

        this.alwaysUpdate = true;
        me.game.world.addChild(this);
    },

    "print" : function () {
        return [ "<@~,_", "_,~@>" ][this.dir];
    },

    "update" : function () {
        switch (this.action) {
        case 0:
            if (!Number.prototype.random(0, 50)) {
                this.action = Number.prototype.random(0, 2);
                game.screen.dirty = true;
            }
            break;

        case 1:
            // Turn around
            this.dir ^= 1;
            this.action = 0;
            game.screen.dirty = true;
            break;

        case 2:
            // Choose destination
            this.dest = {
                "x" : Number.prototype.random(0, 20),
                "y" : this.y
            };
            this.hop = 0;
            this.action = 3;
            break;

        case 3:
            // Move to destination
            if (this.dir === 0) {
                // Left
                if (this.dest.x === 0 && this.y == this.dest.y) {
                    this.action = 0;
                    break;
                }
                if (this.dest.x) {
                    this.dest.x--;
                    this.x--;
                    if (this.x <= 0) {
                        this.dest.x = 0;
                        this.x = 0;
                    }
                }
                this.hop ^= 1;
                this.y += (this.hop ? -1 : 1);
            }
            else {
                // Right
                if (this.dest.x === 0 && this.y == this.dest.y) {
                    this.action = 0;
                    break;
                }
                if (this.dest.x) {
                    this.dest.x--;
                    this.x++;
                    if (this.x >= 132) {
                        this.dest.x = 0;
                        this.x = 132;
                    }
                }
                this.hop ^= 1;
                this.y += (this.hop ? -1 : 1);
            }

            if (!this.hop) {
                // Short pause
                this.action += 5;
            }
            game.screen.dirty = true;
            break;

        default:
            // Short pause
            this.action--;
            break;
        }

        return game.screen.dirty;
    }
});

game.TitleScreen = game.BaseScreen.extend({
    "onResetEvent" : function () {
        var self = this;

        this.parent();

        // Animation
        this.step = 0;
        this.linein = game.art.title.logo.length;
        this.scroller = 0;
        this.turbo = [];
        game.art.title.turbo.forEach(function () {
            self.turbo.push("");
        });

        this.birds = [
            new game.Bird(24, 27, 0),
            new game.Bird(70, 17, 1),
            new game.Bird(65, 19, 0)
        ];

        me.input.bindKey(me.input.KEY.ENTER, "start", true);
    },

    "onDestroyEvent" : function () {
        this.parent();

        $("#charity").remove();
    },

    "update" : function () {
        // Animate scroller
        if (!(this.step % 8)) {
            this.scroller++;
            if (this.scroller >= game.text.title.scroller.length) {
                this.scroller = 0;
            }

            this.dirty = true;
        }

        // Animate falling logo
        if (this.linein > -27) {
            this.linein--;
            this.dirty = true;
        }

        // Animate turbo slapfest
        if (this.step === 100) {
            me.audio.play("slapfest");
            me.game.viewport.shake(8, 140 * 16.667);
        }
        if (this.step >= 100 && this.step < 220) {
            var x = Number.prototype.random(0, 45);
            var y = Number.prototype.random(0, 14);
            var part = game.art.title.turbo[y].substr(
                x,
                Number.prototype.random(1, 20)
            );
            this.turbo[y] = this.turbo[y].merge(part, x);
            this.dirty = true;
        }
        else if (this.step === 240) {
            this.turbo = game.art.title.turbo;
            this.dirty = true;
        }
        else if (this.step === 265) {
            me.audio.playTrack("milksharks");
        }

        this.step++;

        // Start game
        if (me.input.isKeyPressed("start")) {
            me.input.unbindKey(me.input.KEY.ENTER);
            me.game.viewport.fadeIn("#000", 1000, function () {
                me.state.change(me.state.PLAY);
            });
        }

        return this.parent();
    },
    
    "draw" : function (context) {
        var self = this;

        // Draw background
        this.text = [];
        game.art.title.bg.forEach(function (line) {
            self.text.push(line);
        });

        // Draw logo
        var shift = "";
        var text = "";
        var line = "";

        var logo_length = game.art.title.logo.length;
        var lineout = (this.linein < 0 ? Math.abs(this.linein) : 0);
        for (var i = 0; i < logo_length; i++) { // FIXME: change to forEach
            line = game.art.title.logo[i];
            if (line.length === 0) {
                shift = "      ";
                text = "";
            }
            else {
                text = shift;
                shift = shift.slice(1);

                for (var j = 0; j < line.length; j++) {
                    text += (line[j] === '1' ? "__/" : "   ");
                };
            }

            if (i >= this.linein) {
                self.text[lineout] = (self.text[lineout] || "").merge(text, 15);
                lineout++;
            }
        }

        // Draw turbo
        this.turbo.forEach(function (line, i) {
            var y = i + 25;
            self.text[y] = (self.text[y] || "").merge(line, 90);
        });

        // Draw birds
        this.birds.forEach(function (bird) {
            var y = bird.y
            self.text[y] = (self.text[y] || "").merge(bird.print(), bird.x);
            y++;
            self.text[y] = (self.text[y] || "").merge("^", bird.x + 2);
        });

        // Draw scroller
        this.text[10] = (this.text[10] || "").merge(
            game.text.title.scroller.substr(this.scroller, 36),
            100
        );

        return this.parent(context);
    }
});
