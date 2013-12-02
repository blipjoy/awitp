game.BaseScreen = me.ScreenObject.extend({
    "init" : function () {
        // Add as object
        this.parent(true);

        game.screen = this;
        this.dirty = false;
    },

    "onResetEvent" : function () {
        // So unfortunate! I have to defer this call because melonJS sets
        // `floating` after `onResetEvent` returns.
        (function (self) {
            self.floating = false;
        }).defer(this);

        this.font = new me.Font(
            'Menlo, "DejaVu Sans Mono", "Lucida Console", monospace',
            12,
            "#fff"
        );
        this.dirty = true;
        this.text = [];

        if (this.bgm && me.audio.getCurrentTrack() !== this.bgm) {
            me.audio.playTrack(this.bgm);
        }
    },

    "onDestroyEvent" : function () {
        this.font = null;

        if (this.bgm) {
            me.audio.stopTrack();
        }
    },

    "update" : function () {
        var dirty = this.dirty;
        this.dirty = false;

        return dirty;
    },

    "draw" : function (context) {
        me.video.clearSurface(context, "#000");
        this.font.draw(context, this.text.join("\n"), 0, 0);
    }
});
