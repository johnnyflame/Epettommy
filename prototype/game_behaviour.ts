
// Direction of movement
enum direction {LEFT, RIGHT};

abstract class game_player {
    
    /**  The graphic to be displayed for the player*/
    actor: actor;
    
    parent: tommy_game; // tommy game. This will be automatically set when the player
    // is added to a game
    
    /** y-velocity. Some accounting for jumping */
    vy: number = 0;
    /** x-velocity. Smoothing out player movements */
    vx: number = 0;

    /** Is the player jumping currently */
    protected jumping: boolean;
       
    /**
     * Get the relative amount of push since the last check
     * This is relative to 1, being a single tap, for the default strength/mass
     * pet
     */
    abstract get_push(): number;
    
    /** Get the direction */
    abstract get_direction(): direction;
    
    /** returns true to start a jump */
    abstract request_jump(): boolean;
    
    /** Get mass - i.e. larger mass jumps slower, but is harder to push */
    abstract get_mass (): number;
    
    /** Is used by game engine */
    set_jump_state (jump: boolean): void {
        this.jumping = jump;
    }

    /** @return is the player jumping */
    is_jumping (): boolean {
        return this.jumping;
    }

    /**
     * Instruction to move by controller. y component moves for jump (-ve for up)
     * x component for push
     */
    move (x: number, y: number): void {
        this.actor.set_position(this.actor.x + x, this.actor.y + y);
    }
    
    /** Returns a number between 0 and 1 corresponding to the stamina of the player
     the game_player itself is responsible for dimishing/modifying the stamina */
    abstract get_stamina (): number;
    
    /** Tells the game_player if it won the game, and gives it the opportunity
     * to tidy up. (e.g. unregister gesture handers, etc) The object can expect
     * to not recieve calls to any of its methods, however, the actor may still
     * be drawn after this function is called.
    */
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
        
        this.stamina_decay = 1 / (100 * strength);
        
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
        // TODO: Get brick image?
    }

    get_push(): number {return 0; }

    get_direction(): direction {return direction.LEFT; }
 
    request_jump(): boolean {return false; }
    
    get_mass (): number {return 1; }
    get_stamina (): number {return 1; }
    game_over (won: boolean): void {}
}


// Simple AI player
class ai_player extends game_player {
    
    private last_push = os.get_time().getTime();
    private last_jump = os.get_time().getTime();
    private jump_time = Math.random() * 10000;
    
    constructor () {
        super();
        this.actor = ePetTommy_gfx.loader.get_sprite("tommy", "sick"); 
        // TODO: Select Image
    }

    get_push(): number {
        if (os.get_time().getTime() - this.last_push > 500) {
            this.last_push = os.get_time().getTime();
            return 1;
        }
        return 0;
    }

    get_direction(): direction {
        if (this.parent.engine.is_left(this.parent.player.actor, this.actor))
            return direction.LEFT;
        return direction.RIGHT;
    }
    
    request_jump(): boolean {
        if (os.get_time().getTime() - this.last_jump > this.jump_time) {
            this.last_jump = os.get_time().getTime();
            this.jump_time = Math.random() * 10000;
            return true;
        }
        return false;
    }
    
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
    
    /**
     * Is a1 left or right of a2? Compare by center points.
     *  @return true if a1 is left of a2, right/false if equal.
     */
    is_left (a1: actor, a2: actor): boolean {
        return (a1.abs_x() + a1.abs_width() / 2) < 
            (a2.abs_x() + a2.abs_width() / 2);
    }

    /**
     *  Tests if a1 and a2 are touching/intersecting.
     */
    colliding (a1: actor, a2: actor): boolean {
        let y1 = a1.abs_y();
        let min_y = a2.abs_y() - a1.abs_height();
        let max_y = a2.abs_y() + a2.abs_height();
        
        let x1 = a1.abs_x();
        let min_x = a2.abs_x() - a1.abs_width();
        let max_x = a2.abs_x() + a2.abs_width();
        
        if (x1 >= min_x && x1 <= max_x && y1 >= min_y && y1 <= max_y)
            return true;
        else
            return false;
        
    }

    /**
     * Is `above` directly above `below`, in terms of only the horizontal component
     * Examines `above` mid-point
     */
    directly_above(below: actor, above: actor): boolean {
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
            // Start a new jump
            let vy_init = -200;
            
            a.set_jump_state(true);
            a.vy = vy_init;
        }
        if (a.is_jumping()) {
            // Continue a jump
            let gravity = 250;
            
            a.move(0, a.vy * dt);
            a.vy += gravity * dt;
            
            if (this.colliding(a.actor, platform)) {
                // Stop on the platform
                a.vy = 0;
                a.set_jump_state(false);
                a.move(0, -a.actor.abs_y() - a.actor.abs_height() + platform.abs_y());
            } else if (a.actor.y <= 0) {
                // Stop at the top of the window
                a.actor.y = 1;
                a.vy = 0;
            }
        }
    }
    
    /**
     * Perform frictional drag, to slow players down.
     */
    do_drag(p: game_player, dt: number): void {
        let time_constant = (2 * 1000); // 1/e decay time constant in ms 
        p.vx -= dt * p.vx / time_constant;
    }
    
    /**
     * Move player according to velocity.
     */
    do_move(p: game_player, dt: number): void {
        let dt_sec = dt / 1000; // Convert to seconds
        let vx_scale = 15; // so vx in 30pix/sec
        p.move(p.vx * vx_scale * dt_sec, 0);
        
    }

    /**
     * Perform step of the game.
     * @return the winner if the game is over, or undefined.
     */
    update (a1: game_player, a2: game_player, platform: actor, dt: number): game_player {
        // Are we done?
        if (!this.directly_above(platform, a1.actor)) {
            a1.game_over(false);
            a2.game_over(true);
            // Signal game over
            return a2;
        } else if (!this.directly_above(platform, a2.actor)) {
            a1.game_over(true);
            a2.game_over(false);
            // Signal game over
            return a1;
        }
        
        this.do_drag(a1, dt);
        this.do_drag(a2, dt);
        
        // Make life easier
        let right = (this.is_left(a1.actor, a2.actor) ? a2 : a1);
        let left  = (this.is_left(a1.actor, a2.actor) ? a1 : a2);

        // Calculate different push strengths.
        let push1 = left.get_push() 
            * ((left.get_direction() === direction.RIGHT) ? 1 : -1)
            * (left.get_stamina() + 0.1);
        let push2 = right.get_push() 
            * (right.get_stamina() + 0.1)
            * ((right.get_direction() === direction.RIGHT) ? 1 : -1);

        // Update velocities
        left.vx  += push1;
        right.vx += push2;

        // Handle collisions
        if (this.colliding(left.actor, right.actor) && 
                (
                    (right.vx <= 0 && left.vx >= 0) ||  // Inwards
                    (right.vx * left.vx > 0 &&  // Same direction, and
                        (   // one pushing into the other
                            (right.vx > 0 && left.vx > right.vx) ||
                            (right.vx < 0 && left.vx < right.vx)
                        )
                    )
                )     
            ) {
            // Collision into each other (perfect inelastic). Conserve momentum.
            let velocity = (push1 * left.get_mass() + push2 * right.get_mass()) /
                            (left.get_mass() + right.get_mass());
            // Move them both
            left.vx  = velocity;
            right.vx = velocity;
            
        }
        
        // Horizontal movements
        this.do_move(left, dt);
        this.do_move(right, dt);
        // Vertical movements
        this.do_jump(right, platform, dt);
        this.do_jump(left, platform, dt);

        // Fix collisions
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
        

        

        return undefined;
    }

}
