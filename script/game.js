(function () {
    // Constructor function
    const Game = function (gameId) {
        let canvas = document.getElementById(gameId);
        let screen = canvas.getContext('2d');
        let gameSize = {x: canvas.width, y: canvas.height};

        this.boddies = createInvaders(this).concat(new Player(this, gameSize));

        let self = this;
        loadSound("http://commondatastorage.googleapis.com/codeskulptor-assets/Collision8-Bit.ogg", function(shootSound){
            self.shootSound = shootSound;
            const tick = function () {
                self.update();
                self.draw(screen, gameSize);
                requestAnimationFrame(tick);
            };
            tick();
        });
    };

    Game.prototype = {
        update: function () {
            let boddies = this.boddies;
            let notCollidingWithAnything = function (b1) {
                return boddies.filter(function (b2) {
                    return colliding(b1, b2);
                }).length === 0;
            };

            this.boddies = this.boddies.filter(notCollidingWithAnything);

            for (let i = 0; i < this.boddies.length; i++) {
                this.boddies[i].update();
            }
        },
        draw: function (screen, gameSize) {
            screen.clearRect(0, 0, gameSize.x, gameSize.y);
            for (let i = 0; i < this.boddies.length; i++) {
                drawRect(screen, this.boddies[i]);
            }
        },
        addBody: function (body) {
            this.boddies.push(body);
        },

        invaderBelow: function (invader) {
            return this.boddies.filter(function (b) {
                return b instanceof Invader &&
                    b.center.y > invader.center.y &&
                    b.center.x - invader.center.x < invader.size.x;
            }).length > 0;
        }
    };

    const drawRect = function (screen, body) {
        screen.fillRect(body.center.x - body.size.x / 2,
            body.center.y - body.size.y / 2,
            body.size.x, body.size.y);
    };

    const Player = function (game, gameSize) {
        this.game = game;
        this.size = {x: 15, y: 15};
        this.center = {x: gameSize.x / 2, y: gameSize.y - this.size.x};
        this.keyboarder = new keyboarder();
    };

    Player.prototype = {
        update: function () {
            if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)) {
                this.center.x -= 2;
            } else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)) {
                this.center.x += 2;
            }

            if (this.keyboarder.isDown(this.keyboarder.KEYS.SPACE)) {
                this.center.x += 2;
                let bullet = new Bullet({
                        x: this.center.x,
                        y: this.center.y - this.size.x * 2
                    },
                    {x: 0, y: -6});
                this.game.addBody(bullet);
                this.game.shootSound.load();
                this.game.shootSound.play();
            }
        }
    };

    const Bullet = function (center, velocity) {
        this.size = {x: 3, y: 3};
        this.center = center;
        this.velocity = velocity;
    };

    Bullet.prototype = {
        update: function () {
            this.center.x += this.velocity.x;
            this.center.y += this.velocity.y;
        }
    };


    const Invader = function (game, center) {
        this.game = game;
        this.size = {x: 15, y: 15};
        this.center = center;
        this.patrolX = 0;
        this.speedX = 0.3;
    };

    Invader.prototype = {
        update: function () {
            if (this.patrolX < 0 || this.patrolX > 40) {
                this.speedX -= this.speedX;
            }

            this.center.x += this.speedX;
            this.patrolX += this.speedX;

            if (Math.random() > 0.995 && !this.game.invaderBelow(this)) {
                let bullet = new Bullet({
                        x: this.center.x,
                        y: this.center.y - this.size.x * 2
                    },
                    {x: Math.random() - 0.5, y: 2});
                this.game.addBody(bullet);
            }
        }
    };

    const createInvaders = function (game) {
        let invaders = [];
        for (let i = 0; i < 24; i++) {
            let x = 30 + (i % 8) * 30;
            let y = 30 + (i % 3) * 30;
            invaders.push(new Invader(game, {x: x, y: y}))
        }
        return invaders;
    };

    const keyboarder = function () {
        let keyState = {};

        window.onkeydown = function (e) {
            keyState[e.keyCode] = true;
        };

        window.onkeyup = function (e) {
            keyState[e.keyCode] = false;
        };

        this.isDown = function (keyCode) {
            return keyState[keyCode] === true;
        };

        this.KEYS = {LEFT: 37, RIGHT: 39, SPACE: 32};
    };

    const colliding = function (b1, b2) {
        return !(b1 === b2 ||
            b1.center.x + b1.size.x / 2 < b2.center.x - b2.size.x / 2 ||
            b1.center.y + b1.size.y / 2 < b2.center.y - b2.size.y / 2 ||
            b1.center.x - b1.size.x / 2 > b2.center.x + b2.size.x / 2 ||
            b1.center.y - b1.size.y / 2 > b2.center.y + b2.size.y / 2);
    };

    const loadSound = function (url, callback) {
        let loaded = function () {
            callback(sound);
            sound.removeEventListener("canplaythrough", loaded);
        };

        let sound = new Audio(url);
        sound.addEventListener("canplaythrough", loaded);
        sound.load();

    }

    window.onload = function () {
        new Game("ball_reducer");
    };
})();
