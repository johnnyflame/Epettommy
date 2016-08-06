/**
 * Emulator internals. Contains the API as well as the emulator UI.
 * 
 * This contains several classes
 * 
 *  - The emulator class. The public methods on this define the public interface
 *  for an application running inside the emulator.
 *  - The emulator_ui class. This is the internal workings of the emulator's
 *  "operating system" user interface, and is responsible for loading applications
 *  - The emulator_storage class, which is how the application can access 
 *  persistant storage on the smart watch.
 * 
 */
 
/** Available gesture types. */
enum gesture_type {tap, swipeup, swipedown, swipeleft, swiperight}

/** Type for gesture callback functions */
type gesture_callback = (g: gesture_type, x: number, y: number) => void;
/** callback identifers to unregister a callback later */
type gesture_callback_id = number;

type Image = any;

/* Local Storage Class. Stores an object by converting it to a JSON string
 * and storing it in the browser's local storage. Note: this cannot store functions */
interface emulator_storage_connection {

    /* Add/Set the given value/object to be stored at the given key. */
    set_object(key: string, value: any): void;
    /* Retrieve the object in local storage corresponding to the given key. */
    get_object(key: string): any;
}

/**
 * Graphics context type.
 * 
 * Internally, this is a slightly modified CanvasContext2D object, hence for
 * further information on how the functions work, the canvas documentation can
 * be consulted
 */
interface graphics_context {
    
    /**
     * The line width used for any stroke operations
     */
    lineWidth: number;
    
    /**
     * The linecap style of any stroking,
     * 
     * Valid options are "round" and "square"
     */
    lineCap: string;
    
    /**
     * The colour/style of any filling.
     * 
     * The colour can be in HTML form, e.g. "#FF0000" for red, or in rgba form,
     * e.g. "rgba(0.1, 0.2, 0.3, 0.6)". Other css styles are also supported.
     */
    fillStyle: string | any;
    
    /**
     * The colour/style of any stroking/lines.
     * 
     * The colour can be in HTML form, e.g. "#FF0000" for red, or in rgba form,
     * e.g. "rgba(0.1, 0.2, 0.3, 0.6)". Other css styles are also supported.
     */
    strokeStyle: string | any;
    
    /**
     * The type face for any text.
     * 
     * E.g. "15px sans-serif" for a font of 15px size, in a sans-serif font.
     */
    font: string;
    
    /**
     * Allignment of text relative to defined position.
     * 
     * Options are "right", "left", "center", which put the specified text 
     * coordinate at the given position relative to the text.
     */
    textAlign: string;
    
    /**
     * Secify a rectange at the positon (x,y) with the given width and height,
     * and fill it with the current style.
     */
    fillRect(x: number, y: number, width: number, height: number): void;
    
    /**
     * Secify a rectange at the positon (x,y) with the given width and height,
     * as part of the current path
     */
    rect(x: number, y: number, width: number, height: number): void;

    /**
     * Place text at the given position (x,y) and fill it with the current 
     * style.
     */
    fillText(test: string, x: number, y: number): void;
    
    /**
     * Clear the screen.
     */
    clear(): void;
    
    /**
     * Draw an image on the screen at the given position, and the given size.
     * The optional img_ position and hight specify a subsection of the given
     * image to actually draw.
     */
    drawImage(img: Image, x: number, y: number, width: number, height: number, 
        img_x?: number, img_y?: number,
        img_width?: number, img_height?: number): void;
    
    /**
     * Begin drawing a path
     */
    beginPath(): void;
    
    /**
     * Finish drawing a path
     */
    closePath(): void;
    
    /**
     * Stroke the current path with the current strokeStyle.
     */
    stroke(): void;
    /**
     * Fill the current path with the current fillStyle.
     */
    fill(): void;
    
    /**
     * Get the screen width.
     */
    width(): number;
    /**
     * Get the screen height.
     */
    height(): number;
    
    /**
     * Move the current pointer to the given position when drawing a path.
     */
    moveTo(x: number, y: number): void;
    /**
     * Add a line from the current pointer to the given position into the
     * current path
     */
    lineTo(x: number, y: number): void;
    
    /**
     * Add an arc centered a the position (x,y) with the given radius to the
     * current path. The start and end angles are defined with 0 on the positive
     * x axis, and positive angle is clockwise.
     */
    arc(x: number, y: number, radius: number, start_angle: number, finish_angle: number): void;
}



/*
 * Main emulator API.
 */
interface emulator {

    /* Get a CanvasRenderingContext2D which can draw on the display.
     * 
     * TODO: do we need to change this to our own context type?
     */
    get_graphics_context(): graphics_context;

    /**
     * Get the emulator's persistant storage.
     */
    get_local_storage(): emulator_storage_connection;

    /**
     * Add a handler for gestures. Uses the given callback in the context 
     * of the given object
     */
    add_gesture_handler(callback: gesture_callback): gesture_callback_id;

    /**
     * Remove/unset a handler for gestures. Must provide the returned value
     * from the corresponding call to add_gesture_handler
     */
    remove_gesture_handler(callback_id: gesture_callback_id): void;

    /**
     * Gets the current time in a Date object.
     * Note that this may be different from a new Date(), as the emulator is
     * capable of changing the rate of time passage using this function.
     * 
     * @return A date object with the "current" time
     */
    get_time (): Date;
    
    /**
     * Logs the given string for debugging purposes.
     * @param log_text Logging message
     */
    log (log_text: string): void;
    
    /**
     * Gets an image from the specified source for use with the grapics context.
     * @param src The source URL with respect to the root directory of the
     * emulator.
     * 
     * The image is not guranteed to be loaded immediately, but this function
     * will return a valid object immediately.
     */
    get_image(src: string): Image;

    /**
     * Register an application with the emulator
     * 
     * @param start_callback will be called to initilize the application.
     * @param render_callback will be called to redraw/update the display periodically
     * (each frame). render_callback should return true if the application is to
     * continue, else control will be returned to the operating system. The
     * application can still reciever gesture notifications after returning false,
     * so these must be cleaned up first if this is not desired.
     * @param home_callback should cause the application to exit
     */
    register_application (
        name: string,
        start_callback: () => void,
        render_callback: () => boolean,
        home_callback: () => void
    ): void;
}


/**
 * This global represents how an application should access the emulator/smartwatch
 * 
 * Applications may take it for granted that this will be defined.
 * 
 */
declare var os: emulator;