/*
 * The main application for the prototype
 */


class ePetTommy extends application {

    tommy_image: any; // Tommy Sprite sheet
    private main_scene: tommy_home; // Main scene
    pet_model: tommy_model; // model of pet

    constructor() {
        super(); // Appeal to parent class --- we must
        this.register_with_os("ePetTommy", os); // Register the application with the os
        new ePetTommy_gfx(); // Load graphics
    }

    init() {
        this.main_scene = new tommy_home(this);
        this.pet_model = new tommy_model();
        this.current_scene = this.main_scene;
        super.init();
    }

    // Tell the application and scenes that it is time to stop.
    quit() {
        super.quit();
        this.main_scene.close();
    }

    // Set the scene to the main/home scene
    go_home() {
        this.set_scene(this.main_scene);
    }
}

/* 
 * The main scene for interacting with the pet.
 */
class tommy_home extends scene {

    private feed_button: button;
    private game_button: button;
    private default_feed = 0.2;

    // Set up the images, etc
    constructor(private app: ePetTommy) {
        super();

        let feed_placeholder = new rect("#777700", "#007777");
        feed_placeholder.set_position(2, 2);
        feed_placeholder.set_size(40, 40);
        // Connect Feed button to model
        this.feed_button = new button(feed_placeholder,
            () => this.app.pet_model.feed(this.default_feed)
        );
        // Add this to the scene
        this.add(this.feed_button);

        let tommy = ePetTommy_gfx.loader.get_sprite("tommy", "happy");
        tommy.set_position(30, 30);
        tommy.set_size(100, 100);
        let game_btn = new button(tommy,
            () => this.app.set_scene(
                new tommy_game(this.app, new brick_player()))
        );
        this.add(game_btn);
    }

    // Update all the sliders, and the player's state
    update(dt: number) {
        super.update(dt);
    }

    // finish() the buttons - this is more final then end()
    // which will be called each time we swap to another scene.
    close() {
        this.feed_button.finish();
        this.game_button.finish();
    }
}

/*
 * Scene for playing the game.
 */
class tommy_game extends scene {
    private platform: sprite;
    private background: sprite;
    private player: game_player;
    private engine: game_physics;

    // Set up the images, etc
    constructor(private app: ePetTommy, private opponent: game_player) {
        super();
        // Add background first so it is drawn first

        // Add platform below players
        this.platform = ePetTommy_gfx.loader
            .get_sprite("grass_platform", "0");
        this.platform.set_size(200, 100);
        this.platform.set_position(50, 200);
        this.add(this.platform);

        // Get the player interface
        this.player = app.pet_model.generate_push_player();
        // Add the player's actor to the display
        this.add(this.player.actor);

        // same for opponent
        this.add(this.opponent.actor);
        
        // Need to resize, and position these actors. They should have no parent
        // TODO: improve - remove magic numbers
        this.player.actor.set_size(30, 30);
        this.opponent.actor.set_size(30, 30);
        this.player.actor.set_position(100, 170);
        this.opponent.actor.set_position(200, 170);
        
        // Give the players access to this game scene
        this.player.parent = this;
        this.opponent.parent = this;

        this.engine = new game_physics ();
    }
    
    update (dt: number) {
        super.update(dt);
        let result = this.engine.update(this.player, this.opponent);
        if (result) {
            // Game is over.
            this.app.go_home();
            // TODO: Game over/congrats display, stats update on model.
        }
    }

}


class ePetTommy_gfx {
    public static loader: image_loader;

    constructor() {
        ePetTommy_gfx.loader = new image_loader(
            {
                "background": {
                    src: "prototype/resources/background.png",
                    regions: { "all": { x: 0, y: 0, w: 320, h: 320 } }
                },
                "tommy": {
                    src: "prototype/resources/slime.png",
                    regions: {
                        "happy": { x: 0, y: 0, w: 95, h: 95 },
                        "face2": { x: 95, y: 0, w: 95, h: 95 }
                    }
                },
                "grass_platform": {
                    src: "prototype/resources/grassDirtPlatform.png",
                    regions: {
                        "0": { x: 0, y: 140, w: 129, h: 64 }
                    }
                }
            });

    }

}


// Make and register application
(new ePetTommy());
