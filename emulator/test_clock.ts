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
        
        ctx.clear();
        
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, ctx.width(), ctx.height());

        let now: Date = os.get_time();

        let date1 = now.toTimeString();
        let date2 = now.toDateString();

        let y_pos = ctx.height() / 4;
        
        let padding = 50;
        
        ctx.fillStyle = "#222222";
        ctx.fillRect(padding, y_pos + 10 - 70 / 2, ctx.width() - 2 * padding, 60);

        ctx.font = "15px Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = "#EEEEEE";

        ctx.fillText(date1, ctx.width() / 2, y_pos);
        ctx.fillText(date2, ctx.width() / 2, y_pos + 20);
        
        // Angles from 12, in the clockwise direction
        let second_angle = (2 * Math.PI) *
                    (now.getSeconds() / 60 +
                    now.getMilliseconds() / (60 * 1000));
        let minute_angle = (2 * Math.PI) * (now.getMinutes() / 60) +
                    second_angle / 60;
        let hour_angle = (2 * Math.PI) * (now.getHours() / 12) +
                    minute_angle / 12;
        
        let radius = 70;
        let minute_hand_length = 60;
        let hour_hand_length = 30;
        
        let mid_x = ctx.width() / 2;
        let mid_y = 2 * ctx.height() / 3;
        
        let draw_hand = function (len: number, angle: number){
            ctx.beginPath();
            ctx.moveTo(mid_x - len / 10 * Math.sin(angle),
                    mid_y + len / 10 * Math.cos(angle)); 
            ctx.lineTo(mid_x + len * Math.sin(angle),
                    mid_y - len * Math.cos(angle));
            ctx.stroke();
        };
        
        // Seconds
        ctx.fillStyle = "#222222";
        ctx.beginPath();
        ctx.moveTo(mid_x, mid_y); 
        ctx.lineTo(mid_x + radius * Math.sin(second_angle),
                    mid_y - radius * Math.cos(second_angle));
        ctx.arc(mid_x, mid_y, radius, second_angle - 0.5 * Math.PI, 1.5 * Math.PI);
        ctx.fill();
        
        ctx.lineCap = "round";
        ctx.strokeStyle = "#CCCCCC";
        // Hands
        ctx.lineWidth = "2";
        draw_hand(minute_hand_length, minute_angle);
        ctx.lineWidth = "3";
        draw_hand(hour_hand_length, hour_angle);
        
        // Outline
        ctx.lineWidth = "2";
        ctx.beginPath();
        ctx.arc(mid_x, mid_y, radius, 0, 2 * Math.PI);
        ctx.stroke();
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
        () => c.draw(),  // Render function
        () => c.quit(0, 0, 0)
        );
})();
