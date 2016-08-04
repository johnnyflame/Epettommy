/* 
 * This file contains the implementation of how tommy works on a data source
 * level, not how he looks.
 */

class tommy_model {
    /** Private member health, intial health set to 0.5. */
    private health: number = 0.5;
    /// Private member hunger, intial hunger set to 0.5.
    private hunger: number = 0.5;
    /// Private member emotion, intial emotion set to 0.5.
    private emotion: number = 0.5;
    /// Private member strength, intial strength set to 1.
    private strength: number = 1.0;
    
    /// Private member stat_add, increase state increment.
    private stat_increment: number = 0.1;
    
    /// Private member max_hunger, the maximum hunger limit.
    private max_hunger: number = 1.2;
    /// Private member max_health, the maximum health limit.
    private max_health: number = 1.0;
    /// Private member max_emotion, the maximum emotion limit.
    private max_emotion: number = 1.0;
    /// Private member min_strength, the minimum strength limit.
    private min_strength: number = 1.0;
    /// Key for saving and receiving pet values.    
    private tommy_state_key: string = "tommy_state";

    /// Time tommy was last interacted with
    private last_interaction_time = os.get_time();
   
    
    /**
     * Load existing Tommy data if it is found on local storage
     * Otherwise create a Tommy with default values. 
     */
    constructor() {

        let s = os.get_local_storage();
        let data = s.get_object(this.tommy_state_key);

        if (data === null) {
            os.log("First execution, no save found.");
        } else {
            this.health = data.health;
            this.hunger = data.hunger;
            this.emotion = data.emotion;
            this.strength = data.strength;
            this.last_interaction_time = data.interaction_time;

            let time_diff = (os.get_time().getTime() - data.interaction_time);
           
            // Update values, as tommy hasn't been cared for in a while.
            this.update (time_diff);
        }

                
      }
        
    /**
     * Saves the state of the pet model to emulator storage
     */
    save_data(): any {
     let store = os.get_local_storage();
     store.set_object(this.tommy_state_key, {
         health: this.health,
         hunger: this.hunger,
         emotion: this.emotion,
         strength: this.strength,
         interaction_time: this.last_interaction_time.getTime()
     });
    }
     
    /**
     * Get the pets health.
     */
    get_health(): number {
        return this.health;
    }
    /**
     * Set the pets health.
     */
    set_health(health: number) {
        this.health = health;
        if (this.health < 0) {
            this.health = 0;
        }else if (this.health > this.max_health) {
            this.health = this.max_health;
        }
    }
    /**
     * Get the pets hunger.
     */
    get_hunger(): number {
        return this.hunger;
    }
    /**
     * Set the pets hunger.
     */
    set_hunger(hunger: number) {
        this.hunger = hunger;
        if (this.hunger < 0) {
            this.hunger = 0;
        }else if (this.hunger > this.max_hunger) {
            this.hunger = this.max_hunger;
        }
    }
    /**
     * Get the pets emotion.
     */
    get_emotion(): number {
        return this.emotion;
    }
    /**
     * Set the pets emotion.
     */
    set_emotion(emotion: number) {
        this.emotion = emotion;
        if (this.emotion < 0) {
            this.emotion = 0;
        }else if (this.emotion > this.max_emotion) {
            this.emotion = this.max_emotion;
        }
    }
    /**
     * Get the pets strength.
     */
    get_strength(): number {
        return this.strength;
    }
    /**
     * Set the pets strength.
     */
    set_strength(strength: number) {
        this.strength = strength;
        if (this.strength < this.min_strength) {
            this.strength = this.min_strength;
        }
    }
    /**
     * Feed the pet, sets the pets hunger and health based on food quality.
     * Also sets emotion.
     * @param meal_quality is a value between 0.1 and 0.5 incusive,
     * 0.1 for healthy meal, 0.5 for unhealthy.
     */
    feed(meal_quality: number) {
        
        // Adsust emotion and health based on food quality.
        if (meal_quality === 0.5) {
            this.set_health(this.health - this.stat_increment * 2);
            this.set_emotion(this.emotion + this.stat_increment * 2);
            this.set_hunger(this.hunger + this.stat_increment * 5);
        }else if (meal_quality === 0.4) {
            this.set_health(this.health - this.stat_increment);
            this.set_emotion(this.emotion + this.stat_increment);
            this.set_hunger(this.hunger + this.stat_increment * 4);
        }else if (meal_quality === 0.3) {
            this.set_health(this.health + this.stat_increment);
            this.set_hunger(this.hunger + this.stat_increment * 3);        
        }else if (meal_quality === 0.2) {
            this.set_health(this.health + this.stat_increment);
            this.set_emotion(this.emotion - this.stat_increment);
            this.set_hunger(this.hunger + this.stat_increment * 2);
        }else if (meal_quality === 0.1) {
            this.set_health(this.health + this.stat_increment * 2);
            this.set_emotion(this.emotion - this.stat_increment * 2);
            this.set_hunger(this.hunger + this.stat_increment);
        }
        this.last_interaction_time = os.get_time();
        this.save_data();
        
    }
    
    /**
    * Sets emotion based on play
    */
    play () {
        this.set_emotion(this.emotion + this.stat_increment*3);
        this.last_interaction_time = os.get_time();
        this.save_data();
    }
    
    /**
     * Generates a game_player object to represent the pet
     */
     generate_push_player(): game_player {
         let p = new user_player(this.get_strength(), this.get_hunger());
         p.actor = ePetTommy_gfx.loader.get_sprite("tommy", "happy");
         return p;
     }

    /**
     * Update time dependant parameters (i.e. get hungry over time, etc)
     */
    update(dt: number) {

        let day_time = 24 * 3600 * 1000;
        let day_diff = dt / day_time; // convert dt to days
        
        // Getting hungry - from full to 0 in 4 days
        this.hunger = this.hunger - day_diff / 4;
        if (this.hunger <= 0) {
            this.hunger = 0;
            this.health = 0;
        } else {
            // Inverse decay to mid health over time.
            this.health = (this.health - 0.5) / (day_diff * 0.5 + 1) + 0.5;
        }
        // Inverse devay to mid emotion over time.
        this.emotion = (this.emotion - 0.5) / (day_diff * 0.5 + 1) + 0.5;
    }
}
