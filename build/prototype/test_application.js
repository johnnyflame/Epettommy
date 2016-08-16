var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var test_application = (function (_super) {
    __extends(test_application, _super);
    function test_application(name) {
        _super.call(this); // Appeal to parent class --- we must
        this.register_with_os(name, os); // Register the application with the os
        // Pre-load images
        this.sprite_img = os.get_image("prototype/resources/slime.png");
    }
    test_application.prototype.init = function () {
        var _this = this;
        // Set up the default scene
        var main_display = new scene();
        // Make a box
        var box1 = new rect("#FF5656", "#000000");
        box1.set_size(100, 100);
        box1.set_position(100, 100);
        // Put this box into a button, which will call quit when tapped
        this.button1 = new button(box1, function () { return _this.quit(); });
        // Make a new sprite
        var sprite1 = new sprite(this.sprite_img, { x: 0, y: 0, w: 95, h: 95 });
        sprite1.set_position(10, 10);
        // Turn it into a button to switch scenes
        this.button2 = new button(sprite1, function () { return _this.swap_scenes(); });
        // Add the buttons to the display
        main_display.add(this.button1);
        main_display.add(this.button2);
        // Add an expanatory label
        var label1 = new label("Click the image to change scene");
        label1.set_position(20, 250);
        main_display.add(label1);
        // And another
        var label2 = new label("Red box to quit");
        label2.set_position(20, 280);
        main_display.add(label2);
        // Set the main_display to be the current scene
        this.current_scene = main_display;
        // Make a second scene
        this.other_scene = new scene();
        // Add a different rectange
        var box2 = new rect("#5050FF", "#114411");
        box2.set_position(10, 10);
        box2.set_size(300, 300);
        this.other_scene.add(box2);
        // Add the same switch button
        this.other_scene.add(this.button2);
        // Add the same label
        this.other_scene.add(label1);
        // Make a new sprite
        var sprite2 = new sprite(this.sprite_img, { x: 95, y: 0, w: 95, h: 95 });
        sprite2.set_position(200, 100);
        this.other_scene.add(sprite2);
        // Appeal to the parent class to sort it out
        _super.prototype.init.call(this);
    };
    // Swap the two scenes of this class
    test_application.prototype.swap_scenes = function () {
        var tmp = this.other_scene;
        this.other_scene = this.current_scene;
        this.set_scene(tmp);
    };
    // Quit the application, remembering to clear the button
    test_application.prototype.quit = function () {
        _super.prototype.quit.call(this);
        this.button1.finish();
    };
    return test_application;
}(application));
// Wrap in a closure, and make an instance, which registers itself with the os
(new test_application("Test Application"));
