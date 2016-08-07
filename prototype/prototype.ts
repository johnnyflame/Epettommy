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

    private gest_handle_id: gesture_callback_id;
    private tommy_slider: animator;
    
    private img_happy = 0; 
    private img_excited = 1; 
    private img_shock = 2; 
    private img_sad = 3; 
    private img_sick = 4; 
    private img_dead = 5;
    
    private barwidth = 200;
    
    private health: rect;
    private hunger: rect;

    // Set up the images, etc
    constructor(private app: ePetTommy) {
        super();

        this.tommy_slider = new animator(0);
        this.tommy_slider.add(ePetTommy_gfx.loader.get_sprite("tommy", "happy"));
        this.tommy_slider.add(ePetTommy_gfx.loader.get_sprite("tommy", "excited"));
        this.tommy_slider.add(ePetTommy_gfx.loader.get_sprite("tommy", "shock"));
        this.tommy_slider.add(ePetTommy_gfx.loader.get_sprite("tommy", "sad"));
        this.tommy_slider.add(ePetTommy_gfx.loader.get_sprite("tommy", "sick"));
        this.tommy_slider.add(ePetTommy_gfx.loader.get_sprite("tommy", "dead"));
        
        let w = os.get_graphics_context().width();
        let h = os.get_graphics_context().height();
        let left_carret = ePetTommy_gfx.loader.get_sprite("carret", "left");
        left_carret.set_size(40, 40);
        left_carret.set_position(0, (h - left_carret.height) / 2);
        this.add(left_carret);
        
        let right_carret = ePetTommy_gfx.loader.get_sprite("carret", "right");
        right_carret.set_size(40, 40);
        right_carret.set_position((w - right_carret.width),  (h - left_carret.height) / 2);
        this.add(right_carret);
        
        let top_carret = ePetTommy_gfx.loader.get_sprite("carret", "up");
        top_carret.set_size(40, 40);
        top_carret.set_position((w - right_carret.width) / 2,  0);
        this.add(top_carret);
                
        let food_label = new label("Feed", "10px sans-serif");
        food_label.set_position(0, (h - left_carret.height) / 2);
        this.add(food_label);
        
        let stat_label = new label("Stats", "10px sans-serif");
        stat_label.set_position((w - right_carret.width),  (h - left_carret.height) / 2);
        this.add(stat_label);
        
        let game_label = new label("Play", "10px sans-serif");
        game_label.set_position((w - right_carret.width) / 2,  50);
        this.add(game_label);
        
        this.tommy_slider.set_position(80, 80);
        this.tommy_slider.set_size(160, 160);
        this.add(this.tommy_slider);
        
        this.health = new rect("#FF0000", "none");
        this.hunger = new rect("#00FF00", "none");
        
        this.add(this.health);
        this.add(this.hunger);
        
        let hoff = (os.get_graphics_context().width() - this.barwidth) / 2;
        this.health.set_position(hoff, 250);
        this.hunger.set_position(hoff, 250 + 10);
    }

    // Update the sliders, and the player's state
    update(dt: number) {
        super.update(dt);
        let model = this.app.pet_model;
        model.update(dt);
        
        if (model.get_health() <= 0) {
            this.tommy_slider.set_frame(this.img_dead);
        } else if (model.get_health() <= 0.2 || model.get_hunger() > 1) {   
            this.tommy_slider.set_frame(this.img_sick);
        } else if (model.get_emotion() <= 0.2) {
            this.tommy_slider.set_frame(this.img_sad);
        } else if (model.get_emotion() < 0.5) {
            this.tommy_slider.set_frame(this.img_shock);
        } else if (model.get_emotion() >= 0.8) {
            this.tommy_slider.set_frame(this.img_excited);
        } else {
             this.tommy_slider.set_frame(this.img_happy);
        }

        this.health.set_size(this.barwidth * this.app.pet_model.get_health(), 10);
        this.hunger.set_size(this.barwidth * this.app.pet_model.get_hunger(), 10);
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
        case gesture_type.swipedown:
                this.app.set_scene(
                    new tommy_game(this.app, new ai_player()));
            break;
        }
    }

}

class tommy_stats extends scene {
    
    private gest_handle_id: gesture_callback_id;
    
    private health: rect;
    private hunger: rect;
    private strength: rect;
    private emotion: rect;
    
    private barheight = 30;
    private barwidth = 200;
    
    constructor (private app: ePetTommy) {
        super();
        let img = ePetTommy_gfx.loader.get_sprite("space", "0");
        img.set_position(0, 0);
        img.set_size(os.get_graphics_context().width(), os.get_graphics_context().height());
        this.add(img);
        
        this.health = new rect("#FF0000", "none");
        this.hunger = new rect("#00FF00", "none");
        this.strength = new rect("#00FFFF", "none");
        this.emotion = new rect("#FFFF00", "none");
        
        let vpad = (os.get_graphics_context().height() - 4 * this.barheight) / 5;
        let hpad = (os.get_graphics_context().width() - this.barwidth) / 2;
        let tpad = 20;
        
        this.health.set_position(hpad, vpad);
        this.hunger.set_position(hpad, (vpad + this.barheight) + vpad);
        this.strength.set_position(hpad, (vpad + this.barheight) * 2 + vpad);
        this.emotion.set_position(hpad, (vpad + this.barheight) * 3 + vpad);
        
        this.add(this.health);
        this.add(this.hunger);
        this.add(this.strength);
        this.add(this.emotion);

        let text = new label ("Health", "10px sans-serif", "#FFFFFF", "right");
        text.set_position(hpad, vpad + tpad);
        this.add(text);
        text = new label ("Hunger", "10px sans-serif", "#FFFFFF", "right");
        text.set_position(hpad, (vpad + this.barheight) + vpad + tpad);
        this.add(text);
        text = new label ("Strength", "10px sans-serif", "#FFFFFF", "right");
        text.set_position(hpad, (vpad + this.barheight) * 2 + vpad + tpad);
        this.add(text);
        text = new label ("Emotion", "10px sans-serif", "#FFFFFF", "right");
        text.set_position(hpad, (vpad + this.barheight) * 3 + vpad + tpad);
        this.add(text);
        
        let w = os.get_graphics_context().width();
        let h = os.get_graphics_context().height();
        let left_carret = ePetTommy_gfx.loader.get_sprite("carret", "left");
        left_carret.set_size(40, 40);
        left_carret.set_position(0, (h - left_carret.height) / 2);
        this.add(left_carret);
        
        let right_carret = ePetTommy_gfx.loader.get_sprite("carret", "right");
        right_carret.set_size(40, 40);
        right_carret.set_position((w - right_carret.width),  (h - left_carret.height) / 2);
        this.add(right_carret);
    }
    
    init () {
        super.init();
        // Register handler
        this.gest_handle_id = os.add_gesture_handler(
            (e: gesture_type, x: number, y: number) => 
                this.gest_handle(e, x, y)
        );
    }
    
    update () {
        this.health.set_size(this.barwidth * this.app.pet_model.get_health(), this.barheight);
        this.hunger.set_size(this.barwidth * this.app.pet_model.get_hunger(), this.barheight);
        this.strength.set_size(this.barwidth * this.app.pet_model.get_strength(), this.barheight);
        this.emotion.set_size(this.barwidth * this.app.pet_model.get_emotion(), this.barheight);
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
    private buttons: button[] = [];
        
    constructor (private app: ePetTommy) {
        super();

        // Graphics sizes
        let img_size  = 100;
        let outer_padding = 10;
        
        let img = ePetTommy_gfx.loader.get_sprite("tablecloth", "0");
        img.set_position(0, 0);
        img.set_size(os.get_graphics_context().width(), os.get_graphics_context().height());
        this.add(img);
        // Salmon
        let feed_sal = ePetTommy_gfx.loader.get_sprite("salmon", "0");
        feed_sal.set_position(outer_padding, outer_padding);
        feed_sal.set_size(img_size, img_size);
        let sal_button = new button(feed_sal,
            () => {this.app.pet_model.feed(0.2); this.app.go_home(); }
        );
        this.add(sal_button);
        this.buttons.push(sal_button);
        // Salad
        let feed_sala = ePetTommy_gfx.loader.get_sprite("salad", "0");
        feed_sala.set_position(2 * img_size + outer_padding, outer_padding);
        feed_sala.set_size(img_size, img_size);
        let sala_button = new button(feed_sala,
            () => {this.app.pet_model.feed(0.2); this.app.go_home(); }
        );
        this.add(sala_button);
        this.buttons.push(sala_button);
        // Banana
        let feed_ba = ePetTommy_gfx.loader.get_sprite("banana", "0");
        feed_ba.set_position(img_size + outer_padding, img_size + outer_padding);
        feed_ba.set_size(img_size, img_size);
        let ba_button = new button(feed_ba,
            () => {this.app.pet_model.feed(0.1); this.app.go_home(); }
        );
        this.add(ba_button);
        this.buttons.push(ba_button);
        // Burger
        let feed_bu = ePetTommy_gfx.loader.get_sprite("burger", "0");
        feed_bu.set_position(outer_padding, 2 * img_size + outer_padding);
        feed_bu.set_size(img_size, img_size);
        let bu_button = new button(feed_bu,
            () => {this.app.pet_model.feed(0.5); this.app.go_home(); }
        );
        this.add(bu_button);
        this.buttons.push(bu_button);
        // Pork Rice
        let feed_pr = ePetTommy_gfx.loader.get_sprite("porkrice", "0");
        feed_pr.set_position(2 * img_size + outer_padding, 
                                2 * img_size + outer_padding);
        feed_pr.set_size(img_size, img_size);
        let pr_button = new button(feed_pr,
            () => {this.app.pet_model.feed(0.3); this.app.go_home(); }
        );
        this.add(pr_button);
        this.buttons.push(pr_button);
        
        let w = os.get_graphics_context().width();
        let h = os.get_graphics_context().height();
        let left_carret = ePetTommy_gfx.loader.get_sprite("carret", "left");
        left_carret.set_size(40, 40);
        left_carret.set_position(0, (h - left_carret.height) / 2);
        this.add(left_carret);
        
        let right_carret = ePetTommy_gfx.loader.get_sprite("carret", "right");
        right_carret.set_size(40, 40);
        right_carret.set_position((w - right_carret.width),  (h - left_carret.height) / 2);
        this.add(right_carret);
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
        // Remove handlers
        os.remove_gesture_handler(this.gest_handle_id);
        this.buttons.forEach((b: button) => b.finish());
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
    public player: game_player;
    public engine: game_physics;
    private done: boolean = false;
    private player_stamina: rect;

    private stamina_width = 150;
    private stamina_height = 25;
    
    // Set up the images, etc
    constructor(private app: ePetTommy, public opponent: game_player) {
        super();
        
        let platform_width = 200;
        let platform_height = 100;
        let player_width = 40;
        let screen_width = os.get_graphics_context().width();
        let screen_height = os.get_graphics_context().height();
        
        
        // Add background first so it is drawn first

        // Add platform below players
        this.platform = ePetTommy_gfx.loader.get_sprite("grass_platform", "0");
        this.platform.set_size(platform_width, platform_height);
        this.platform.set_position((screen_width - platform_width) / 2,
                                   screen_height - platform_height);
        this.add(this.platform);

        // Add stamina bar on platform
        this.player_stamina = new rect("#FFFF00", "none");
        
        let stamina_outline = new rect("rgba(255, 0, 0, 0.1)", "#FF0000");
        this.add(stamina_outline);
        this.add(this.player_stamina);

        this.player_stamina.set_size(this.stamina_width, this.stamina_height);
        stamina_outline.set_size(this.stamina_width, this.stamina_height);

        let stamina_pos_x = (screen_width - this.stamina_width) / 2;
        let stamina_pos_y = screen_height - platform_height +
                                    (platform_height - this.stamina_height) / 2;

        this.player_stamina.set_position(stamina_pos_x, stamina_pos_y);
        stamina_outline.set_position(stamina_pos_x, stamina_pos_y);
        
        // Get the player interface
        this.player = app.pet_model.generate_push_player();
        // Add the player's actor to the display
        this.add(this.player.actor);
        this.player.actor.parent = undefined;

        // same for opponent
        this.add(this.opponent.actor);
        this.opponent.actor.parent = undefined;
        
        // Need to resize, and position these actors. They should
        // have sizes of the correct aspect ratio
        let player_height = this.player.actor.height * 
                                (player_width / this.player.actor.width);
        this.player.actor.set_size(player_width, player_height);
        let opponent_height = this.opponent.actor.height * 
                                    (player_width / this.opponent.actor.width);
        this.opponent.actor.set_size(player_width, opponent_height);
        this.player.actor.set_position(screen_width / 3 - player_width / 2, 
                            screen_height - platform_height - player_height);
        this.opponent.actor.set_position(2 * screen_width / 3 - player_width / 2,
                            screen_height - platform_height - opponent_height);
        
        // Give the players access to this game scene
        this.player.parent = this;
        this.opponent.parent = this;

        this.engine = new game_physics ();
    }
    
    update (dt: number) {
        super.update(dt);
        
        if (this.done)
            return;
            
        let result = this.engine.update(this.player, this.opponent, this.platform, dt);

        this.player_stamina.set_size(this.stamina_width * this.player.get_stamina(), this.stamina_height);
        
        if (result === this.player) {
            let tag = new label("You Win!", "30px sans-serif", "#004400", "center");
            tag.set_position(os.get_graphics_context().width() / 2,
                             os.get_graphics_context().height() / 2);
            this.add(tag);
            this.app.pet_model.play();
            // Game is over.
            setTimeout(() => this.app.go_home(), 2000);
            this.done = true;
        }
        if (result === this.opponent) {
            let tag = new label("You Lose!", "30px sans-serif", "#440000", "center");
            tag.set_position(os.get_graphics_context().width() / 2,
                             os.get_graphics_context().height() / 2);
            this.add(tag);
            this.app.pet_model.play();
            // Game is over.
            setTimeout(() => this.app.go_home(), 2000);
            this.done = true;
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
                "carret": {
                    src: "prototype/resources/carrets.png",
                    regions: {
                        "left": { x: 0, y: 0, w: 72, h: 72 },
                        "right": { x: 72, y: 0, w: 72, h: 72 },
                        "down": { x: 72, y: 72, w: 72, h: 72 },
                        "up": { x: 72, y: 72, w: 72, h: 72 }
                    }
                }
            });

    }

}


// Make and register application
(new ePetTommy());
