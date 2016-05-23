/*
 * This file contains reusable code for building (game) applications. This
 * code was inspired by the quintus and excalibur web game engines.
 * 
 * This library contains a few concepts.
 * - An actor represents a single object that is displayed on screen.
 * - A scene is a container of actors that can be swapped in and out, to represent
 *   different displays to the user. The scene is responsible for making sure
 *   each actor gets drawn when the scene is told to draw
 * - An application manages which scene is running, and handles getting every
 *   frame drawn by appealing to the cuurrent scene.
 * 
 * Some actors are implented:
 * - A Sprite (bitmap) display
 * - A Rectangle
 * - A text label
 * - A button, which makes any other actor accept tap events
 * - An animator, which allows changing between other actors as frames.
 * 
 * To make this completely recursive, it is a possibility that the scene
 * will be made to be an actor as well, so scenes can contain sub-scenes.
 */

// Magic comment to include definitions, but not have to worry
// about module inclusion
/// <reference path="../emulator/emulator.api.ts"/>


/* Actors are the units which make up the scene. The scene is the entire view, 
 * and is responsible for drawing the display.
 */
abstract class actor {

    /* Width and height of the actor */
    width: number;
    height: number;

    /* actor position */
    x: number;
    y: number;

    /* Is the actor visible */
    visible: boolean;

    /* draw the actor on the display */
    abstract draw(ctx: graphics_context): void;

    /* Update the actor. This is given dt - the amount of time that has passed
     * since the last time the scene was updated. In milliseconds.
     * 
     * This would be where, for example, the actor would change it's position, or
     * perhaps it's look to move or animate.
     */
    abstract update(dt: number): void;

    /* Put it at the given position */
    set_position(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /* Set the size. */
    set_size(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    /* There are no get_ methods, as the components can be accessed publicly easily. */
}

/* A scene is responsible for drawing all of the actors, and updating them all.
 * draw() and update() will be called from the main application loop.
 * 
 * The purpose of putting everything in a scene means that changing the UI stage
 * is as simple as changing the active scene class.
 */
class scene {
    /* list of actors */
    private actors: actor[] = [];

    /* Add an actor to the scene. */
    public add(item: actor): void {
        this.actors.push(item);
    }

    /* Draw the scene on the given graphics context */
    public draw(ctx: graphics_context): void {
        this.actors.forEach(function(item: actor) {
            item.draw(ctx);
        });
    }

    /* Update all the actors. */
    public update(dt: number): void {
        this.actors.forEach(function(item: actor) {
            item.update(dt);
        });
    }

    /* Initialize the scene. For implementation, this might be where all the
     actions would be set up. */
    public init() {
        this.actors.forEach(function(item: actor) {
            item.visible = true;
        });
    }

    /* Finish the scene, e.g. remove action requests. */
    public end() {
        this.actors.forEach(function(item: actor) {
            item.visible = false;
        });
    }


}



/*
 * Application class. Contains main loop and exit controls
 */
class application {

    current_scene: scene;
    running: boolean;

    private last_time: number;
    private curr_time: number;

    public init(): void {
        this.running = true;

        this.last_time = os.get_time().getTime();

        if (this.current_scene)
            this.current_scene.init();
    }

    /*
     * Run Main Loop
     */
    public render(): boolean {

        if (!this.running) {
            this.current_scene.end();
            return false;
        }

        /* Get Context */
        let ctx = os.get_graphics_context();

        /* Calculate time differences for animation. */
        this.curr_time = os.get_time().getTime();
        let dt: number = this.curr_time - this.last_time;
        this.last_time = this.curr_time;

        /* Clear Display */
        ctx.clear(); // TODO: This function does not yet exist

        /* Draw Scene to display */
        this.current_scene.draw(ctx);

        /* Update Scene */
        this.current_scene.update(dt);

        return true;
    }

    /*
     * Set game loop to finish
     */
    public quit(): void {
        this.running = false;
    }

    /*
     * Set/Change the scene being drawn
     */
    public set_scene(new_scene: scene): void {
        if (this.current_scene)
            this.current_scene.end();
        this.current_scene = new_scene;
        this.current_scene.init();
    }

    /* Register this application with the given operating system under the given
     * name
     */
    register_with_os(name: string, operating_system: emulator): void {
        operating_system.register_application(
            name,
            () => this.init(),
            () => this.render()

        );
    }
}


/*
 * This actor displays a single sprite from a sprite sheet.
 */
class sprite extends actor {

    /* Displayed height and width of the sprite */
    public width: number;
    public height: number;

    /* Displayed Sprite position */
    public x: number;
    public y: number;

    /* Constructs the sprite from the given image, corresponding to the offset position and size
     * inside the sprite-sheet image. Expects user to set position.
     */
    constructor(private image: any, private offset_x: number, private offset_y: number,
        private offset_width: number, private offset_height: number) {
        super();
        this.width = offset_width;
        this.height = offset_height;
    }

    /* Draw the sprite. */
    draw(ctx: graphics_context): void {
        ctx.drawImage(
            this.image,
            this.offset_x, this.offset_y, this.offset_width, this.offset_height,
            this.x, this.y, this.width, this.height
        );
    }

    /* Update the actor. A Sprite does nothing. */
    update(dt: number): void {
    }

}



/*
 * Simple button. Recieves tap events when visible. Displays another actor.
 */
class button extends actor {

    private display: actor;
    private callback: () => void;
    private handler: gesture_callback_id;


    // Make a new button out of an actor, with a given callback on tap
    constructor(display: actor, callback: () => void) {
        super();
        this.display = display;
        this.callback = callback;

        this.handler = os.add_gesture_handler(
            (ev: gesture_type, x: number, y: number) => this.handle(ev, x, y)
        );

        this.width = display.width;
        this.height = display.height;
        this.x = display.x;
        this.y = display.y;
    }

    // Draw the sub-actor
    public draw(ctx: graphics_context): void {
        this.display.draw(ctx);
    }

    // Update the sub-actor
    public update(dt: number): void {
        this.display.update(dt);
    }

    // Call the callback if the button was tapped (and button is active)
    private handle(ev: gesture_type, x: number, y: number) {
        if (this.visible
            && ev === gesture_type.tap // Tap
            && this.x < x && x < this.x + this.width // x in button
            && this.y < y && y < this.y + this.height// y in button
        ) {
            this.callback();
        }
    }

    // Unregister the button
    public finish(): void {
        os.remove_gesture_handler(this.handler);
    }

}

/*
 * Simple filled/stroked rectangle
 */

class rect extends actor {

    /*
     * Construct a rectangle with the given fillStyle, strokeStyle and lineWidth
     * as per the canvas 2d context.
     */
    constructor(private fillStyle: any, private strokeStyle: any, private lineWidth = "1") {
        super();
    }

    /* Draw the sprite. */
    draw(ctx: graphics_context): void {
        ctx.strokeStyle = this.strokeStyle;
        ctx.fillStyle = this.fillStyle;
        ctx.lineWidth = this.lineWidth;
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    /* Update the actor. A rect does nothing. */
    update(dt: number): void {
    }
}

/* 
 * Simple text Label. Width and Height are ignored.
 */
class label extends actor {
    /*
     * Construct a new label of the given string
     * Also with the given font, fillStyle (as per canvas 2d context), and alignment
     */
    constructor(private label: string,
        private font: string = "15px sans-serif",
        private fill_style: string = "#000000",
        private text_align: string = "left"
    ) {
        super();
    }

    /* Draw the label. */
    draw(ctx: graphics_context): void {
        ctx.font = this.font;
        ctx.fillStyle = this.fill_style;
        ctx.textAlign = this.text_align;
        ctx.fillText(this.label, this.x, this.y);
    }

    /* Update the actor. A label does nothing. */
    update(dt: number): void {
    }
}

/*
 * Animate an array of actors with a given frame rate, or set the frame rate
 * to zero, and use set_frame() to select the shown actor.
 * 
 * Does this using phase accumulation, like in bresenham's line drawing, or direct digital synthesis.
 * This ensures that the frame will be the correct one at the time of update, skipping frames if necessary.
 */
class animator extends actor {
    private frame: number; // Index of current frame
    private actors: actor[]; // List of frames
    private accumulator: number; // Time accumulated since frame was meant to start (millisec)

    // Construct an animator at the given frame rate. Give fps = 0 to disable 
    // automatic frame selection, and use set_frame;
    constructor(private fps: number) {
        super();
        this.accumulator = 0;
    }

    // Add a frame (resets current frame to 0)
    add(item: actor) {
        this.actors.push(item);
    }

    // Draw the current actor
    draw(ctx: graphics_context) {
        if (this.actors.length === 0)
            return;

        this.actors[this.frame].draw(ctx);
    }

    // Select current frame if fps != 0
    update(dt: number) {
        if (this.fps === 0 || this.actors.length === 0)
            return; // Not auto animated

        this.accumulator += dt; // the total time since the current frame was meant to start.

        // Calculate the number of frames to advance
        let frames = this.accumulator / 1000 * this.fps; // div 1000 as accumulator in millisec.
        frames = Math.floor(frames);

        // Update the current frame counter
        this.set_frame((this.frame + frames) % this.actors.length);

        // Sort out the accumulator
        this.accumulator -= 1000 * frames / this.fps;
    }

    // Set the current frame
    set_frame(index: number) {
        this.actors[this.frame].visible = false;
        this.frame = index;
        this.actors[this.frame].visible = true;
    }

    // Set the position of the animation - sets the position of all the actor frames
    set_position(x: number, y: number) {
        this.actors.forEach(function(item: actor) {
            item.set_position(x, y);
        });
    }

    // Set the size of the animation - sets the size of all the actor frames
    set_size(width: number, height: number) {
        this.actors.forEach(function(item: actor) {
            item.set_size(width, height);
        });
    }
}