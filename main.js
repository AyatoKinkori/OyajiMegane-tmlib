/*
 * constant
 */
var app = null;
var SCREEN_WIDTH    = 640;
var SCREEN_HEIGHT   = 960;
var SCREEN_CENTER_X = SCREEN_WIDTH/2;
var SCREEN_CENTER_Y = SCREEN_HEIGHT/2;
var SPRITE_WIDTH = 201;
var SPRITE_HEIGHT = 240;
var ZETUBOU_WIDTH = 360;
var ZETUBOU_HEIGHT = 290;
var YOROKOBI_WIDTH = 340;
var YOROKOBI_HEIGHT = 310;
var GAME_TIME = 5;
var GAUGE_WIDTH = SCREEN_WIDTH;


tm.preload(function() {
    tm.graphics.TextureManager.add("bk-office","resource/bk.jpg");
    tm.graphics.TextureManager.add("start","resource/start.jpg");
    tm.graphics.TextureManager.add("megane", "resource/ossan_megane.png");
    tm.graphics.TextureManager.add("bra", "resource/ossan_bra.png");
    tm.graphics.TextureManager.add("dekame", "resource/ossan_dekame.png");
    tm.graphics.TextureManager.add("go-guru", "resource/ossan_go-guru.png");
    tm.graphics.TextureManager.add("gurasan", "resource/ossan_gurasan.png");
    tm.graphics.TextureManager.add("pero", "resource/ossan_pero.png");
    tm.graphics.TextureManager.add("usamimi", "resource/ossan_usamimi.png");
    tm.graphics.TextureManager.add("yu-rei", "resource/ossan_yu-rei.png");
    tm.graphics.TextureManager.add("replay", "resource/retry.png");
    tm.graphics.TextureManager.add("to_start", "resource/end.png");
    tm.sound.SoundManager.add("miss_sound", "resource/se_maoudamashii_onepoint06.mp3");
    tm.sound.SoundManager.add("ok_sound", "resource/se_maoudamashii_onepoint15.mp3");
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
        this.time = GAME_TIME;
        this.before_touched_time = 0;
		//初期化
        var oyaji = Oyaji();
        oyaji.gotoAndPlay("furafura_1");
        this.oyajis = [oyaji];
        this.len = this.oyajis.length;
        this.addChild(oyaji);
        this.oyaji_touched_count = 0;
        this.oyaji_increment_list = [1, 5, 10, 20, 40, 70, 80, 100, 0];
        this.misoyaji_probabillity = 10;
        //ミス親父が出現する確率を百分率で。
        var bk = tm.app.Sprite(SCREEN_WIDTH, SCREEN_HEIGHT, "bk-office");
        bk.position.set(SCREEN_CENTER_X, SCREEN_CENTER_Y);
        this.addChild(bk);
		//背景
        this.timerLabel = tm.app.Label(this.time.toString);
        this.timerLabel.position.set(100, 200);
		this.timerLabel.fillStyle = "red";
        //this.addChild(this.timerLabel);
        //タイマーの時間とラベルセット
		this.gauge = tm.app.Gauge(GAUGE_WIDTH, 25, "red", "left");
        this.gauge.position.set(0, 0);
        this.addChild(this.gauge);
		//時間のゲージをセット
        this.score = tm.app.Label('0');
        this.score.position.set(100, 200);
		this.score.fillStyle = "red";
        this.addChild(this.score);
        //スコアラベルのセット
    },
    update: function(app) {
        this.passed_time = (app.frame / app.fps);
		if(this.passed_time > GAME_TIME && this.before_touched_time == 0){
			//リトライ時の時間リセット処理
			this.before_touched_time = this.passed_time;
		}
        this.time =  GAME_TIME - (this.passed_time - this.before_touched_time);
		this.gauge.width = GAUGE_WIDTH/GAME_TIME * this.time;
		//ゲージに反映
        this.add_oyaji();
        if(this.time == 0) {
			gameOver(this);
        }
        if(app.pointing.getPointingStart()) {
            this.target = true;
        }
        if(app.pointing.getPointingEnd() && this.target == true) {
            for(var i=0; i < this.oyajis.length; i++) {
                if(this.oyajis[i].isHitPointRect(app.pointing.x, app.pointing.y)) {
					if(this.oyajis[i].success && !(this.oyajis[i].touched)){
						tm.sound.SoundManager.get("ok_sound").play();
						this.before_touched_time = this.passed_time;
						this.oyaji_touched_count += 1;
						//めがねおやじにタッチした回数をadd
						this.score.text = this.oyaji_touched_count;
						//スコアに反映
						//正解おやじ処理
					}else if(!(this.oyajis[i].success) && !(this.oyajis[i].touched)){
						tm.sound.SoundManager.get("miss_sound").play();
						//ミスおやじ処理
					}
                    this.oyajis[i].drop_megane();
                }
            }
            this.target = false;
        }
        //めがねおやじにタッチしたかを判定している
        for(var i=0; i < this.oyajis.length; i++) {
            var disappear = this.oyajis[i].check_is_out(this);
            if (disappear == true) {
            this.oyajis[i].remove;
            this.oyajis.splice(i, 1);
            var i = Math.floor(Math.random() * 101);
            if (i > this.misoyaji_probabillity) {
                var oyaji = Oyaji();
            }
            else {
                var oyaji = MisOyaji();
                oyaji.set_scene(this);
            }
            oyaji.gotoAndPlay("furafura_1");
            this.oyajis.push(oyaji);
            this.addChild(oyaji);
        }
        }
    },
    add_oyaji: function() {
        if (this.oyaji_touched_count >= this.oyaji_increment_list[0] &&
            this.oyaji_increment_list[0] > 0) {
            this.oyaji_increment_list.shift();
            //先頭の親父数増加タッチ回数を削除
            var oyaji = Oyaji();
            oyaji.gotoAndPlay("furafura_1");
            this.oyajis.push(oyaji);
            this.addChild(oyaji);
            this.misoyaji_probabillity += 10;
                }
    }

});

tm.define("Oyaji", {
    superClass: "tm.app.AnimationSprite",
    init: function(ss) {
        if (!ss) {
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
        }
        this.superInit(201, 240, ss);
        this.set_random_position();
        this.set_speed();
		this.touched = false;
		this.success = true;
    },
    update: function() {
        this.x -= (this.x_speed * this.x_direction);
        this.y -= (this.y_speed * this.y_direction);
    },
    touch_megane: function() {
		this.gotoAndPlay("shakin_aruki");
		this.update = function() {
			this.x -= (this.x_direction * 10);
			this.y -= (this.y_direction * 10);
		}
    },
    drop_megane: function() {
		if(!this.touched){
			this.touched = true;
			this.update = function() {
			};
			this.gotoAndStop("furafura_2");
			var me = this;
			var fnc = function(){
				me.touch_megane();
			}
			this.tweener.wait(500);
			this.tweener.call(fnc);
		}
    },
    check_is_out: function(scene) {
        var disappear = false;
        if (this.x >= SCREEN_WIDTH || this.x <= 0) {
            disappear = true;
            }
        else if (this.y >= SCREEN_HEIGHT || this.y <= 0) {
            disappear = true;
        }
        return disappear
    },
    set_random_position: function() {
        var random_x = Math.floor(Math.random() * (SCREEN_WIDTH - 21));
        var random_y = Math.floor(Math.random() * (SCREEN_HEIGHT - 31));
        var random_x_direction = this.get_random_direction();
        var random_y_direction = this.get_random_direction();
        this.x_direction = random_x_direction;
        this.y_direction = random_y_direction;
        this.scaleX *= random_x_direction;
        this.position.set(random_x, random_y);
    },
    get_random_direction: function() {
        var random_direction = 1 + Math.floor(Math.random() * 2);
        if(random_direction > 1) {
            random_direction = -1;
        }
        return random_direction;
    },
    set_speed: function() {
        this.x_speed = 2 + Math.floor(Math.random() * 7);
        this.y_speed = 2 + Math.floor(Math.random() * 7);
    }

});

tm.define("MisOyaji", {
    superClass: "Oyaji",
    init: function() {
        var i = Math.floor(Math.random() * 7);
        var images = ["bra", "dekame", "go-guru", "gurasan", "pero", "usamimi", "yu-rei"];
        var ss = tm.app.SpriteSheet({
            image: images[i],
            frame:{
                width: SPRITE_WIDTH,
                height: SPRITE_HEIGHT,
                count: 9
            },
        animations: {
            "furafura_1": [0, 2, "furafura_1", 5],
            "furafura_2": [3, 5, "furafura_2", 7],
        }
        });
        this.superInit(ss);
        this.set_random_position();
        this.set_speed();
		this.success = false;
    },
    touch_megane: function() {
        this.gotoAndStop("furafura_2");
        this.update = function() {
        }
        //this.scene.oyaji_touched_count -= 1;
        //正しいめがね親父にタッチしたかの判定がだるいので
        //間違った方をタッチしたときはdecrementすることにした。
        //タッチ出来ないようにする
		gameOver(this.scene);
    },
    set_scene: function(scene) {
        this.scene = scene;
    }
});

function gameOver(scene){
        var game_over = tm.app.Label("GAME OVER");
        game_over.position.set(SCREEN_CENTER_X, 40);
        var replay = tm.app.Sprite(YOROKOBI_WIDTH, YOROKOBI_HEIGHT, "replay");
        replay.position.set(SCREEN_CENTER_X - 200, SCREEN_CENTER_Y);
        var to_start = tm.app.Sprite(ZETUBOU_WIDTH, ZETUBOU_HEIGHT, "to_start");
        to_start.position.set(SCREEN_CENTER_X + 200, SCREEN_CENTER_Y);
        scene.update = function(app) {
            if(app.pointing.getPointingStart()) {
            if(replay.isHitPointRect(app.pointing.x, app.pointing.y)) {
                app.replaceScene(GameScene());
            }

            if(to_start.isHitPointRect(app.pointing.x, app.pointing.y)) {
                app.replaceScene(StartScene());
            }
            }
        };
        scene.addChild(game_over);
        scene.addChild(replay);
        scene.addChild(to_start);
	}
