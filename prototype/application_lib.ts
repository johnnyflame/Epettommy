/**
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
 * - An actor can be position relative to a parent actor.
 * 
 */

// Magic comment to include definitions, but not have to worry
// about module inclusion
/// <reference path="../emulator/emulator.api.ts"/>


/**
 * Actors are the units which make up the scene. The scene is the entire view, 
 * and is responsible for drawing the display.
 * 
 * If the parent actor is defined, then the position is relative to the parent's
 * position (calculated by the abs functions), and the width and height is given
 * as that contained by the parent.
 */
abstract class actor {

    /** Width of the actor*/
    width: number;
    /** Hight of the actor*/
    height: number;

    /* Actor x position */
    x: number;
    /* Actor y position */
    y: number;
    
    /** Parent Actor */
    parent: actor;

    /** Is the actor visible */
    visible: boolean;

    /** Draw the actor on the display */
    abstract draw(ctx: graphics_context): void;

    /**
     * Update the actor. This is given dt - the amount of time that has passed
     * since the last time the scene was updated. In milliseconds.
     * 
     * This would be where, for example, the actor would change its position, or
     * perhaps look to move or animate.
     */
    abstract update(dt: number): void;

    /** Put the actor at the given position */
    set_position(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /** Set the actor's size. */
    set_size(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    
    /** Calculate the x position with respect to the watch for drawing */
    abs_x(): number {
        if (this.parent) {
            return this.parent.abs_x() + this.x;
        }
        return this.x;
    }

    /** Calculate the y position with respect to the watch for drawing */
    abs_y(): number {
        if (this.parent) {
            return this.parent.abs_y() + this.y;
        }
        return this.y;
    }

    /** Calculate the width, enclosed by the parent*/
    abs_width(): number {
        if (this.parent) {
            let max_width = this.parent.abs_width() - this.x;
            return Math.min(max_width, this.width);
        }
        return this.width;
    }

    /** Calculate the height, enclosed by the parent*/
    abs_height(): number {
        if (this.parent) {
            let max_h = this.parent.abs_height() - this.y;
            return Math.min(max_h, this.height);
        }
        return this.height;
    }
}

/**
 * A scene is responsible for drawing all of the actors, and updating them all.
 * draw() and update() will be called from the main application loop.
 * 
 * The purpose of putting everything in a scene means that changing the UI view
 * is as simple as changing the active scene instance.
 *
 * Actors are drawn in the order they are added to the scene.
 */
class scene extends actor {
    /** list of actors to display */
    private actors: actor[] = [];

    /** Add an actor to the scene. */
    public add(item: actor): void {
        this.actors.push(item);
    }

    /** Draw the scene on the given graphics context */
    public draw(ctx: graphics_context): void {
        this.actors.forEach(function(item: actor) {
            item.draw(ctx);
        });
    }

    /** Update all the actors. */
    public update(dt: number): void {
        this.actors.forEach(function(item: actor) {
            item.update(dt);
        });
    }

    /**
     * Initialize the scene.
     * Here we set the children as visible.
     * For inheriting implementation, this might be where all actions/gestures
     * would be set up.
     */
    public init() {
        this.actors.forEach(function(item: actor) {
            item.visible = true;
        });
    }

    /** 
     * Finish the scene.
     * Here we set the children as not visible.
     * In inheriting classes: e.g. remove gesture requests.
     */
    public end() {
        this.actors.forEach(function(item: actor) {
            item.visible = false;
        });
    }


}



/**
 * Application class. Contains main loop and exit controls
 */
class application {

    /** Currently displayed scene */
    current_scene: scene;
    /** Running flag. Application exits next call to render() when set to false. */
    running: boolean;

    /** Time of last render() call */
    private last_time: number;
    /** Time of current render() call */
    private curr_time: number;

    /**
     * Setup the application, ready to run
     */
    public init(): void {
        this.running = true;

        this.last_time = os.get_time().getTime();

        if (this.current_scene)
            this.current_scene.init();
    }

    /**
     * Run Main Loop. This is expected to be called by the OS quite frequently
     * to redraw the scene, and call update().
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

    /**
     * Set game loop to finish
     */
    public quit(): void {
        this.running = false;
    }

    /**
     * Set/Change the scene being drawn
     */
    public set_scene(new_scene: scene): void {
        if (this.current_scene)
            this.current_scene.end();
        this.current_scene = new_scene;
        this.current_scene.init();
    }

    /**
     * Register this application with the given operating system under the given
     * name
     */
    register_with_os(name: string, operating_system: emulator): void {
        operating_system.register_application(
            name,
            () => this.init(),
            () => this.render(),
            () => this.quit()
        );
    }
}


/** Section/window in bitmap containing a sprite */
interface sprite_window {
    /** x offset inside bitmap */
    x: number; 
    /** y offset inside bitmap */
    y: number;
    /** width inside bitmap */
    w: number;
    /** height inside bitmap */
    h: number;
}

/**
 * This actor displays a single sprite from a sprite sheet.
 */
class sprite extends actor {

    /**
     * Constructs the sprite from the given image, corresponding to the offset
     * position and size inside the sprite-sheet image. Expects user to set
     * position.
     */
    constructor(private image: Image, private window: sprite_window) {
        super();
        this.width = this.window.w;
        this.height = this.window.h;
    }

    /** Draw the sprite. */
    draw(ctx: graphics_context): void {
        
        // Calculate scales, so that when image is partially hidden by being
        // outside parent, part of the image is cut off, rather than the 
        // image simply being resized.
        let hscale = this.abs_width() / this.width;
        let vscale = this.abs_height() / this.height;
        
        ctx.drawImage(
            this.image,
            this.window.x, this.window.y, this.window.w * hscale,
            this.window.h * vscale,
            this.abs_x(), this.abs_y(), this.abs_width(), this.abs_height()
        );
    }

    /** Update the actor. A Sprite does nothing. */
    update(dt: number): void {
    }

}



/**
 * Simple button. Recieves tap events when visible. Displays another actor.
 */
class button extends actor {
    /** Displayed actor */
    private display: actor;
    /** Callback for button presses */
    private callback: () => void;
    /** Gesture callback */
    private handler: gesture_callback_id;


    /**
     * Make a new button out of an actor, with a given callback. Note, position
     * and size of the actor should already be set.
     */
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

    /** Draw the sub-actor */
    public draw(ctx: graphics_context): void {
        this.display.draw(ctx);
    }

    /** Update the sub-actor */
    public update(dt: number): void {
        this.display.update(dt);
    }

    /** Call the callback if the button was tapped (and button is active) */
    private handle(ev: gesture_type, x: number, y: number) {
        if (this.visible
            && ev === gesture_type.tap // Tap
            && this.abs_x() < x && x < this.abs_x() + this.abs_width() // x in button
            && this.abs_y() < y && y < this.abs_y() + this.abs_height()// y in button
        ) {
            this.callback();
        }
    }

    /** Unregister the button. */
    public finish(): void {
        os.remove_gesture_handler(this.handler);
    }

}

/**
 * Simple filled/stroked rectangle
 */

class rect extends actor {

    /**
     * Construct a rectangle with the given fillStyle, strokeStyle and lineWidth
     * as per the canvas 2d context.
     */
    constructor(private fillStyle: any, private strokeStyle: any, private lineWidth = 1) {
        super();
    }

    /** Draw the rect. */
    draw(ctx: graphics_context): void {
        ctx.strokeStyle = this.strokeStyle;
        if (this.fillStyle !== "none") ctx.fillStyle = this.fillStyle;
        if (this.strokeStyle !== "none") ctx.lineWidth = this.lineWidth;
        ctx.beginPath();
        ctx.rect(this.abs_x(), this.abs_y(), this.abs_width(), this.abs_height());
        ctx.closePath();
        if (this.fillStyle !== "none")
            ctx.fill();
        if (this.strokeStyle !== "none")
            ctx.stroke();
    }

    /** Update the actor. A rect does nothing. */
    update(dt: number): void {
    }
}

/**
 * Simple text Label. Width and Height are ignored.
 */
class label extends actor {
    /**
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

    /** Draw the label. */
    draw(ctx: graphics_context): void {
        ctx.font = this.font;
        ctx.fillStyle = this.fill_style;
        ctx.textAlign = this.text_align;
        ctx.fillText(this.label, this.abs_x(), this.abs_y());
    }

    /** Update the actor. A label does nothing. */
    update(dt: number): void {
    }
}

/**
 * Animate an array of actors with a given frame rate, or set the frame rate
 * to zero, and use set_frame() to select the shown actor.
 * 
 * Does this using phase accumulation, like in bresenham's line drawing, or direct digital synthesis.
 * This ensures that the frame will be the correct one at the time of update, skipping frames if necessary.
 */
class animator extends actor {
    /** Index of current frame */
    private frame: number;
    /** List of frames */
    private actors: actor[] = [];
    /** Time accumulated since frame was meant to start (millisec) */
    private accumulator: number; 

    /** 
     * Construct an animator at the given frame rate. Give fps = 0 to disable
     * automatic frame selection, and use set_frame;
     */
    constructor(private fps: number) {
        super();
        this.accumulator = 0;
        this.frame = 0;
    }

   /** Add a frame */
    add(item: actor) {
        this.actors.push(item);
    }

    /** Draw the current frame */
    draw(ctx: graphics_context) {
        if (this.actors.length === 0)
            return;
        this.actors[this.frame].draw(ctx);
    }

    /** Select current frame if fps != 0 */
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
    
    /** Set the size of all the frames */
    set_size(w: number, h: number) {
        this.actors.forEach(function(item: actor) {
            item.set_size(w, h);
        });
    }
    
    /** Set the position of all the frames */
    set_position(x: number, y: number) {
        this.actors.forEach(function(item: actor) {
            item.set_position(x, y);
        });
    }

    /** Set the current frame */
    set_frame(index: number) {
        this.actors[this.frame].visible = false;
        this.frame = index;
        this.actors[this.frame].visible = true;
    }
}


/**
 * This class is designed to be constructed at load time, well in advance of
 * being used. The images are loaded asyncronously.
 * 
 * An instance is expecting to be constructed by taking a map/struct of names to
 * image structs. Each structs contains the corresponding image source as a 
 * string 'src', and a map/struct called regions, which is is a map of {x,y,w,h} 
 * structs, with all numeric fields, corresponding to the subsection of the 
 * image which corresponds to the region key. This is for use with sprite maps,
 * and this is to allow the sources and sprite map areas to be specified in one
 * place, with the drawing code referencing things by name.
 * 
 * e.g.
 * ```typescript
 * ldr = new image_loader(
        {
            "tommy": {
                src: "prototype/resources/slime.png",
                regions: {
                    "face1": {x: 0, y: 0, w: 95, h: 95},
                    "face2": {x: 95, y: 0, w: 95, h: 95},
                    others...
                }
            },
            others...
        });
 * ```
 *  After loading, we could then construct a sprite from the loaded image by
 *      get_sprite"tommy", "face1");
 *  which is equivalent to
 *  
 *  new sprite(ldr.get_image("tommy"), ldr.get_region("tommy", "face1"))
 */
class image_loader {
    data: any;
    
    /**
     * Get the Image for the given name in the image data.
     * This is not gauranteed to be loaded.
     */
    public get_image (img_name: string): any {
        return this.data[img_name].image;
    }
    
    /**
     * Get the region/sprite_window structure with the given name, on the given
     * image
     */
    public get_region (img_name: string, region: any): any {
        return this.data[img_name].regions[region];
    }
    
    /**
     * Construct a new sprite made from the given region of the given image.
     */
    public get_sprite (img_name: string, region: any): sprite {
        return new sprite (this.data[img_name].image, 
        this.data[img_name].regions[region]);
    }
    
    /**
     * Constructs an Image for each item in the data, and sets it to do an async
     * load.
     */
    constructor (data: any) {
        this.data = data;
        // Make a new Image object for each item and give it the 
        // corresponding src
        for (let item in this.data) {
            this.data[item].image = os.get_image(this.data[item].src);
        };
    }
    
}
