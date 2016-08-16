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
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var actor = (function () {
    function actor() {
    }
    /** Put the actor at the given position */
    actor.prototype.set_position = function (x, y) {
        this.x = x;
        this.y = y;
    };
    /** Set the actor's size. */
    actor.prototype.set_size = function (width, height) {
        this.width = width;
        this.height = height;
    };
    /** Calculate the x position with respect to the watch for drawing */
    actor.prototype.abs_x = function () {
        if (this.parent) {
            return this.parent.abs_x() + this.x;
        }
        return this.x;
    };
    /** Calculate the y position with respect to the watch for drawing */
    actor.prototype.abs_y = function () {
        if (this.parent) {
            return this.parent.abs_y() + this.y;
        }
        return this.y;
    };
    /** Calculate the width, enclosed by the parent*/
    actor.prototype.abs_width = function () {
        if (this.parent) {
            var max_width = this.parent.abs_width() - this.x;
            return Math.min(max_width, this.width);
        }
        return this.width;
    };
    /** Calculate the height, enclosed by the parent*/
    actor.prototype.abs_height = function () {
        if (this.parent) {
            var max_h = this.parent.abs_height() - this.y;
            return Math.min(max_h, this.height);
        }
        return this.height;
    };
    return actor;
}());
/**
 * A scene is responsible for drawing all of the actors, and updating them all.
 * draw() and update() will be called from the main application loop.
 *
 * The purpose of putting everything in a scene means that changing the UI view
 * is as simple as changing the active scene instance.
 *
 * Actors are drawn in the order they are added to the scene.
 */
var scene = (function (_super) {
    __extends(scene, _super);
    function scene() {
        _super.apply(this, arguments);
        /** list of actors to display */
        this.actors = [];
    }
    /** Add an actor to the scene. */
    scene.prototype.add = function (item) {
        this.actors.push(item);
    };
    /** Draw the scene on the given graphics context */
    scene.prototype.draw = function (ctx) {
        this.actors.forEach(function (item) {
            item.draw(ctx);
        });
    };
    /** Update all the actors. */
    scene.prototype.update = function (dt) {
        this.actors.forEach(function (item) {
            item.update(dt);
        });
    };
    /**
     * Initialize the scene.
     * Here we set the children as visible.
     * For inheriting implementation, this might be where all actions/gestures
     * would be set up.
     */
    scene.prototype.init = function () {
        this.actors.forEach(function (item) {
            item.visible = true;
        });
    };
    /**
     * Finish the scene.
     * Here we set the children as not visible.
     * In inheriting classes: e.g. remove gesture requests.
     */
    scene.prototype.end = function () {
        this.actors.forEach(function (item) {
            item.visible = false;
        });
    };
    return scene;
}(actor));
/**
 * Application class. Contains main loop and exit controls
 */
var application = (function () {
    function application() {
    }
    /**
     * Setup the application, ready to run
     */
    application.prototype.init = function () {
        this.running = true;
        this.last_time = os.get_time().getTime();
        if (this.current_scene)
            this.current_scene.init();
    };
    /**
     * Run Main Loop. This is expected to be called by the OS quite frequently
     * to redraw the scene, and call update().
     */
    application.prototype.render = function () {
        if (!this.running) {
            this.current_scene.end();
            return false;
        }
        /* Get Context */
        var ctx = os.get_graphics_context();
        /* Calculate time differences for animation. */
        this.curr_time = os.get_time().getTime();
        var dt = this.curr_time - this.last_time;
        this.last_time = this.curr_time;
        /* Clear Display */
        ctx.clear(); // TODO: This function does not yet exist
        /* Draw Scene to display */
        this.current_scene.draw(ctx);
        /* Update Scene */
        this.current_scene.update(dt);
        return true;
    };
    /**
     * Set game loop to finish
     */
    application.prototype.quit = function () {
        this.running = false;
    };
    /**
     * Set/Change the scene being drawn
     */
    application.prototype.set_scene = function (new_scene) {
        if (this.current_scene)
            this.current_scene.end();
        this.current_scene = new_scene;
        this.current_scene.init();
    };
    /**
     * Register this application with the given operating system under the given
     * name
     */
    application.prototype.register_with_os = function (name, operating_system) {
        var _this = this;
        operating_system.register_application(name, function () { return _this.init(); }, function () { return _this.render(); }, function () { return _this.quit(); });
    };
    return application;
}());
/**
 * This actor displays a single sprite from a sprite sheet.
 */
var sprite = (function (_super) {
    __extends(sprite, _super);
    /**
     * Constructs the sprite from the given image, corresponding to the offset
     * position and size inside the sprite-sheet image. Expects user to set
     * position.
     */
    function sprite(image, window) {
        _super.call(this);
        this.image = image;
        this.window = window;
        this.width = this.window.w;
        this.height = this.window.h;
    }
    /** Draw the sprite. */
    sprite.prototype.draw = function (ctx) {
        // Calculate scales, so that when image is partially hidden by being
        // outside parent, part of the image is cut off, rather than the 
        // image simply being resized.
        var hscale = this.abs_width() / this.width;
        var vscale = this.abs_height() / this.height;
        ctx.drawImage(this.image, this.window.x, this.window.y, this.window.w * hscale, this.window.h * vscale, this.abs_x(), this.abs_y(), this.abs_width(), this.abs_height());
    };
    /** Update the actor. A Sprite does nothing. */
    sprite.prototype.update = function (dt) {
    };
    return sprite;
}(actor));
/**
 * Simple button. Recieves tap events when visible. Displays another actor.
 */
var button = (function (_super) {
    __extends(button, _super);
    /**
     * Make a new button out of an actor, with a given callback. Note, position
     * and size of the actor should already be set.
     */
    function button(display, callback) {
        var _this = this;
        _super.call(this);
        this.display = display;
        this.callback = callback;
        this.handler = os.add_gesture_handler(function (ev, x, y) { return _this.handle(ev, x, y); });
        this.width = display.width;
        this.height = display.height;
        this.x = display.x;
        this.y = display.y;
    }
    /** Draw the sub-actor */
    button.prototype.draw = function (ctx) {
        this.display.draw(ctx);
    };
    /** Update the sub-actor */
    button.prototype.update = function (dt) {
        this.display.update(dt);
    };
    /** Call the callback if the button was tapped (and button is active) */
    button.prototype.handle = function (ev, x, y) {
        if (this.visible
            && ev === gesture_type.tap // Tap
            && this.abs_x() < x && x < this.abs_x() + this.abs_width() // x in button
            && this.abs_y() < y && y < this.abs_y() + this.abs_height() // y in button
        ) {
            this.callback();
        }
    };
    /** Unregister the button. */
    button.prototype.finish = function () {
        os.remove_gesture_handler(this.handler);
    };
    return button;
}(actor));
/**
 * Simple filled/stroked rectangle
 */
var rect = (function (_super) {
    __extends(rect, _super);
    /**
     * Construct a rectangle with the given fillStyle, strokeStyle and lineWidth
     * as per the canvas 2d context.
     */
    function rect(fillStyle, strokeStyle, lineWidth) {
        if (lineWidth === void 0) { lineWidth = 1; }
        _super.call(this);
        this.fillStyle = fillStyle;
        this.strokeStyle = strokeStyle;
        this.lineWidth = lineWidth;
    }
    /** Draw the rect. */
    rect.prototype.draw = function (ctx) {
        ctx.strokeStyle = this.strokeStyle;
        if (this.fillStyle !== "none")
            ctx.fillStyle = this.fillStyle;
        if (this.strokeStyle !== "none")
            ctx.lineWidth = this.lineWidth;
        ctx.beginPath();
        ctx.rect(this.abs_x(), this.abs_y(), this.abs_width(), this.abs_height());
        ctx.closePath();
        if (this.fillStyle !== "none")
            ctx.fill();
        if (this.strokeStyle !== "none")
            ctx.stroke();
    };
    /** Update the actor. A rect does nothing. */
    rect.prototype.update = function (dt) {
    };
    return rect;
}(actor));
/**
 * Simple text Label. Width and Height are ignored.
 */
var label = (function (_super) {
    __extends(label, _super);
    /**
     * Construct a new label of the given string
     * Also with the given font, fillStyle (as per canvas 2d context), and alignment
     */
    function label(label, font, fill_style, text_align) {
        if (font === void 0) { font = "15px sans-serif"; }
        if (fill_style === void 0) { fill_style = "#000000"; }
        if (text_align === void 0) { text_align = "left"; }
        _super.call(this);
        this.label = label;
        this.font = font;
        this.fill_style = fill_style;
        this.text_align = text_align;
    }
    /** Draw the label. */
    label.prototype.draw = function (ctx) {
        ctx.font = this.font;
        ctx.fillStyle = this.fill_style;
        ctx.textAlign = this.text_align;
        ctx.fillText(this.label, this.abs_x(), this.abs_y());
    };
    /** Update the actor. A label does nothing. */
    label.prototype.update = function (dt) {
    };
    return label;
}(actor));
/**
 * Animate an array of actors with a given frame rate, or set the frame rate
 * to zero, and use set_frame() to select the shown actor.
 *
 * Does this using phase accumulation, like in bresenham's line drawing, or direct digital synthesis.
 * This ensures that the frame will be the correct one at the time of update, skipping frames if necessary.
 */
var animator = (function (_super) {
    __extends(animator, _super);
    /**
     * Construct an animator at the given frame rate. Give fps = 0 to disable
     * automatic frame selection, and use set_frame;
     */
    function animator(fps) {
        _super.call(this);
        this.fps = fps;
        /** List of frames */
        this.actors = [];
        this.accumulator = 0;
        this.frame = 0;
    }
    /** Add a frame */
    animator.prototype.add = function (item) {
        this.actors.push(item);
    };
    /** Draw the current frame */
    animator.prototype.draw = function (ctx) {
        if (this.actors.length === 0)
            return;
        this.actors[this.frame].draw(ctx);
    };
    /** Select current frame if fps != 0 */
    animator.prototype.update = function (dt) {
        if (this.fps === 0 || this.actors.length === 0)
            return; // Not auto animated
        this.accumulator += dt; // the total time since the current frame was meant to start.
        // Calculate the number of frames to advance
        var frames = this.accumulator / 1000 * this.fps; // div 1000 as accumulator in millisec.
        frames = Math.floor(frames);
        // Update the current frame counter
        this.set_frame((this.frame + frames) % this.actors.length);
        // Sort out the accumulator
        this.accumulator -= 1000 * frames / this.fps;
    };
    /** Set the size of all the frames */
    animator.prototype.set_size = function (w, h) {
        this.actors.forEach(function (item) {
            item.set_size(w, h);
        });
    };
    /** Set the position of all the frames */
    animator.prototype.set_position = function (x, y) {
        this.actors.forEach(function (item) {
            item.set_position(x, y);
        });
    };
    /** Set the current frame */
    animator.prototype.set_frame = function (index) {
        this.actors[this.frame].visible = false;
        this.frame = index;
        this.actors[this.frame].visible = true;
    };
    return animator;
}(actor));
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
var image_loader = (function () {
    /**
     * Constructs an Image for each item in the data, and sets it to do an async
     * load.
     */
    function image_loader(data) {
        this.data = data;
        // Make a new Image object for each item and give it the 
        // corresponding src
        for (var item in this.data) {
            this.data[item].image = os.get_image(this.data[item].src);
        }
        ;
    }
    /**
     * Get the Image for the given name in the image data.
     * This is not gauranteed to be loaded.
     */
    image_loader.prototype.get_image = function (img_name) {
        return this.data[img_name].image;
    };
    /**
     * Get the region/sprite_window structure with the given name, on the given
     * image
     */
    image_loader.prototype.get_region = function (img_name, region) {
        return this.data[img_name].regions[region];
    };
    /**
     * Construct a new sprite made from the given region of the given image.
     */
    image_loader.prototype.get_sprite = function (img_name, region) {
        return new sprite(this.data[img_name].image, this.data[img_name].regions[region]);
    };
    return image_loader;
}());
