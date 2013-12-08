
/* Game namespace */
var game = {
    // Run on page load.
    "onload" : function () {
        // Initialize the video.
        if (!me.video.init("screen", c.WIDTH, c.HEIGHT, c.DOUBLEBUF, c.SCALE)) {
            alert("Your browser does not support HTML5 canvas.");
            return;
        }

        // Initialize the audio.
        me.audio.init("mp3,ogg");

        // Set a callback to run when loading is complete.
        me.loader.onload = this.loaded.bind(this);
        this.loadResources();

        // Display the loading screen.
        me.state.set(me.state.LOADING, new game.LoadingScreen());
        me.state.change(me.state.LOADING);
    },

    "loadResources" : function () {
        // Set all resources to be loaded.
        var resources = [];

        // Graphics.
        this.resources["img"].forEach(function forEach(value) {
            resources.push({
                "name"  : value,
                "type"  : "image",
                "src"   : "data/img/" + value + ".png"
            })
        });

        // Atlases.
        this.resources["tps"].forEach(function forEach(value) {
            resources.push({
                "name"  : value,
                "type"  : "tps",
                "src"   : "data/img/" + value + ".json"
            })
        });

        // Maps.
        this.resources["map"].forEach(function forEach(value) {
            resources.push({
                "name"  : value,
                "type"  : "tmx",
                "src"   : "data/map/" + value + ".json"
            })
        });

        // Sound effects.
        this.resources["sfx"].forEach(function forEach(value) {
            resources.push({
                "name"      : value,
                "type"      : "audio",
                "src"       : "data/sfx/",
                "channel"   : 3
            })
        });

        // Background music.
        this.resources["bgm"].forEach(function forEach(value) {
            resources.push({
                "name"      : value,
                "type"      : "audio",
                "src"       : "data/bgm/",
                "channel"   : 1,
                "stream"    : true
            })
        });

        // Load the resources.
        me.loader.preload(resources);
    },

    // Run on game resources loaded.
    "loaded" : function () {
        // Set up game states.
        me.state.set(me.state.BLIPJOY, new game.BlipjoyScreen());
        me.state.set(me.state.MENU, new game.TitleScreen());
        game.playscreen = new game.PlayScreen();
        me.state.set(me.state.PLAY, game.playscreen);

        // Start the game.
        me.state.change((
            c.DEBUG || c.HASH.play 
        ) ? me.state.PLAY : me.state.BLIPJOY);
    }
};

String.prototype.merge = function (text, index) {
    index = index || 0;

    var out = "";
    var length = Math.max(this.length, text.length + index);

    for (var i = 0; i < length; i++) {
        var j = i - index;
        if (j >= 0 && j < text.length && text[j] !== ' ') {
            out += text[j] || ' ';
        }
        else {
            out += this[i] || ' ';
        }
    }

    return out;
};
