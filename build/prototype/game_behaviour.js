var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
// Direction of movement
var direction;
(function (direction) {
    direction[direction["LEFT"] = 0] = "LEFT";
    direction[direction["RIGHT"] = 1] = "RIGHT";
})(direction || (direction = {}));
;
var game_player = (function () {
    function game_player() {
        // is added to a game
        /** y-velocity. Some accounting for jumping */
        this.vy = 0;
        /** x-velocity. Smoothing out player movements */
        this.vx = 0;
    }
    /** Is used by game engine */
    game_player.prototype.set_jump_state = function (jump) {
        this.jumping = jump;
    };
    /** @return is the player jumping */
    game_player.prototype.is_jumping = function () {
        return this.jumping;
    };
    /**
     * Instruction to move by controller. y component moves for jump (-ve for up)
     * x component for push
     */
    game_player.prototype.move = function (x, y) {
        this.actor.set_position(this.actor.x + x, this.actor.y + y);
    };
    return game_player;
}());
var user_player = (function (_super) {
    __extends(user_player, _super);
    function user_player(strength, hunger) {
        var _this = this;
        // parent constructor
        _super.call(this);
        // Recieve gestures
        this.gesture_id = os.add_gesture_handler((function (g, x, y) { return _this.gesture_action(g, x, y); }));
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
    user_player.prototype.gesture_action = function (g, x, y) {
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
    };
    // Get mass - i.e. larger mass jumps slower, but is harder to push
    user_player.prototype.get_mass = function () {
        return this.mass;
    };
    // Get the relative amount of push since the last check
    // This is relative to 1, being a single tap, for the default strength/mass
    // pet
    user_player.prototype.get_push = function () {
        var output = this.pushes * this.push_scale;
        this.pushes = 0;
        return output;
    };
    // Get the direction
    user_player.prototype.get_direction = function () {
        return this.dir;
    };
    // returns true to start a jump
    user_player.prototype.request_jump = function () {
        if (this.do_jump) {
            this.do_jump = false;
            return true;
        }
        else {
            return false;
        }
    };
    // Returns a number between 0 and 1 corresponding to the stamina of the player
    // the game_player itself is responsible for dimishing/modifying the stamina
    user_player.prototype.get_stamina = function () {
        return this.remaining_stamina;
    };
    // Tells the game_player if it won the game, and gives it the opportunity
    // to tidy up. (e.g. unregister gesture handers, etc) The object can expect
    // to not recieve calls to any of its methods, however, the actor may still
    // be drawn after this function is called.
    user_player.prototype.game_over = function (won) {
        os.remove_gesture_handler(this.gesture_id);
    };
    return user_player;
}(game_player));
// Dumbest possible player - does nothing
var brick_player = (function (_super) {
    __extends(brick_player, _super);
    function brick_player() {
        _super.call(this);
        this.actor = ePetTommy_gfx.loader.get_sprite("tommy", "dead");
        // TODO: Get brick image?
    }
    brick_player.prototype.get_push = function () { return 0; };
    brick_player.prototype.get_direction = function () { return direction.LEFT; };
    brick_player.prototype.request_jump = function () { return false; };
    brick_player.prototype.get_mass = function () { return 1; };
    brick_player.prototype.get_stamina = function () { return 1; };
    brick_player.prototype.game_over = function (won) { };
    return brick_player;
}(game_player));
// Simple AI player
var ai_player = (function (_super) {
    __extends(ai_player, _super);
    function ai_player() {
        _super.call(this);
        this.last_push = os.get_time().getTime();
        this.last_jump = os.get_time().getTime();
        this.jump_time = Math.random() * 10000;
        this.actor = ePetTommy_gfx.loader.get_sprite("tommy", "sick");
        // TODO: Select Image
    }
    ai_player.prototype.get_push = function () {
        if (os.get_time().getTime() - this.last_push > 500) {
            this.last_push = os.get_time().getTime();
            return 1;
        }
        return 0;
    };
    ai_player.prototype.get_direction = function () {
        if (this.parent.engine.is_left(this.parent.player.actor, this.actor))
            return direction.LEFT;
        return direction.RIGHT;
    };
    ai_player.prototype.request_jump = function () {
        if (os.get_time().getTime() - this.last_jump > this.jump_time) {
            this.last_jump = os.get_time().getTime();
            this.jump_time = Math.random() * 10000;
            return true;
        }
        return false;
    };
    ai_player.prototype.get_mass = function () { return 1; };
    ai_player.prototype.get_stamina = function () { return 1; };
    ai_player.prototype.game_over = function (won) { };
    return ai_player;
}(game_player));
// For simplicity, everything is assumed to be a single rectange.
var game_physics = (function () {
    function game_physics() {
    }
    // Is 'above' above 'below'? Compare by center points. False if equal height
    game_physics.prototype.is_above = function (above, below) {
        return (above.abs_y() + above.abs_height() / 2) <
            (below.abs_y() + below.abs_height() / 2);
    };
    /**
     * Is a1 left or right of a2? Compare by center points.
     *  @return true if a1 is left of a2, right/false if equal.
     */
    game_physics.prototype.is_left = function (a1, a2) {
        return (a1.abs_x() + a1.abs_width() / 2) <
            (a2.abs_x() + a2.abs_width() / 2);
    };
    /**
     *  Tests if a1 and a2 are touching/intersecting.
     */
    game_physics.prototype.colliding = function (a1, a2) {
        var y1 = a1.abs_y();
        var min_y = a2.abs_y() - a1.abs_height();
        var max_y = a2.abs_y() + a2.abs_height();
        var x1 = a1.abs_x();
        var min_x = a2.abs_x() - a1.abs_width();
        var max_x = a2.abs_x() + a2.abs_width();
        if (x1 >= min_x && x1 <= max_x && y1 >= min_y && y1 <= max_y)
            return true;
        else
            return false;
    };
    /**
     * Is `above` directly above `below`, in terms of only the horizontal component
     * Examines `above` mid-point
     */
    game_physics.prototype.directly_above = function (below, above) {
        var above_mid = above.abs_x() + (above.abs_width() / 2);
        return (above_mid > below.abs_x() &&
            above_mid < below.abs_x() + below.abs_width());
    };
    /**
     * Jumping logic for a given player. Handles starting jumps, and
     * the vertical movement of a jump.
     */
    game_physics.prototype.do_jump = function (a, platform, dt) {
        /* JUMPING LOGIC */
        dt = dt / 1000; // Normalize to seconds so vy in px/sec
        if (a.request_jump()) {
            // Start a new jump
            var vy_init = -200;
            a.set_jump_state(true);
            a.vy = vy_init;
        }
        if (a.is_jumping()) {
            // Continue a jump
            var gravity = 250;
            a.move(0, a.vy * dt);
            a.vy += gravity * dt;
            if (this.colliding(a.actor, platform)) {
                // Stop on the platform
                a.vy = 0;
                a.set_jump_state(false);
                a.move(0, -a.actor.abs_y() - a.actor.abs_height() + platform.abs_y());
            }
            else if (a.actor.y <= 0) {
                // Stop at the top of the window
                a.actor.y = 1;
                a.vy = 0;
            }
        }
    };
    /**
     * Perform frictional drag, to slow players down.
     */
    game_physics.prototype.do_drag = function (p, dt) {
        var time_constant = (2 * 1000); // 1/e decay time constant in ms 
        p.vx -= dt * p.vx / time_constant;
    };
    /**
     * Move player according to velocity.
     */
    game_physics.prototype.do_move = function (p, dt) {
        var dt_sec = dt / 1000; // Convert to seconds
        var vx_scale = 15; // so vx in 30pix/sec
        p.move(p.vx * vx_scale * dt_sec, 0);
    };
    /**
     * Perform step of the game.
     * @return the winner if the game is over, or undefined.
     */
    game_physics.prototype.update = function (a1, a2, platform, dt) {
        // Are we done?
        if (!this.directly_above(platform, a1.actor)) {
            a1.game_over(false);
            a2.game_over(true);
            // Signal game over
            return a2;
        }
        else if (!this.directly_above(platform, a2.actor)) {
            a1.game_over(true);
            a2.game_over(false);
            // Signal game over
            return a1;
        }
        this.do_drag(a1, dt);
        this.do_drag(a2, dt);
        // Make life easier
        var right = (this.is_left(a1.actor, a2.actor) ? a2 : a1);
        var left = (this.is_left(a1.actor, a2.actor) ? a1 : a2);
        // Calculate different push strengths.
        var push1 = left.get_push()
            * ((left.get_direction() === direction.RIGHT) ? 1 : -1)
            * (left.get_stamina() + 0.1);
        var push2 = right.get_push()
            * (right.get_stamina() + 0.1)
            * ((right.get_direction() === direction.RIGHT) ? 1 : -1);
        // Update velocities
        left.vx += push1;
        right.vx += push2;
        // Handle collisions
        if (this.colliding(left.actor, right.actor) &&
            ((right.vx <= 0 && left.vx >= 0) ||
                (right.vx * left.vx > 0 &&
                    ((right.vx > 0 && left.vx > right.vx) ||
                        (right.vx < 0 && left.vx < right.vx))))) {
            // Collision into each other (perfect inelastic). Conserve momentum.
            var velocity = (push1 * left.get_mass() + push2 * right.get_mass()) /
                (left.get_mass() + right.get_mass());
            // Move them both
            left.vx = velocity;
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
            var diff = (left.actor.abs_x() + left.actor.abs_width())
                - right.actor.abs_x();
            // Separate if there is overlap
            if (diff > 0) {
                var total_mass = right.get_mass() + left.get_mass();
                left.move(-left.get_mass() * diff / total_mass, 0);
                right.move(right.get_mass() * diff / total_mass, 0);
            }
        }
        return undefined;
    };
    return game_physics;
}());
