game.LoadingScreen = me.ScreenObject.extend({
    "init" : function () {
        this.parent(true);

        function drawLogo(defs, w, h, scale) {
            var def = null,
                pixels = null,
                x = null,
                y = null,
                context = me.video.getContext2d(me.video.createCanvas(w, h));

            // Background
            me.video.clearSurface(context, "#000");

            // Iterating each compressed bitmap definition
            for (var i = 0; i < defs.length; i++) {
                def = defs[i];
                x = def.x * scale;
                y = (def.y - 1) * scale;

                context.fillStyle = def.color;

                // Iterate each pixel byte
                for (var j = 0, l = 0; j < def.pixels.length; j++, l += 8) {
                    pixels = def.pixels.charCodeAt(j);
                    if ((l % def.w) === 0) {
                        x = def.x * scale;
                        y += scale;
                    }

                    // Each byte encodes 8 pixels
                    for (var k = 0; k < 8; k++) {
                        if ((pixels >> k) & 1) {
                            context.fillRect(x, y, scale, scale);
                        }
                        x += scale;
                    }
                }
            }

            return context.canvas;
        }

        // Create a new scaled image
        var WIDTH = 24,
            HEIGHT = 14;
        this.scale = Math.round(Math.min(
            c.WIDTH / WIDTH / 3,
            c.HEIGHT / HEIGHT / 3
        ));
        game.blipjoyLogo = drawLogo([
            {
                "x" : 8,
                "y" : 0,
                "w" : 8,
                "pixels" :  "\x81\x42\x3C\x5A\xBD\xA5\x99\x42",
                "color" :   "#4B0082"
            },
            {
                "x" : 0,
                "y" : 9,
                "w" : 24,
                "pixels" :  "\x13\x8D\xA4\x15\x94\xAA\x13\x8D" +
                            "\x4A\x15\xA5\x4A\x73\x45\x44",
                "color" :   "#fff"
            }
        ], WIDTH * this.scale, HEIGHT * this.scale, this.scale);

        // Flag to cause a redraw
        this.invalidate = false;

        // Handler for loading status bar
        this.handler = null;

        // Loading progress percentage
        this.loadPercent = 0;
    },

    "onResetEvent" : function () {
        this.handler = me.event.subscribe(
            me.event.LOADER_PROGRESS, this.onProgressUpdate.bind(this)
        );
    },

    "onDestroyEvent" : function () {
        me.event.unsubscribe(this.handler);
    },

    "onProgressUpdate" : function (progress) {
        this.loadPercent = progress;
        this.invalidate = true;
    },

    "update" : function () {
        if (this.invalidate) {
            this.invalidate = false;
            return true;
        }

        return false;
    },

    "draw" : function (context) {
        var img = game.blipjoyLogo,
            x = (c.WIDTH - img.width) / 2,
            y = (c.HEIGHT - img.height) / 2,
            size = 8 * this.scale;

        me.video.clearSurface(context, "#000");

        // Draw logo
        context.drawImage(
            img,
            size, 0, size, size,
            x + size, y, size, size
        );

        // Draw progress bar
        var progress = Math.floor(this.loadPercent * c.WIDTH);
        context.fillStyle = "#fff";
        context.fillRect(2, y + this.scale * 11, progress - 4, 4);
    }
});

game.BlipjoyScreen = me.ScreenObject.extend({
    "regions" : [
        { t: 0, x: 8, y: 0, w: 8, h: 8 },       // Invader
        { t: 500, x: 0, y: 9, w: 3, h: 5 },     // B
        { t: 200, x: 4, y: 9, w: 3, h: 5 },     // L
        { t: 500, x: 8, y: 9, w: 1, h: 5 },     // i
        { t: 150, x: 10, y: 9, w: 3, h: 5 },    // P
        { t: 150, x: 13, y: 9, w: 3, h: 5 },    // J
        { t: 250, x: 17, y: 9, w: 3, h: 5 },    // O
        { t: 500, x: 21, y: 9, w: 3, h: 5 }     // Y
    ],

    "init" : function () {
        var r = null,
            WIDTH = 24,
            HEIGHT = 14,
            scale = Math.round(Math.min(
                c.WIDTH / WIDTH / 3,
                c.HEIGHT / HEIGHT / 3
            ));

        // Resize the regions, too
        for (var i = 0; i < this.regions.length; i++) {
            r = this.regions[i];
            r.x *= scale;
            r.y *= scale;
            r.w *= scale;
            r.h *= scale;
        }

        this.parent(true);
    },

    "onResetEvent" : function () {
        var self = this;

        // There are better ways to do this. :)
        self.state = 0;
        self.timeout = 0;
        animate();

        function animate() {
            if (self.state) {
                me.audio.play("blip" + self.state);
            }
            self.state++;
            var r = self.regions[self.state];
            if (r) {
                self.timeout = setTimeout(animate, r.t);
            }
        }

        setTimeout(function () {
            me.game.viewport.fadeIn("#000", 250, function () {
                me.state.change(me.state.MENU);
            });
        }, 5000);
    },

    "onDestroyEvent" : function () {
        clearTimeout(this.timeout);
    },

    "update" : function () {
        return true;
    },

    "draw" : function (context) {
        var img = game.blipjoyLogo,
            x = (c.WIDTH - img.width) / 2,
            y = (c.HEIGHT - img.height) / 2,
            r = null;

        me.video.clearSurface(context, "#000");

        var len = Math.min(this.state, this.regions.length);
        for (i = 0; i < len; i++) {
            r = this.regions[i];
            context.drawImage(
                img,
                r.x, r.y, r.w, r.h,
                x + r.x, y + r.y, r.w, r.h
            );
        }
    }
});
