/*
 * This file contains the implementation of how tommy works on a data source
 * level, not how he looks.
 */
var tommy_model = (function () {
    /**
     * Load existing Tommy data if it is found on local storage
     * Otherwise create a Tommy with default values.
     */
    function tommy_model() {
        /** Private member health, intial health set to 0.5. */
        this.health = 0.5;
        /// Private member hunger, intial hunger set to 0.5.
        this.hunger = 0.5;
        /// Private member emotion, intial emotion set to 0.5.
        this.emotion = 0.5;
        /// Private member strength, intial strength set to 1.
        this.strength = 0.2;
        /// Private member stat_add, increase state increment.
        this.stat_increment = 0.05;
        /// Private member max_hunger, the maximum hunger limit.
        this.max_hunger = 1.2;
        /// Private member max_health, the maximum health limit.
        this.max_health = 1.0;
        /// Private member max_emotion, the maximum emotion limit.
        this.max_emotion = 1.0;
        /// Private member min_strength, the minimum strength limit.
        this.max_strength = 1.0;
        /// Key for saving and receiving pet values.    
        this.tommy_state_key = "tommy_state";
        /// Time tommy was last interacted with
        this.last_interaction_time = os.get_time();
        var s = os.get_local_storage();
        var data = s.get_object(this.tommy_state_key);
        if (data === null) {
            os.log("First execution, no save found.");
        }
        else {
            this.health = data.health;
            this.hunger = data.hunger;
            this.emotion = data.emotion;
            this.strength = data.strength;
            this.last_interaction_time = data.interaction_time;
            var time_diff = (os.get_time().getTime() - data.interaction_time);
            // Update values, as tommy hasn't been cared for in a while.
            this.update(time_diff);
        }
    }
    /**
     * Saves the state of the pet model to emulator storage
     */
    tommy_model.prototype.save_data = function () {
        var store = os.get_local_storage();
        store.set_object(this.tommy_state_key, {
            health: this.health,
            hunger: this.hunger,
            emotion: this.emotion,
            strength: this.strength,
            interaction_time: this.last_interaction_time.getTime()
        });
    };
    /**
     * Get the pets health.
     */
    tommy_model.prototype.get_health = function () {
        return this.health;
    };
    /**
     * Set the pets health.
     */
    tommy_model.prototype.set_health = function (health) {
        this.health = health;
        if (this.health < 0) {
            this.health = 0;
        }
        else if (this.health > this.max_health) {
            this.health = this.max_health;
        }
    };
    /**
     * Get the pets hunger.
     */
    tommy_model.prototype.get_hunger = function () {
        return this.hunger;
    };
    /**
     * Set the pets hunger.
     */
    tommy_model.prototype.set_hunger = function (hunger) {
        this.hunger = hunger;
        if (this.hunger < 0) {
            this.hunger = 0;
        }
        else if (this.hunger > this.max_hunger) {
            this.hunger = this.max_hunger;
        }
    };
    /**
     * Get the pets emotion.
     */
    tommy_model.prototype.get_emotion = function () {
        return this.emotion;
    };
    /**
     * Set the pets emotion.
     */
    tommy_model.prototype.set_emotion = function (emotion) {
        this.emotion = emotion;
        if (this.emotion < 0) {
            this.emotion = 0;
        }
        else if (this.emotion > this.max_emotion) {
            this.emotion = this.max_emotion;
        }
    };
    /**
     * Get the pets strength.
     */
    tommy_model.prototype.get_strength = function () {
        return this.strength;
    };
    /**
     * Set the pets strength.
     */
    tommy_model.prototype.set_strength = function (strength) {
        this.strength = strength;
        if (this.strength < 0.1) {
            this.strength = 0.1;
        }
        if (this.strength > this.max_strength) {
            this.strength = this.max_strength;
        }
    };
    /**
     * Feed the pet, sets the pets hunger and health based on food quality.
     * Also sets emotion.
     * @param meal_quality is a value between 0.1 and 0.5 incusive,
     * 0.1 for healthy meal, 0.5 for unhealthy.
     */
    tommy_model.prototype.feed = function (meal_quality) {
        // Adsust emotion and health based on food quality.
        if ((meal_quality >= 0.4) && (meal_quality <= 0.5)) {
            this.set_health(this.health - this.stat_increment * 2);
            this.set_emotion(this.emotion + this.stat_increment * 2);
            this.set_hunger(this.hunger + this.stat_increment * 5);
        }
        else if ((meal_quality >= 0.3) && (meal_quality <= 0.4)) {
            this.set_health(this.health - this.stat_increment);
            this.set_emotion(this.emotion + this.stat_increment);
            this.set_hunger(this.hunger + this.stat_increment * 4);
            this.set_strength(this.strength + this.stat_increment);
        }
        else if ((meal_quality >= 0.2) && (meal_quality <= 0.3)) {
            this.set_health(this.health + this.stat_increment);
            this.set_hunger(this.hunger + this.stat_increment * 3);
            this.set_strength(this.strength + this.stat_increment * 2);
        }
        else if ((meal_quality >= 0.1) && (meal_quality <= 0.2)) {
            this.set_health(this.health + this.stat_increment);
            this.set_emotion(this.emotion - this.stat_increment);
            this.set_hunger(this.hunger + this.stat_increment * 2);
            this.set_strength(this.strength + this.stat_increment);
        }
        else if ((meal_quality >= 0.0) && (meal_quality <= 0.1)) {
            this.set_health(this.health + this.stat_increment * 2);
            this.set_emotion(this.emotion - this.stat_increment * 2);
            this.set_hunger(this.hunger + this.stat_increment);
            this.set_strength(this.strength + this.stat_increment * 0.5);
        }
        this.last_interaction_time = os.get_time();
        this.save_data();
    };
    /**
    * Sets emotion based on play
    */
    tommy_model.prototype.play = function () {
        this.set_emotion(this.emotion + this.stat_increment * 3);
        this.set_strength(this.strength + this.stat_increment);
        this.last_interaction_time = os.get_time();
        this.save_data();
    };
    /**
     * Generates a game_player object to represent the pet
     */
    tommy_model.prototype.generate_push_player = function () {
        var p = new user_player(this.get_strength(), this.get_hunger());
        p.actor = ePetTommy_gfx.loader.get_sprite("tommy", "happy");
        return p;
    };
    /**
     * Update time dependant parameters (i.e. get hungry over time, etc)
     */
    tommy_model.prototype.update = function (dt) {
        var day_time = 24 * 3600 * 1000;
        var day_diff = dt / day_time; // convert dt to days
        // Getting hungry - from full to 0 in 4 days
        this.set_hunger(this.hunger - day_diff / 4);
        if (this.hunger <= 0) {
            this.set_hunger(0);
            this.set_health(this.health - day_diff / 4);
            this.set_emotion(this.emotion - day_diff / 4);
        }
        else {
            // Inverse decay to mid health over time.
            this.set_health((this.health - 0.5) / (day_diff * 0.5 + 1) + 0.5);
        }
        // Inverse decay to mid emotion over time.
        this.set_emotion((this.emotion - 0.5) / (day_diff * 0.5 + 1) + 0.5);
        this.set_strength((this.strength - 0.2) / (day_diff * 0.5 + 1) + 0.2);
    };
    return tommy_model;
}());
