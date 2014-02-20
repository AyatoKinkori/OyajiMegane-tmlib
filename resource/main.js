/*
 * constant
 */
var app = null;
var SCREEN_WIDTH    = 1000;
var SCREEN_HEIGHT   = 782;
var SCREEN_CENTER_X = SCREEN_WIDTH/2;
var SCREEN_CENTER_Y = SCREEN_HEIGHT/2;
var SPRITE_WIDTH = 200;
var SPRITE_HEIGHT = 225;



tm.preload(function() {
    tm.graphics.TextureManager.add("start","resource/start.jpg");
    tm.graphics.TextureManager.add("megane", "resource/ossan_megane.png");
});
/*
 * メイン処理(ページ読み込み後に実行される)
 */
tm.main(function() {
    // アプリケーション作成
    var app = tm.app.CanvasApp("#world");
    app.resize(SCREEN_WIDTH, SCREEN_HEIGHT); // リサイズ
    app.fitWindow();    // 自動フィット
    
    // シーンを切り替える
    app.replaceScene(StartScene());
    
    // 実行
    app.run();
});


tm.define("StartScene", {
    superClass: "tm.app.Scene",

    init: function() {
        // 親の初期化
        this.superInit();
        // 星スプライト
        this.start = tm.app.Sprite(SCREEN_WIDTH, SCREEN_HEIGHT, "start");
        this.start.x = SCREEN_CENTER_X;
        this.start.y = SCREEN_CENTER_Y;
        this.addChild(this.start);    // シーンに追加
    },
    onmousedown: function() {
        this.app.replaceScene(GameScene());
    },
});

tm.define("GameScene", {
    superClass: "tm.app.Scene",

    init:function() {
        this.target = false;
        this.superInit();
        this.time = 10;
        this.timerLabel = tm.app.Label(this.time.toString);
        this.timerLabel.position.set(100, 200);
        //タイマーの時間とラベルセット
        var oyaji = Oyaji();
        oyaji.gotoAndPlay("furafura_1");
        this.oyajis = [oyaji];
        this.len = this.oyajis.length;
        this.addChild(this.timerLabel);
        this.addChild(oyaji);
    },
    update: function(app) {
        this.time -= 1;
        this.timerLabel.text = this.time.toString();
        if(this.time < 1) {
            console.log("ゲーム終了");
        }
        if(app.pointing.getPointingStart()) {
            this.target = true;
        }
        if(app.pointing.getPointingEnd() && this.target == true) {
            for(var i=0; i < this.len; i++) {
                if(this.oyajis[i].isHitPointRect(app.pointing.x, app.pointing.y)) {
                    this.time = 10;
                    this.timerLabel.text = this.time.toString();
                    this.oyajis[i].touch_megane();
                }
            }
            this.target = false;
        }
    }
});

tm.define("Oyaji", {
    superClass: "tm.app.AnimationSprite",
    init: function() {
        var ss = tm.app.SpriteSheet({
            image:"megane",
            frame:{
                width: SPRITE_WIDTH,
                height: SPRITE_HEIGHT,
                count: 9
            },
        animations: {
            "furafura_1": [0, 2, "furafura_1", 5],
            "furafura_2": [3, 5, "shakin_aruki", 7],
            "shakin_aruki": [6, 8, "shakin_aruki", 5]
        }
        });
        this.superInit(200, 225, ss);
        var random_x = Math.floor(Math.random() * (SCREEN_WIDTH - 21));
        var random_y = Math.floor(Math.random() * (SCREEN_HEIGHT - 31));
        var random_direction = 1 + Math.floor(Math.random() * 2);
        if(random_direction > 1) {
            random_direction = -1;
        }
        this.direction = random_direction;
        this.scaleX *= random_direction;
        this.position.set(random_x, random_y);
        //this.position.set(100, 200);
    },
    update: function() {
        this.x -= (3 * this.direction);
    },
    touch_megane: function() {
        this.gotoAndPlay("furafura_2");
        this.tweener.wait(7);
        this.update = function() {
            this.x -= (this.direction * 5);
        }
    }
});
