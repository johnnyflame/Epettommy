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

    private game_button: button;
    private gest_handle_id: gesture_callback_id;

    // Set up the images, etc
    constructor(private app: ePetTommy) {
        super();

        let tommy = ePetTommy_gfx.loader.get_sprite("tommy", "dead");
        tommy.set_position(80, 80);
        tommy.set_size(160, 160);
        let game_btn = new button(tommy,
            () => this.app.set_scene(
                new tommy_game(this.app, new brick_player()))
        );
        this.add(game_btn);
    }

    // Update the sliders, and the player's state
    update(dt: number) {
        super.update(dt);
    }
    
    init () {
        super.init();
        // Register handler
        this.gest_handle_id = os.add_gesture_handler(
            (e: gesture_type, x: number, y: number) => 
                this.gest_handle(e, x, y)
        );
    }
    
    end () {
        super.end();
        // Remove handler
        os.remove_gesture_handler(this.gest_handle_id);
    }
    
    /**
     * Swipe between scenes
     */
    gest_handle(evt: gesture_type, x: number, y: number) {
        switch (evt) {
        case gesture_type.swipeleft:
                this.app.set_scene(new tommy_stats(this.app));
            break;

        case gesture_type.swiperight:
                this.app.set_scene(new tommy_food(this.app));
            break;
        }
    }

    // finish() the buttons - this is more final then end()
    // which will be called each time we swap to another scene.
    close() {
        this.game_button.finish();
    }
}

class tommy_stats extends scene {
    
    private gest_handle_id: gesture_callback_id;
    
    constructor (private app: ePetTommy) {
        super();
        let img = ePetTommy_gfx.loader.get_sprite("space", "0");
        img.set_position(0, 0);
        img.set_size(os.get_graphics_context().width(), os.get_graphics_context().height());
        this.add(img);
    }
    
    init () {
        super.init();
        // Register handler
        this.gest_handle_id = os.add_gesture_handler(
            (e: gesture_type, x: number, y: number) => 
                this.gest_handle(e, x, y)
        );
    }
    
    end () {
        super.end();
        // Remove handler
        os.remove_gesture_handler(this.gest_handle_id);
    }
    
    /**
     * Swipe between scenes
     */
    gest_handle(evt: gesture_type, x: number, y: number) {
        switch (evt) {
        case gesture_type.swipeleft:
        case gesture_type.swiperight:
                this.app.go_home();
            break;
        }
    }
}

class tommy_food extends scene {
    private gest_handle_id: gesture_callback_id;
        
    constructor (private app: ePetTommy) {
        super();

        let img = ePetTommy_gfx.loader.get_sprite("tablecloth", "0");
        img.set_position(0, 0);
        img.set_size(os.get_graphics_context().width(), os.get_graphics_context().height());
        this.add(img);
        // Salmon
        let feed_sal = ePetTommy_gfx.loader.get_sprite("salmon", "0");
        feed_sal.set_position(10, 10);
        feed_sal.set_size(100, 100);
        let sal_button = new button(feed_sal,
            () => this.app.pet_model.feed(0.2)
        );
        this.add(sal_button);
        // Salad
        let feed_sala = ePetTommy_gfx.loader.get_sprite("salad", "0");
        feed_sala.set_position(210, 10);
        feed_sala.set_size(100, 100);
        let sala_button = new button(feed_sala,
            () => this.app.pet_model.feed(0.2)
        );
        this.add(sala_button);
        // Banana
        let feed_ba = ePetTommy_gfx.loader.get_sprite("banana", "0");
        feed_ba.set_position(110, 110);
        feed_ba.set_size(100, 100);
        let ba_button = new button(feed_ba,
            () => this.app.pet_model.feed(0.2)
        );
        this.add(ba_button);
        // Burger
        let feed_bu = ePetTommy_gfx.loader.get_sprite("burger", "0");
        feed_bu.set_position(10, 210);
        feed_bu.set_size(100, 100);
        let bu_button = new button(feed_bu,
            () => this.app.pet_model.feed(0.2)
        );
        this.add(bu_button);
        // Pork Rice
        let feed_pr = ePetTommy_gfx.loader.get_sprite("porkrice", "0");
        feed_pr.set_position(210, 210);
        feed_pr.set_size(100, 100);
        let pr_button = new button(feed_pr,
            () => this.app.pet_model.feed(0.2)
        );
        this.add(pr_button);
    }
    
    init () {
        super.init();
        // Register handler
        this.gest_handle_id = os.add_gesture_handler(
            (e: gesture_type, x: number, y: number) => 
                this.gest_handle(e, x, y)
        );
    }
    
    end () {
        super.end();
        // Remove handler
        os.remove_gesture_handler(this.gest_handle_id);
    }
    
    /**
     * Swipe between scenes
     */
    gest_handle(evt: gesture_type, x: number, y: number) {
        switch (evt) {
        case gesture_type.swipeleft:
        case gesture_type.swiperight:
                this.app.go_home();
            break;
        }
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
                "tommy": {
                    src: "prototype/resources/allPetStates.png",
                    regions: {
                        "excited": { x: 6, y: 4, w: 190, h: 195 },
                        "happy": { x: 203, y: 4, w: 190, h: 195 },
                        "shock": { x: 401, y: 4, w: 190, h: 195 },
                        "sad": { x: 603, y: 4, w: 190, h: 195 },
                        "sick": { x: 1, y: 210, w: 190, h: 195 },
                        "dead": { x: 203, y: 210, w: 190, h: 195 }
                    }
                },
                "grass_platform": {
                    src: "prototype/resources/grassDirtPlatform.png",
                    regions: {
                        "0": { x: 0, y: 140, w: 129, h: 64 }
                    }
                },
                "salad": {
                    src: "prototype/resources/salad.png",
                    regions: {
                        "0": { x: 0, y: 0, w: 120, h: 120 }
                    }
                },
                "salmon": {
                    src: "prototype/resources/salmon.png",
                    regions: {
                        "0": { x: 0, y: 0, w: 120, h: 120 }
                    }
                },
                "porkrice": {
                    src: "prototype/resources/PorkRice.png",
                    regions: {
                        "0": { x: 0, y: 0, w: 120, h: 120 }
                    }
                },
                "banana": {
                    src: "prototype/resources/banana.png",
                    regions: {
                        "0": { x: 0, y: 0, w: 120, h: 120 }
                    }
                },
                "burger": {
                    src: "prototype/resources/burger.png",
                    regions: {
                        "0": { x: 0, y: 0, w: 120, h: 120 }
                    }
                },
                "tablecloth": {
                    src: "prototype/resources/tablecloth.png",
                    regions: {
                        "0": { x: 0, y: 0, w: 320, h: 320 }
                    }
                },
                "space": {
                    src: "prototype/resources/space.png",
                    regions: {
                        "0": { x: 0, y: 0, w: 320, h: 320 }
                    }
                },                
            });

    }

}


// Make and register application
(new ePetTommy());
