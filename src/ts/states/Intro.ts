/// <reference path="State.ts" />

var loreText = [
    // Image #1
    [
        'Long ago, in the beautiful',
        'kingdom of Hyrule surrounded',
        'by mountains and forests...'
    ].join('\n'),
    //pause
    [
        'legends told of an omnipotent',
        'and omniscient Golden Power',
        'that resided in a hidden land.'
    ].join('\n'),
    // pause, Image #2
    [
        'Many people aggressively',
        'sought to enter the hidden',
        'Golden Land...'
    ].join('\n'),
    //pause
    [
        'But no one ever returned.',
        'One day evil power began to',
        'flow from the Golden Land...'
    ].join('\n'),
    //pause
    [
        'So the King commanded seven',
        'wise men to seal the gate to',
        'the Land of the Golden Power.'
    ].join('\n'),
    // pause, Image #3
    [
        'That seal should have remained',
        'for all time...',
        ' '
    ].join('\n'),
    // pause, Image #4
    [
        '... ...But, when these events',
        'were obscured by the mists of',
        'time and became legend...'
    ].join('\n')
];

module Lttp.States {
    export class Intro extends State {

        introMusic: Phaser.Sound;
        loreMusic: Phaser.Sound;
        dingSound: Phaser.Sound;

        // intro group sprites
        introGroup: Phaser.Group;
        intro: Phaser.Sprite;
        background: Phaser.Sprite;
        title: Phaser.Sprite;
        sword: Phaser.Sprite;
        zpart: Phaser.Sprite;
        shine: Phaser.Sprite;
        sparkle: Phaser.Sprite;

        // lore group sprites
        loreGroup: Phaser.Group;
        loreBg1: Phaser.TileSprite;
        loreBg2: Phaser.TileSprite;
        loreImg1: Phaser.Sprite;
        loreImg2: Phaser.Sprite;
        loreImg3: Phaser.Sprite;
        loreImg4: Phaser.Sprite;
        loreHighlight: Phaser.Graphics;
        loreDialog: Gui.Dialog;

        // minimap sprites
        mapGroup: Phaser.Group;

        minimap: Phaser.Plugin.Tiled.Tilemap;
        minimapLayer: Phaser.Plugin.Tiled.Tilelayer;

        thronemap: Phaser.Plugin.Tiled.Tilemap;
        thronemapLayer: Phaser.Plugin.Tiled.Tilelayer;

        sparkling: boolean;

        count: number = 0;

        preload() {
            super.preload();

            this.load.pack('lw_minimap', Data.Constants.ASSET_TILEMAP_PACKS_URL);
        }

        create() {
            super.create();

            this.introMusic = this.add.audio('music_title', Data.Constants.AUDIO_MUSIC_VOLUME);
            this.loreMusic = this.add.audio('music_lore', Data.Constants.AUDIO_MUSIC_VOLUME);
            this.dingSound = this.add.audio('effect_menu_select', Data.Constants.AUDIO_EFFECT_VOLUME);

            this._createIntroGroup();
            this._createLoreGroup();
            this._createMapGroup();

            this.startIntroAnimation();
        }

        update() {
            super.update();

            if (this.input.keyboard.isDown(Phaser.Keyboard.ENTER) ||
                this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) ||
                this.input.gamepad.isDown(Phaser.Gamepad.XBOX360_A) ||
                this.input.gamepad.isDown(Phaser.Gamepad.XBOX360_B)
            ) {
                this.skip();
            }

            this.count++;
            if (this.loreGroup.visible && (this.count % 4) === 0) {

                this.loreBg1.tilePosition.x += 1;
                this.loreBg1.tilePosition.y -= 1;

                this.loreBg2.tilePosition.x -= 1;
                this.loreBg2.tilePosition.y -= 1;
            }
        }

        startIntroAnimation() {
            this.introGroup.visible = true;
            this.introGroup.alpha = 1;
            this.loreGroup.visible = false;
            this.mapGroup.visible = false;

            this.title.alpha = 0;
            this.sparkle.visible = false;
            this.shine.visible = false;
            this.zpart.visible = false;

            this.sword.y = -130;
            this.shine.y = 85;

            this.camera.x = this.camera.y = 0;

            this.intro.alpha = 1;

            this.intro.animations.play('intro');

            this.introMusic.play().onStop.addOnce(function () {
                // after music stops playing (there is silence padding on either side) fade to lore screen
                this.game.add.tween(this.introGroup)
                    .to({ alpha: 0 }, 500)
                    .start()
                    .onComplete.addOnce(function () {
                        this.sparkling = false;
                        this.startLoreAnimation();
                    }, this);
            }, this);

            // When the intro completes
            this.intro.events.onAnimationComplete.addOnce(function () {
                this.sparkling = true;
                Game.timer.add(500, this.showSparkle, this);

                //Fade in the title
                this.game.add.tween(this.title)
                    .to({ alpha: 1 }, 2500)
                    .start()
                    .onComplete.addOnce(function () {
                        this.zpart.visible = true;

                        this.dingSound.play();

                        //drop the sword animation
                        this.game.add.tween(this.sword)
                            .to({ y: 38 }, 200)
                            .start()
                            .onComplete.addOnce(function () {
                                // blink the screen
                                this.blink(3, function () {
                                    //Fade out the intro
                                    this.game.add.tween(this.intro)
                                        .to({ alpha: 0 }, 500)
                                        .start()
                                        .onComplete.addOnce(function () {
                                            // show the sword shine
                                            this.shine.visible = true;
                                            this.game.add.tween(this.shine)
                                                .to({ y: 150 }, 250)
                                                .start()
                                                .onComplete.addOnce(function () {
                                                    this.shine.visible = false;
                                                }, this);
                                        }, this);
                                });
                            }, this);
                    }, this);
            }, this);
        }

        startLoreAnimation() {
            this.introGroup.visible = false;
            this.loreGroup.visible = true;
            this.mapGroup.visible = false;

            this.camera.x = this.camera.y = 0;

            this.loreDialog.font.text = '';

            this.loreImg1.alpha = 0;
            this.loreImg2.alpha = 0;
            this.loreImg3.alpha = 0;
            this.loreImg4.alpha = 0;

            this.loreMusic.play();

            this.game.add.tween(this.loreGroup)
                .to({ alpha: 1 }, 500)
                .start()
                .onComplete.addOnce(function () {
                    this._showLoreSequence(0, function () {
                        this.game.add.tween(this.loreGroup)
                            .to({ alpha: 0 }, 500)
                            .start()
                            .onComplete.addOnce(function () {
                                this.startMinimapFlythrough();
                            }, this);
                    });
                }, this);
        }

        startMinimapFlythrough() {
            this.introGroup.visible = false;
            this.loreGroup.visible = false;
            this.mapGroup.visible = true;
            this.mapGroup.alpha = 1;

            var diff = 128 * Data.Constants.GAME_SCALE,
                maxScale = 65;

            this.mapGroup.scale.set(1, 1);
            this.mapGroup.position.set(0, 0);

            this.camera.x = this.camera.y = diff;

            this.game.add.tween(this.mapGroup)
                .to({ alpha: 1 }, 500)
                .start()
                .onComplete.addOnce(function () {
                    this.game.add.tween(this.mapGroup.scale)
                        .to({ x: maxScale, y: maxScale }, 5000, Phaser.Easing.Exponential.In)
                        .start();

                    this.game.add.tween(this.mapGroup.position)
                        .to({ x: -252 * maxScale, y: -234 * maxScale }, 5000, Phaser.Easing.Exponential.In)
                        .start();

                    this.game.add.tween(this.mapGroup)
                        .to({ alpha: 0 }, 1000)
                        .delay(4000)
                        .start()
                        .onComplete.addOnce(function () {
                            Game.timer.add(1000, function () {
                                this.startIntroAnimation();
                            }, this);
                        }, this);
                }, this);
        }

        skip() {
            this.game.state.start('state_mainmenu', true, false);
        }

        showSparkle(p?: number) {
            p = (p || 0) % 4;

            if (!this.sparkling) {
                return;
            }

            var sp = this.sparkle;

            sp.visible = true;

            switch(p) {
                case 0: //Z sparkle
                    sp.x = 55;
                    sp.y = 93;
                    break;

                case 1: //A sparkle
                    sp.x = 197;
                    sp.y = 128;
                    break;

                case 2: //D sparkle
                    sp.x = 154;
                    sp.y = 88;
                    break;

                case 3: //E sparkle
                    sp.x = 113;
                    sp.y = 128;
                    break;
            }

            sp.play('sparkle').onComplete.addOnce(function() {
                sp.visible = false;

                Game.timer.add(180, this.showSparkle, this, ++p);
            }, this);
        }

        blink(num: number, cb?: Function) {
            if (num === 0) {
                return cb && cb.call(this);
            }

            num--;

            var self = this,
                effects = this.game.effects;

            effects.flashScreen('red', Data.Constants.EFFECT_INTRO_FLASH_LENGTH, Data.Constants.EFFECT_INTRO_FLASH_ALPHA).onComplete.addOnce(function () {
                effects.flashScreen('green', Data.Constants.EFFECT_INTRO_FLASH_LENGTH, Data.Constants.EFFECT_INTRO_FLASH_ALPHA).onComplete.addOnce(function () {
                    effects.flashScreen('blue', Data.Constants.EFFECT_INTRO_FLASH_LENGTH, Data.Constants.EFFECT_INTRO_FLASH_ALPHA).onComplete.addOnce(function () {
                        self.blink(num, cb);
                    });
                });
            });
        }

        private _showLoreSequence(seq, cb) {
            switch(seq) {
                case 0:
                    if (this.loreImg1.alpha !== 1) {
                        this.game.add.tween(this.loreImg1)
                            .to({ alpha: 1 }, 500)
                            .start()
                            .onComplete.addOnce(function () {
                                this._showLoreSequence(seq, cb);
                            }, this);

                        return;
                    }
                    break;

                case 2:
                    if (this._switchLoreImages(this.loreImg1, this.loreImg2, seq, cb)) {
                        return;
                    }
                    break;

                case 5:
                    if (this._switchLoreImages(this.loreImg2, this.loreImg3, seq, cb)) {
                        return;
                    }
                    break;

                case 6:
                    if (this._switchLoreImages(this.loreImg3, this.loreImg4, seq, cb)) {
                        return;
                    }
                    break;

                case 7:
                    if(cb) cb.call(this);
                    return;
            }

            if (seq === 0) {
                this.loreDialog.show(loreText[seq], null, false, false).onTypingComplete.addOnce(function () {
                    Game.timer.add(4000, this._showLoreSequence, this, ++seq, cb);
                }, this);
            }
            else {
                this.loreDialog.append(loreText[seq], false).onTypingComplete.addOnce(function () {
                    Game.timer.add(4000, this._showLoreSequence, this, ++seq, cb);
                }, this);
            }
        }

        private _switchLoreImages(fromImg, toImg, seq, cb) {
            if (toImg.alpha !== 1) {
                this.game.add.tween(fromImg)
                    .to({ alpha: 0 }, 500)
                    .start()
                    .onComplete.addOnce(function () {
                        this.game.add.tween(toImg)
                            .to({ alpha: 1 }, 500)
                            .start()
                            .onComplete.addOnce(function () {
                                this._showLoreSequence(seq, cb);
                            }, this);
                    }, this);

                return true;
            }

            return false;
        }

        private _createIntroGroup() {
            this.introGroup = this.add.group(undefined, 'intro');
            this.introGroup.visible = false;

            this.background = this.add.sprite(0, 0, 'sprite_intro', 'background.png', this.introGroup);
            this.background.name = 'background';

            this.intro = this.add.sprite(0, 0, 'sprite_intro', null, this.introGroup);
            this.intro.name = 'intro';

            var frames = [];

            for(var i = 3; i < 278; ++i) {
                var s = i.toString();
                while(s.length < 5) { s = '0' + s; }

                frames.push('Zelda - A Link to the Past_' + s + '.png');
            }
            this.intro.animations.add('intro', frames, 30, false, false);

            this.title = this.add.sprite(0, 0, 'sprite_intro', 'logo.png', this.introGroup);
            this.title.name = 'title';

            this.sword = this.add.sprite(56, -130, 'sprite_intro', 'sword.png', this.introGroup);
            this.sword.name = 'sword';

            this.shine = this.add.sprite(68, 85, 'sprite_particles', 'swordshine/shine.png', this.introGroup);
            this.shine.name = 'shine';

            this.zpart = this.add.sprite(53, 86, 'sprite_intro', 'zpart.png', this.introGroup);
            this.zpart.name = 'zpart';

            this.sparkle = this.add.sprite(0, 0, 'sprite_particles', null, this.introGroup);
            this.sparkle.name = 'sparkle';
            this.sparkle.anchor.set(0.5, 0.5);
            this.sparkle.animations.add('sparkle', [
                'sparkle/0.png',
                'sparkle/1.png',
                'sparkle/2.png',
                'sparkle/3.png',
                'sparkle/4.png',
                'sparkle/5.png'
            ], 17, false, false);
        }

        private _createLoreGroup() {
            this.loreGroup = this.add.group(undefined, 'lore');
            this.loreGroup.visible = false;
            this.loreGroup.alpha = 0;

            this.loreBg1 = this.add.tileSprite(0, 0, Data.Constants.GAME_WIDTH, Data.Constants.GAME_HEIGHT, 'image_lore_bg1', null, this.loreGroup);
            this.loreBg1.generateTilingTexture(); // works around a bug in pixi v2.2.7
            this.loreBg1.name = 'background1';

            this.loreBg2 = this.add.tileSprite(0, 0, Data.Constants.GAME_WIDTH, Data.Constants.GAME_HEIGHT, 'image_lore_bg2', null, this.loreGroup);
            this.loreBg2.generateTilingTexture(); // works around a bug in pixi v2.2.7
            this.loreBg2.name = 'background2';

            this.loreHighlight = this.add.graphics(0, 0, this.loreGroup);
            this.loreHighlight.name = 'highlight';
            this.loreHighlight.beginFill(0xFFFF00, 0.12);

            //top
            this.loreHighlight.drawRect(24, 32, 200, 40);

            //right
            this.loreHighlight.drawRect(214, 72, 10, 48);

            //bottom
            this.loreHighlight.drawRect(24, 120, 200, 72);

            //left
            this.loreHighlight.drawRect(24, 72, 26, 48);

            this.loreHighlight.endFill();

            this.loreImg1 = this.add.sprite(42, 66, 'sprite_intro', 'lore_img1.png', this.loreGroup);
            this.loreImg1.name = 'image1';
            this.loreImg1.alpha = 0;

            this.loreImg2 = this.add.sprite(42, 66, 'sprite_intro', 'lore_img2.png', this.loreGroup);
            this.loreImg2.name = 'image2';
            this.loreImg2.alpha = 0;

            this.loreImg3 = this.add.sprite(42, 66, 'sprite_intro', 'lore_img3.png', this.loreGroup);
            this.loreImg3.name = 'image3';
            this.loreImg3.alpha = 0;

            this.loreImg4 = this.add.sprite(42, 66, 'sprite_intro', 'lore_img4.png', this.loreGroup);
            this.loreImg4.name = 'image4';
            this.loreImg4.alpha = 0;

            this.loreDialog = new Gui.Dialog(game, this.loreGroup, false);
            this.loreDialog.name = 'dialog';
            this.loreDialog.position.set(34, 124);
        }

        private _createMapGroup() {
            this.mapGroup = this.add.group(undefined, 'map');
            this.mapGroup.visible = false;
            this.mapGroup.alpha = 0;

            this.minimap = this.add.tiledmap('lw_minimap');
            this.mapGroup.add(this.minimap);
        }

    }
}
