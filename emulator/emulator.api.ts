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
 
/* Available gesture types. */
enum gesture_type {tap, swipeup, swipedown, swipeleft, swiperight}

/* Type for gesture callback functions */
type gesture_callback = (g: gesture_type, x: number, y: number) => void;
/* callback identifers to unregister a callback later */
type gesture_callback_id = number;

/* Graphics context type. Currently this is actually a modified CanvasRenderingContext2D */
type graphics_context = any; // TODO: fix this situation


/* Local Storage Class. Stores an object by converting it to a JSON string
 * and storing it in the browser's local storage. Note: this cannot store functions */
interface emulator_storage_connection {

    /* Add/Set the given value/object to be stored at the given key. */
    set_object(key: string, value: any): void;
    /* Retrieve the object in local storage corresponding to the given key. */
    get_object(key: string): any;
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

    /*
     * Get the emulator's persistant storage.
     */
    get_local_storage(): emulator_storage_connection;

    /*
     * Add a handler for gestures. Uses the given callback in the context 
     * of the given object
     */
    add_gesture_handler(callback: gesture_callback): gesture_callback_id;

    /*
     * Remove/unset a handler for gestures. Must provide the returned value
     * from the corresponding call to add_gesture_handler
     */
    remove_gesture_handler(callback_id: gesture_callback_id): void;

    /*
     * Gets the current time in a Date object.
     */
    get_time (): Date;

    /*
     * Register an application with the emulator
     * 
     * start_callback will be called to initilize the application.
     * render_callback will be called to redraw/update the display periodically
     * (each frame). render_callback should return true if the application is to
     * continue, else control will be returned to the operating system. The
     * application can still reciever gesture notifications after returning false,
     * so these must be cleaned up first if this is not desired.
     */
    register_application (
        name: string,
        start_callback: () => void,
        render_callback: () => boolean,
        home_callback: () => void
    ): void;
}

/*
 * This global represents how an application should access the emulator/smartwatch
 * 
 * Applications may take it for granted that this will be defined.
 * 
 */
declare var os: emulator;