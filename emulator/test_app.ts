/*
 * Test applications for emulator UI functions.
 */

/* Very Basic Clock. Closes on tap/swipe. */
class clock_application {

    private running: boolean;
    private callback_id : any;

    public init() {
        this.running = true;
        this.callback_id = os.add_gesture_handler ((e:any,x:number,y:number) =>this.quit(e,x,y));
    }

    public draw() : boolean {
        
        if(!this.running){
            os.remove_gesture_handler (this.callback_id);
            return false; // Tell OS we are finished
        }
        
        let ctx :graphics_context = os.get_graphics_context();
        
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
 
        ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);

        let now : Date = os.get_time();

        let date1 = now.toTimeString();
        let date2 = now.toDateString();

        ctx.fillText(date1, ctx.canvas.width/2, ctx.canvas.height/3);
        ctx.fillText(date2, ctx.canvas.width/2, 2*ctx.canvas.height/3);
        
        return true; // Keep running

    }
    
    public quit(evt:any,x:number,y:number){
        this.running = false;
    }
}

/* Add application to operating system staticly inside closure */
(function () {
    let c = new clock_application();
os.register_application(
        "Clock", //Name
        () => c.init(), // Init function
        () => c.draw() // Render function
    );
})();

/* Add application to operating system staticly inside closure */
(function () {
    let c = new clock_application();
os.register_application(
        "Clock 2", //Name
        () => c.init(), // Init function
        () => c.draw() // Render function
    );
})();