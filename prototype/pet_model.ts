/* 
 * This file contains the implementation of how tommy works on a data source
 * level, not how he looks.
 */

class tommy {

    // Private member health, intial health set to 0.5.
    private health: number = 0.5;
    // Private member hunger, intial hunger set to 0.5.
    private hunger: number = 0.5;
    // Private member emotion, intial emotion set to 0.5.
    private emotion: number = 0.5;
    // Private member strength, intial strength set to 1.
    private strength: number = 1.0;

    /*
     * Get the pets health.
     */
    get_health(): number {
        return this.health;
    }
    /*
     * Set the pets health.
     */
    set_health(health: number) {
        this.health = health;
    }
    /*
     * Get the pets hunger.
     */
    get_hunger(): number {
        return this.hunger;
    }
    /*
     * Set the pets hunger.
     */
    set_hunger(hunger: number) {
        this.hunger = hunger;
    }
    /*
     * Get the pets emotion.
     */
    get_emotion(): number {
        return this.emotion;
    }
    /*
     * Set the pets emotion.
     */
    set_emotion(emotion: number) {
        this.hunger = emotion;
    }
    /*
     * Get the pets strength.
     */
    get_strength(): number {
        return this.strength;
    }
    /*
     * Set the pets strength.
     */
    set_strength(strength: number) {
        this.hunger = strength;
    }
    /*
     * Feed the pet, sets the pets hunger and health based on food quality.
     */
    feed(meal_quality: number) {
        this.hunger = this.hunger - meal_quality;
        if (this.hunger < 0) {
            this.hunger = 0;
        }
        //if (meal_quality) adjust hunger and health...
    }
    /*
    * Sets emotion based on play
    */
    play() { }

}