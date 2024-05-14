class Endgame extends Phaser.Scene {
    constructor() {
        super("Endgame_Scene");
    }

    create() {
        // Add end game message
        this.add.text(
            this.game.config.width / 2, 
            this.game.config.height / 2 - 50, 
            'Good Game!', 
            { fontFamily: 'Arial', fontSize: 40, color: '#ffffff' }
        ).setOrigin(0.5);

        // Display high score
        this.add.text(
            this.game.config.width / 2, 
            this.game.config.height / 2, 
            `High Score: ${this.registry.get('highScore')}`, 
            { fontFamily: 'Arial', fontSize: 20, color: '#ffffff' }
        ).setOrigin(0.5);

        // Add instruction to play again
        this.add.text(
            this.game.config.width / 2, 
            this.game.config.height / 2 + 50, 
            'Press R to play again', 
            { fontFamily: 'Arial', fontSize: 20, color: '#ffffff' }
        ).setOrigin(0.5);

        // Add 'R' key to restart the game
        this.input.keyboard.on('keydown-R', () => {
            // Restart the game by going back to the GalleryShooter scene
            this.scene.start("GalleryShooter_Scene");
        });
    }
}
