/*
 * Test applications for emulator UI functions.
 */

/* Very Basic Clock. Closes on tap/swipe. */
class clock_application {

    // Is the application still running
    private running: boolean;
    
    // Identifier to unload gesture callback
    private callback_id: any;

    // Start the application
    public init(): void {
        this.running = true;
        this.callback_id = os.add_gesture_handler ((e: any, x: number, y: number) => this.quit(e, x, y));
    }

    // Draw the clock
    public draw(): boolean {
        
        // If we have set the application to stop running, Quit.
        if (!this.running) {
            os.remove_gesture_handler (this.callback_id);
            return false; // Tell OS we are finished
        }
        
        let ctx: graphics_context = os.get_graphics_context();
        
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
 
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        let now: Date = os.get_time();

        let date1 = now.toTimeString();
        let date2 = now.toDateString();

        ctx.fillText(date1, ctx.canvas.width / 2, ctx.canvas.height / 3);
        ctx.fillText(date2, ctx.canvas.width / 2, 2 * ctx.canvas.height / 3);
        
        return true; // Keep running

    }
    
    // Tell the application to stop
    public quit(evt: any, x: number, y: number) {
        this.running = false;
    }
}

/* Add application to operating system staticly inside closure */
(function () {
    let c = new clock_application();
    
    // Actual registration with operating system
    os.register_application(
            "Clock", // Name
            () => c.init(), // Init function
            () => c.draw() // Render function
        );
})();
