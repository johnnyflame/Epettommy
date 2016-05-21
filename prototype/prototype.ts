/*
 * The main application for the prototype
 */
 
namespace ePetTommy {

    class ePetTommy extends application {
        
        tommy_image: any; // Tommy Sprite sheet
        private main_scene: tommy_home; // Main scene
        pet_model: tommy_model; // model of pet
        
        constructor() {
            super(); // Appeal to parent class --- we must
            this.register_with_os("ePetTommy", os); // Register the application with the os
            // Pre-load Tommy Image
            this.tommy_image = new Image();
            this.tommy_image.src = "prototype/resources/slime.png"; 
        }
        
        init () {
            this.main_scene = new tommy_home(this);
            this.pet_model = new tommy_model();
            super.init();
        }
        
        // Tell the application and scenes that it is time to stop.
        quit () {
            super.quit();
            this.main_scene.close();
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
        constructor (private parent: ePetTommy) {
            super();
            
            let feed_placeholder = new rect("#777700", "#007777");
            feed_placeholder.set_position(2,2);
            feed_placeholder.set_size(40, 40);
            // Connect Feed button to model
            this.feed_button = new button (feed_placeholder, 
                () => this.parent.pet_model.feed(this.default_feed)
                );
            // Add this to the scene
            this.add(this.feed_button);
            
           
            
            
        }
        
        // Update all the sliders, and the player's state
        update (dt: number) {
            super.update(dt);
        }
        
        // finish() the buttons
        close () {
            this.feed_button.finish();
            this.game_button.finish();
        }
    }
    
    /*
     * Scene for playing the game.
     */
    class tommy_game extends scene {
        // Set up the images, etc
        constructor (private parent: ePetTommy, private opponent: any) {
            super();
            
        }
    }
    
// Make and register application
(new ePetTommy());
}   