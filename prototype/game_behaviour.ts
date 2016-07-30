
// Direction of movement
enum direction {LEFT, RIGHT};

abstract class game_player {
    
    // The graphic to be displayed for the player
    actor: actor;
    parent: tommy_game; // tommy game. This will be automatically set when the player
    // is added to a game
    
    // y-velocity. Some accounting for jumping
    vy: number;
    
    protected jumping: boolean;
       
    // Get the relative amount of push since the last check
    // This is relative to 1, being a single tap, for the default strength/mass
    // pet
    abstract get_push(): number;
    
    // Get the direction
    abstract get_direction(): direction;
    
    // returns true to start a jump
    abstract request_jump(): boolean;
    
    // Get mass - i.e. larger mass jumps slower, but is harder to push
    abstract get_mass (): number;
    
    // Is used by game engine
    set_jump_state (jump: boolean): void {
        this.jumping = jump;
    }
    
    is_jumping (): boolean {
        return this.jumping;
    }

    // Instruction to move by controller. y component moves for jump (-ve for up)
    // x component for push
    move (x: number, y: number): void {
        this.actor.set_position(this.actor.x + x, this.actor.y + y);
    }
    
    // Returns a number between 0 and 1 corresponding to the stamina of the player
    // the game_player itself is responsible for dimishing/modifying the stamina
    abstract get_stamina (): number;
    
    // Tells the game_player if it won the game, and gives it the opportunity
    // to tidy up. (e.g. unregister gesture handers, etc) The object can expect
    // to not recieve calls to any of its methods, however, the actor may still
    // be drawn after this function is called.
    abstract game_over (won: boolean): void; 
}

class user_player extends game_player {
       
    private pushes: number;             // Number of pushes since last check
    private push_scale: number;         // How strong each push is
    private mass: number;               // resistance to jump / push
    private dir: direction;             // Direction of push
    private do_jump: boolean;           // Request for jump
    private remaining_stamina: number;  // Amount of stamina remaining
    private stamina_decay: number;      // Rate of stamina decay
    
    private gesture_id: gesture_callback_id;

    constructor(strength: number, hunger: number) {
        // parent constructor
        super();
        
        // Recieve gestures
        this.gesture_id = os.add_gesture_handler(
        ((g: gesture_type, x: number, y: number) => this.gesture_action(g, x, y))
        );
        
        // Setup coefficents
        this.remaining_stamina = 1;
        this.do_jump = false;
        this.pushes = 0;
        this.push_scale = strength;
        this.dir = direction.RIGHT;
        this.mass = hunger;
        
        this.stamina_decay = 1 / (50 * strength);
        
    }
    
    // Swipe left and right change direction, swipe up jumps
    // tap to push
    gesture_action (g: gesture_type, x: number, y: number) {
        switch (g) {
            case gesture_type.tap:
                this.pushes += 1;
                this.remaining_stamina -= (this.remaining_stamina > this.stamina_decay) ?
                    this.stamina_decay : (this.remaining_stamina);
                break;
            case gesture_type.swipeleft:
                this.dir = direction.LEFT;
                break;
            case gesture_type.swiperight:
                this.dir = direction.RIGHT;
                break;
            case gesture_type.swipeup:
                this.do_jump = true;
                break;
        }
    }
    
    // Get mass - i.e. larger mass jumps slower, but is harder to push
    get_mass (): number {
        return this.mass;
    }
    // Get the relative amount of push since the last check
    // This is relative to 1, being a single tap, for the default strength/mass
    // pet
    get_push(): number {
        let output = this.pushes * this.push_scale;
        this.pushes = 0;
        return output;
    }
    
    // Get the direction
    get_direction(): direction {
        return this.dir;
    }
    
    // returns true to start a jump
    request_jump(): boolean {
        if (this.do_jump) {
            this.do_jump = false;
            return true;
        } else {
            return false;
        }
    }
    
    // Returns a number between 0 and 1 corresponding to the stamina of the player
    // the game_player itself is responsible for dimishing/modifying the stamina
    get_stamina (): number {
        return this.remaining_stamina;
    }
    
    // Tells the game_player if it won the game, and gives it the opportunity
    // to tidy up. (e.g. unregister gesture handers, etc) The object can expect
    // to not recieve calls to any of its methods, however, the actor may still
    // be drawn after this function is called.
    game_over (won: boolean): void {
        os.remove_gesture_handler(this.gesture_id);
    }
}


// Dumbest possible player - does nothing
class brick_player extends game_player {
    
    constructor () {
        super();
        this.actor = ePetTommy_gfx.loader.get_sprite("tommy", "dead"); 
        // TODO: Get brick image
    }

    get_push(): number {return 0; }

    get_direction(): direction {return direction.LEFT; }
 
    request_jump(): boolean {return false; }
    
    get_mass (): number {return 1; }
    get_stamina (): number {return 1; }
    game_over (won: boolean): void {}
}



// For simplicity, everything is assumed to be a single rectange.
class game_physics {
    
    // Is 'above' above 'below'? Compare by center points. False if equal height
    is_above(above: actor, below: actor): boolean {
        return (above.abs_y() + above.abs_height() / 2) < 
            (below.abs_y() + below.abs_height() / 2);
    }
    
    // Is a1 left or right of a2? Compare by center points. Returns Right/false if equal.
    is_left (a1: actor, a2: actor): boolean {
        return (a1.abs_x() + a1.abs_width() / 2) < 
            (a2.abs_x() + a2.abs_width() / 2);
    }
    
    // Tests if a1 is hitting a2 from above.
    colliding_from_above (a1: actor, a2: actor): boolean {
        let above_x = a1.abs_x();
        let min_x = a2.abs_x() - a1.abs_width();
        let max_x = a2.abs_x() + a2.abs_width();

        if (above_x > min_x && above_x < max_x) {
            // If it is vertically aligned

            if (this.is_above(a1, a2) 
                    && a1.abs_y() >= a2.abs_y() - a1.abs_height()
               ) {
                   // There is a collision
                   return true;
               } else {
                   // No collision
                   return false;
               }

        } else {
            // not vertically aligned 
            return false;
        }
        
    }

    // Tests if a1 and a2 are touching/intersecting.
    colliding (a1: actor, a2: actor): boolean {
        let y1 = a1.abs_y();
        let min_y = a2.abs_y() - a1.abs_height();
        let max_y = a2.abs_y() + a2.abs_height();
        
        let x1 = a1.abs_x();
        let min_x = a2.abs_x() - a1.abs_width();
        let max_x = a2.abs_x() + a2.abs_width();
        
        if (x1 > min_x && x1 < max_x && y1 > min_y && y1 < max_y)
            return true;
        else
            return false;
        
    }

    /**
     * Is `above` directly above `below`
     * Examines `above` mid-point
     */
    direct_above(below: actor, above: actor): boolean {
        let above_mid = above.abs_x() + (above.abs_width() / 2);
        return (above_mid > below.abs_x() && 
            above_mid < below.abs_x() + below.abs_width());
    }
    
    /**
     * Jumping logic for a given player. Handles starting jumps, and 
     * the vertical movement of a jump.
     */
    do_jump(a: game_player, platform: actor, dt: number): void {
        /* JUMPING LOGIC */
        dt = dt / 1000; // Normalize to seconds so vy in px/sec
        if (a.request_jump()) {
            let vy_init = -100;
            
            a.set_jump_state(true);
            a.vy = vy_init;
        }
        if (a.is_jumping()) {
            let gravity = 60;
            
            a.move(0, a.vy * dt);
            a.vy += gravity * dt;
            
            if (this.colliding(a.actor, platform)) {
                a.vy = 0;
                a.set_jump_state(false);
                a.move(0, -a.actor.abs_y() - a.actor.abs_height() + platform.abs_y());
            }
        }
    }

    /** Perform step of the game.
     * @returns the winner if the game is over, or undefined.
     */
    update (a1: game_player, a2: game_player, platform: actor, dt: number): game_player {
        // Are we done?
        if (!this.direct_above(platform, a1.actor)) {
            a1.game_over(false);
            a2.game_over(true);
            // Signal game over
            return a2;
        } else if (!this.direct_above(platform, a2.actor)) {
            a1.game_over(true);
            a2.game_over(false);
            // Signal game over
            return a1;
        }
        
        // Make life easier
        let right = (this.is_left(a1.actor, a2.actor) ? a2 : a1);
        let left  = (this.is_left(a1.actor, a2.actor) ? a1 : a2);
        
        // Handle pushing
        let push_step = 10;

        // Calculate different step distances.
        let dist1 = left.get_push() 
            * ((left.get_direction() === direction.RIGHT) ? 1 : -1)
            * (left.get_stamina() + 0.1)
            * push_step;
        let dist2 = right.get_push() 
            * (right.get_stamina() + 0.1)
            * ((right.get_direction() === direction.RIGHT) ? 1 : -1)
            * push_step;
            
        if (!this.colliding(left.actor, right.actor)) {
            // If they are not colliding, then they simply move those amounts
            left.move(dist1, 0);
            right.move(dist2, 0);
        } else if (left.get_direction() === direction.LEFT 
            && right.get_direction() === direction.RIGHT) {
            // They are pushing away from each other, so simply move like above
            left.move(dist1, 0);
            right.move(dist2, 0);
        } else if (left.get_direction() === right.get_direction() 
            && dist1 < dist2) {
            // They are moving in the same direction, but moving apart
            left.move(dist1, 0);
            right.move(dist2, 0);
        } else {
            // Either they are pushing in the same direction, or they are
            // pushing against each other. Sign of dist1/2 will take care
            // of this
            
            let dist = dist1 / right.get_mass() + dist2 / left.get_mass();
            // Move them both
            left.move(dist, 0);
            right.move(dist, 0);
            
        }
        if (this.colliding(left.actor, right.actor)) {
            // Find overlap
            let diff = (left.actor.abs_x() + left.actor.abs_width())
                 - right.actor.abs_x();

            // Separate if there is overlap
            if (diff > 0) {
                let total_mass = right.get_mass() + left.get_mass();
                left.move(- left.get_mass() * diff / total_mass, 0);
                right.move(right.get_mass() * diff / total_mass, 0);
            }
        }
        
        this.do_jump(right, platform, dt);
        this.do_jump(left, platform, dt);

        return undefined;
    }

}
