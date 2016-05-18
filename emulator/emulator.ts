/**
 * Emulator internals. Contains the API as well as the emulator UI.
 */

// Include definitions
/// <reference path="emulator.api.ts"/>

/* Library Declaration */
declare var Hammer: any;

/* Local Storage Class. Stores an object by converting it to a JSON string
 * and storing it in the browser's local storage. */
class emulator_storage {

    /* Update the table displaying the local storage */
    private update_table () {
        /* Access the HTML table.*/
        /* Retrieve from localStorage and output in HTML table. */

        let data: string = "<tr><th>Key</th><th>Value</th></tr>";

        for (let key in localStorage) {
            data += "<tr><td>" + key + "</td><td>" + localStorage[key] + "</td></tr>";
        }

        document.getElementById("data_table").innerHTML = data;
    }

    /* Add/Set the given value/object to be stored at the given key. */
    public set_object (key: string, value: any): void {
        localStorage.setItem(key, JSON.stringify(value));
    }

    /* Retrieve the object in local storage corresponding to the given key. */
    public get_object(key: string): any {
        let value = localStorage.getItem(key);
        return value && JSON.parse(value);
    }
}

/* Container Class for application information inside the emulator. This is 
 * generated by emulator.register_application, where the purposes are defined.
 */
class registered_application {
    constructor(public name: string, public start_callback: () => void,
    public render_callback: () => boolean) {
    }
}

/* Emulator user interface class. */
class emulator_ui {
    // Applpications that are registered with the emulator
    public app_list: registered_application [];
    // Index of currently displayed application
    private current_app: number;
    // The canvas on which this UI is being drawn
    private canvas: HTMLCanvasElement;
    // Even callback reference for removal, and readdition
    private gest_call_ref: gesture_callback_id;

    /* Construct this emulator ui */
    constructor() {
        this.current_app = 0;
        this.app_list = [];
    }

    /* Connect UI to a canvas for display */
    set_display (display: HTMLCanvasElement) {
        this.canvas = display;
    }

    /* Initialize the UI */
    init () {
        this.gest_call_ref = os.add_gesture_handler(
                (e: any, x: number, y: number) => this.gest_handle(e, x, y)
            ); // This anon function creates a closure so that `this` is a sensible value
        this.draw();
    }

    /* Draw the application name of the current application to screen */
    draw() {
        let ctx: CanvasRenderingContext2D = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.app_list[this.current_app].name, this.canvas.width / 2, this.canvas.height / 2);
    }


    /* Change the current application on swipe, and call the (blocking) callback 
     * when tapped.
     */
    gest_handle(evt: gesture_type, x: number, y: number) {
        switch (evt) {
            // Go to next app
        case gesture_type.swipeleft:
            this.current_app = (this.current_app + 1) % this.app_list.length;
            this.draw();
            break;

            // Go to previous app
        case gesture_type.swiperight:
            this.current_app --;
            if (this.current_app < 0)
                this.current_app = this.app_list.length - 1;
            this.draw();
            break;

            // Start current app
        case gesture_type.tap:
            /*  First unregister UI click/swipe handlers */
            os.remove_gesture_handler(this.gest_call_ref);

            /* Call application to start, and then set set it to be rendered. */
            this.app_list[this.current_app].start_callback();
            let unsafe: any = os; // Remove type checking on the interface to access render_function directly
            unsafe.render_function = this.app_list[this.current_app].render_callback;
        }
    }
}



/*
 * Main emulator API. Also contains init logic.
 */

class emulator implements emulator {

    // Emulator display canvas
    private display: HTMLCanvasElement;
    // Emulator UI instance
    private ui: emulator_ui;
    // List of gesture callbacks
    private gesture_handlers: gesture_callback[];
    // Gesture interpreter object - third party library
    private gesture_interpreter: any;
    // Current Renderer
    render_function: Function;

    /* Construct the smart watch */
    constructor() {
        this.gesture_handlers = [];
        this.ui = new emulator_ui();
    }

    /* Initialize and start the smart watch */
    public init(canvas_id: string) {
        this.display = <HTMLCanvasElement> document.getElementById(canvas_id);

        this.ui.set_display(this.display);
        this.ui.init();

        this.gesture_interpreter = new Hammer(this.display, {preset: ["swipe", "tap"]});
        /* This wrapper lets us keep the `this` context correct to this object */
        let call_ref = ((e: any) => this.internal_gesture_reciever(e));
        /* Register to all the gestures we want */
        this.gesture_interpreter.on("tap", call_ref);
        this.gesture_interpreter.on("swipeup", call_ref);
        this.gesture_interpreter.on("swipedown", call_ref);
        this.gesture_interpreter.on("swipeleft", call_ref);
        this.gesture_interpreter.on("swiperight", call_ref);
        this.gesture_interpreter.get("swipe").set({ direction: Hammer.DIRECTION_ALL });

        // Make an initial call to set up render callbacks
        this.call_render();
    }

    /* Get a CanvasRenderingContext2D which can draw on the display.
     * 
     * TODO: do we need to change this to our own context type?
     */
    public get_graphics_context(): graphics_context {
        return this.display.getContext("2d");
    }

    private call_render(): void {
        // Make sure the emulator gets the next frame
        requestAnimationFrame(() => this.call_render());
        let result: boolean;

        // Tell the application to render
        if (this.render_function) {
            result  = this.render_function();

            // If the application says it no longer needs to render
            // i.e. is finished
            if (!result) {
                // Clear render function
                this.render_function = undefined;
                // Start back up UI
                this.ui.init();
            }
        }
    }

    /*
     * Get the emulator's persistant storage.
     */
    public get_local_storage(): emulator_storage {
        return new emulator_storage();
    }

    /*
     * Add a handler for gestures. Uses the given callback in the context 
     * of the given object
     */    
    public add_gesture_handler(callback: gesture_callback): gesture_callback_id {
        return this.gesture_handlers.push(callback) - 1; 
    }

    /*
     * Remove/unset a handler for gestures. Must provide the returned value
     * from the corresponding call to add_gesture_handler
     */    
    public remove_gesture_handler(callback_id: gesture_callback_id) {
        this.gesture_handlers[callback_id] = undefined;
        // TODO: this implementation could cause a memory leak
    }

    /*
     * Recieves gesture events from Hammer Library, then sends them through the array.
     */
    private internal_gesture_reciever(ev: any) {
        console.log("Event --- " + JSON.stringify(ev));
        switch (ev.type) {
        case "tap":
            this.gesture_handlers.forEach(function (item){
                if (item)
                    item(gesture_type.tap, ev.center.x, ev.center.y);
            });
            break;
        case "swipeup":
            this.gesture_handlers.forEach(function (item){
                if (item)
                    item(gesture_type.swipeup, ev.center.x, ev.center.y);
            });
            break;
        case "swipedown":
            this.gesture_handlers.forEach(function (item){
                if (item)
                    item(gesture_type.swipedown, ev.center.x, ev.center.y);
            });
            break;
        case "swipeleft":
            this.gesture_handlers.forEach(function (item){
                if (item)
                    item(gesture_type.swipeleft, ev.center.x, ev.center.y);
            });
            break;
        case "swiperight":
            this.gesture_handlers.forEach(function (item){
                if (item)
                    item(gesture_type.swiperight, ev.center.x, ev.center.y);
            });
            break;

        }
    }

    /*
     * Gets the current time in a Date object.
     */
    public get_time (): Date {
        return new Date();
    }

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
    public register_application (name: string, start_callback: () => void, render_callback: () => boolean) {
        this.ui.app_list.push(new registered_application (name, start_callback, render_callback));
    }
}

/* Make global emulator instance */
os  = new emulator();