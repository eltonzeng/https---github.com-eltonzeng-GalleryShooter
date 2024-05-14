// Define a function for collision detection
function collides(a, b) {
    if (Math.abs(a.x - b.x) > (a.width / 2 + b.width / 2)) return false;
    if (Math.abs(a.y - b.y) > (a.height / 2 + b.height / 2)) return false;
    return true;
}

let flag = false;

class GalleryShooter extends Phaser.Scene {
    constructor() {
        super("GalleryShooter_Scene");
        this.my = {sprite: {}};  // Create an object to hold sprite bindings

        //Create constants for the player location
        this.bodyX = 400;
        this.bodyY = 550;

        // Create constants for enemy location
        this.monstaX = 400;
        this.monstaY = 50;
        
        // Set movement speeds (in pixels/tick)
        this.playerSpeed = 5;
        this.bulletSpeed = 10;

        this.bulletCooldown = 10;        // Number of update() calls to wait before making a new bullet
        this.bulletCooldownCounter = 0;

        this.highScore = 0; // Initialize high score
        this.highScoreText = null; // Reference to the text object

        this.mobTireSpeed = 10;
        this.mobTireCooldown = 10;
        this.mobTireCooldownCounter = 0;
    }

    // Use preload to load art and sound assets before the scene starts running.
    preload() {
        // Assets from Kenny Assets pack "Monster Builder Pack"
        // https://kenney.nl/assets/monster-builder-pack
        this.load.setPath("./assets/");

        // Load sprite atlas
        this.load.atlasXML("Cars", "spritesheet_complete.png", "spritesheet_complete.xml");
        this.load.image('laser', "tile_0044.png");
        this.tire = this.load.image('tire', "tirecopy.png");

        // Load sound effect
        this.load.audio('laserSound', 'laserSmall_000.ogg');

        // update instruction text
        document.getElementById('description').innerHTML = 'A Key: Move Left // D Key: Move Right // R Key: Reset Game'
    }å

    create() {
        let my = this.my;   // create an alias to this.my for readability

        my.sprite.player = this.add.sprite(this.bodyX, this.bodyY, "Cars", "man.png");
        my.mob_1 = this.add.sprite(this.monstaX, this.monstaY, "Cars", "sedan.png");
        my.laser = this.add.sprite(-100, 10, "laser")
        this.laserSound = this.sound.add('laserSound');

        my.sprite.player.setScale(3);
        my.mob_1.setScale(3);

        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        this.nextScene = this.input.keyboard.addKey("S");
        this.resetKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.resetKey.on('down', this.resetLevel, this);
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        my.sprite.bulletGroup = this.add.group({
            defaultKey: "laser",
            maxSize: 10
            }
        )

        my.sprite.tireGroup = this.add.group({
            defaultKey: "tire",
            maxSize: 20
            }
        )

        // Create all of the bullets at once, and set them to inactive
        // Bullet code from JimWhiteheadUCSC
        my.sprite.bulletGroup.createMultiple({
            active: false,
            key: my.sprite.bulletGroup.defaultKey,
            repeat: my.sprite.bulletGroup.maxSize-1
        });

        my.sprite.tireGroup.createMultiple({
            active: false,
            key: my.sprite.tireGroup.defaultKey,
            repeat: my.sprite.tireGroup.maxSize-1
        });

        // Create high score text
        this.highScoreText = this.add.text(
            game.config.width - 10, 
            10, 
            `High Score: ${this.highScore}`, 
            { fontFamily: 'Arial', fontSize: 20, color: '#ffffff' }
        ).setOrigin(1, 0);
    }

    update() {
        let my = this.my;    // create an alias to this.my for readability
        this.bulletCooldownCounter--;
        this.mobTireCooldownCounter--;

        // Moving left
        if (this.left.isDown) {
            // Check to make sure the sprite can actually move left
            if (my.sprite.player.x > (my.sprite.player.displayWidth/2)) {
                my.sprite.player.x -= 5;
            }
        }

        // Moving right
        if (this.right.isDown) {
            // Check to make sure the sprite can actually move right
            if (my.sprite.player.x < (game.config.width - (my.sprite.player.displayWidth/2))) {
                my.sprite.player.x += 5;
            }
        }
        
        // Tire projectile
        if (this.mobTireCooldownCounter < 0) {
            // Get the first inactive bullet, and make it active
            let tire = my.sprite.tireGroup.getFirstDead();
            // bullet will be null if there are no inactive (available) bullets
            if (tire != null) {
                tire.active = true;
                tire.visible = true;
                tire.x = my.mob_1.x;
                tire.y = my.mob_1.y + (my.mob_1.displayHeight/2);
                this.mobTireCooldownCounter = this.mobTireCooldown;
            }
        }

        // Check for bullet being fired
        if (this.space.isDown) {
            if (this.bulletCooldownCounter < 0) {
                // Get the first inactive bullet, and make it active
                let bullet = my.sprite.bulletGroup.getFirstDead();
                // bullet will be null if there are no inactive (available) bullets
                if (bullet != null) {
                    bullet.active = true;
                    bullet.visible = true;
                    bullet.x = my.sprite.player.x;
                    bullet.y = my.sprite.player.y - (my.sprite.player.displayHeight/2);
                    this.bulletCooldownCounter = this.bulletCooldown;
                    this.laserSound.play();
                }
            }
        }

        // check for bullet going offscreen
        for (let bullet of my.sprite.bulletGroup.getChildren()) {
            if (bullet.y < -(bullet.displayHeight/2)) {
                bullet.active = false;
                bullet.visible = false;
            }
        }

        // Function to update high score
        // move bullets
        my.sprite.tireGroup.incY(this.bulletSpeed);
        my.sprite.bulletGroup.incY(-this.bulletSpeed);

        // Collision detection between bullets and enemy
        my.sprite.bulletGroup.getChildren().forEach(bullet => {
            if (bullet.active) {
                if (collides(bullet, my.mob_1)) {
                    // If a bullet hits an enemy
                    bullet.active = false;
                    bullet.visible = false;
                    // destroy it or decrease its health
                    my.mob_1.destroy();
                    flag = true;
                    // Update high score
                    this.updateHighScore();
                }
            }
        });

        if (flag === true) {
            this.scene.start("Endgame_Scene", {highScore: this.highScore });
        }
    }

    resetLevel() {
        // Reset variables to default values
        this.bodyX = 400;
        this.bodyY = 550;
        this.monstaX = 400;
        this.monstaY = 50;
        this.playerSpeed = 5;
        this.bulletSpeed = 10;
        this.bulletCooldown = 10;
        this.highScore = 0;
        this.highScoreText.setText(`High Score: ${this.highScore}`);

        // Respawn the mob sprite
        if (!this.my.mob_1.active) {
            this.my.mob_1 = this.add.sprite(this.monstaX, this.monstaY, "Cars", "sedan.png");
            this.my.mob_1.setScale(3);
        }
    }
    // Function to update high score
    updateHighScore() {
        this.highScore += 100; // Increase high score by 100
        this.highScoreText.setText(`High Score: ${this.highScore}`);
    }
}