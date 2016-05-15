/**
 * Emulator internals. Contains the API as well as the emulator UI.
 */

/* Available gesture types. */
declare enum gesture_type {tap, swipeup, swipedown, swipeleft, swiperight}
type gesture_callback = (g:gesture_type, x:number, y:number)=>void;
type gesture_callback_id = number;
type graphics_context = any; // TODO: fix this situation


/* Local Storage Class. Stores an object by converting it to a JSON string
 * and storing it in the browser's local storage. Note: this cannot store functions */
interface emulator_storage_connection{

    /* Add/Set the given value/object to be stored at the given key. */
    set_object(key: string, value: any) : void;    
    /* Retrieve the object in local storage corresponding to the given key. */
    get_object(key: string) : any;
}


/*
 * Main emulator API.
 */

interface emulator {

    /* Initialize and start the smart watch.
     * This should never be called by an application */
    //public init(canvas_id:string)
    
    /* Get a CanvasRenderingContext2D which can draw on the display.
     * 
     * TODO: do we need to change this to our own context type?
     */
    get_graphics_context() : graphics_context;
    
    /*
     * Get the emulator's persistant storage.
     */
    get_local_storage(): emulator_storage_connection;
    
    /*
     * Add a handler for gestures. Uses the given callback in the context 
     * of the given object
     */    
    add_gesture_handler(callback:gesture_callback): gesture_callback_id;

    /*
     * Remove/unset a handler for gestures. Must provide the returned value
     * from the corresponding call to add_gesture_handler
     */    
    remove_gesture_handler(callback_id: gesture_callback_id) : void;

    /*
     * Gets the current time in a Date object.
     */
    get_time () : Date;
    
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
        name:string,
        start_callback: ()=> void,
        render_callback: () => boolean
    ) : void;
}

declare var os : emulator