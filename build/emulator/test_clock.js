/*
 * Test applications for emulator UI functions.
 */
/* Very Basic Clock. Closes on tap/swipe. */
var clock_application = (function () {
    function clock_application() {
    }
    // Start the application
    clock_application.prototype.init = function () {
        var _this = this;
        this.running = true;
        this.callback_id = os.add_gesture_handler(function (e, x, y) { return _this.quit(e, x, y); });
    };
    // Draw the clock
    clock_application.prototype.draw = function () {
        // If we have set the application to stop running, Quit.
        if (!this.running) {
            os.remove_gesture_handler(this.callback_id);
            return false; // Tell OS we are finished
        }
        var ctx = os.get_graphics_context();
        ctx.clear();
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, ctx.width(), ctx.height());
        var now = os.get_time();
        var date1 = now.toTimeString();
        var date2 = now.toDateString();
        var y_pos = ctx.height() / 4;
        var padding = 50;
        ctx.fillStyle = "#222222";
        ctx.fillRect(padding, y_pos + 10 - 70 / 2, ctx.width() - 2 * padding, 60);
        ctx.font = "15px Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = "#EEEEEE";
        ctx.fillText(date1, ctx.width() / 2, y_pos);
        ctx.fillText(date2, ctx.width() / 2, y_pos + 20);
        // Angles from 12, in the clockwise direction
        var second_angle = (2 * Math.PI) *
            (now.getSeconds() / 60 +
                now.getMilliseconds() / (60 * 1000));
        var minute_angle = (2 * Math.PI) * (now.getMinutes() / 60) +
            second_angle / 60;
        var hour_angle = (2 * Math.PI) * (now.getHours() / 12) +
            minute_angle / 12;
        var radius = 70;
        var minute_hand_length = 60;
        var hour_hand_length = 30;
        var mid_x = ctx.width() / 2;
        var mid_y = 2 * ctx.height() / 3;
        var draw_hand = function (len, angle) {
            ctx.beginPath();
            ctx.moveTo(mid_x - len / 10 * Math.sin(angle), mid_y + len / 10 * Math.cos(angle));
            ctx.lineTo(mid_x + len * Math.sin(angle), mid_y - len * Math.cos(angle));
            ctx.stroke();
        };
        // Seconds
        ctx.fillStyle = "#222222";
        ctx.beginPath();
        ctx.moveTo(mid_x, mid_y);
        ctx.lineTo(mid_x + radius * Math.sin(second_angle), mid_y - radius * Math.cos(second_angle));
        ctx.arc(mid_x, mid_y, radius, second_angle - 0.5 * Math.PI, 1.5 * Math.PI);
        ctx.fill();
        ctx.lineCap = "round";
        ctx.strokeStyle = "#CCCCCC";
        // Hands
        ctx.lineWidth = 2;
        draw_hand(minute_hand_length, minute_angle);
        ctx.lineWidth = 3;
        draw_hand(hour_hand_length, hour_angle);
        // Outline
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mid_x, mid_y, radius, 0, 2 * Math.PI);
        ctx.stroke();
        return true; // Keep running
    };
    // Tell the application to stop
    clock_application.prototype.quit = function (evt, x, y) {
        this.running = false;
    };
    return clock_application;
}());
/* Add application to operating system staticly inside closure */
(function () {
    var c = new clock_application();
    // Actual registration with operating system
    os.register_application("Clock", // Name
    function () { return c.init(); }, // Init function
    function () { return c.draw(); }, // Render function
    function () { return c.quit(0, 0, 0); });
})();
