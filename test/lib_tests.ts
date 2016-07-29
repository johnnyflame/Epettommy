/*
 * Application Library Unit Tests
 */

declare var QUnit: any;

class dummy extends actor {
    
    draw_count = 0;
    update_count = 0;
    
    draw(ctx: graphics_context) {
        this.draw_count ++;
    }
    
    update(dt: number) {
        this.update_count ++;
    }

}


QUnit.test("Application Lib: Actor", function(assert: any) {
    // Get storage
    let test_actor = new dummy ();
    test_actor.set_position(3, 4);
    test_actor.set_size(30, 40);
    
    assert.deepEqual(test_actor.abs_x(), 3, "No parent x position");
    assert.deepEqual(test_actor.abs_y(), 4, "No parent y position");
    assert.deepEqual(test_actor.abs_width(), 30, "No parent width");
    assert.deepEqual(test_actor.abs_height(), 40, "No parent height");
    
    let test_parent = new dummy ();
    test_parent.set_position(3, 4);
    test_parent.set_size(30, 40);
    test_actor.parent = test_parent;
    
    assert.deepEqual(test_actor.abs_x(), 6, "With parent x position");
    assert.deepEqual(test_actor.abs_y(), 8, "With parent y position");
    assert.deepEqual(test_actor.abs_width(), 30 - 3, "With parent width");
    assert.deepEqual(test_actor.abs_height(), 40 - 4, "With parent height");
    
    test_parent.set_size(10, 20);
    assert.deepEqual(test_actor.abs_width(), 10 - 3, "Smaller parent width");
    assert.deepEqual(test_actor.abs_height(), 20 - 4, "Smaller parent height");
    
    test_parent.set_size(100, 200);
    assert.deepEqual(test_actor.abs_width(), 30, "Larger parent width");
    assert.deepEqual(test_actor.abs_height(), 40, "Larger parent height");
});

QUnit.test("Application Lib: Scene", function(assert: any) {
    // Get storage
    let test_scene = new scene ();
    let test_actor = new dummy ();
    
    test_scene.add(test_actor);
    
    test_scene.draw(new Object());
    assert.deepEqual(test_actor.draw_count, 1, "Draw Single");
    
    test_scene.update(0);
    assert.deepEqual(test_actor.update_count, 1, "Update Single");
    
    let test_actor2 = new dummy ();
    test_scene.add(test_actor2);
    
    test_scene.draw(new Object());
    assert.ok(test_actor.draw_count === 2 && test_actor2.draw_count === 1, "Draw Multiple");
    
    test_scene.update(0);
    assert.ok(test_actor.update_count === 2 && test_actor2.update_count === 1, "Update Multiple");
    
    test_scene.init();
    assert.ok(test_actor.visible && test_actor2.visible, "Init to visible");
    
    test_scene.end();
    assert.ok(!test_actor.visible && !test_actor2.visible, "End - not visible");
});

QUnit.test("Application Lib: Application", function(assert: any) {
    let test_app = new application();
    let test_scene = new scene ();
    let test_actor = new dummy ();
    
    test_scene.add(test_actor);
    test_app.set_scene(test_scene);
    test_app.init();
    assert.ok(test_app.render(), "Render");
    assert.deepEqual(test_actor.draw_count, 1, "Draw scene");
    assert.deepEqual(test_actor.update_count, 1, "Update scene");
    
    test_app.quit();
    assert.notOk(test_app.render(), "Render on quit");
    assert.deepEqual(test_actor.draw_count, 1, "Not draw scene");
    assert.deepEqual(test_actor.update_count, 1, "Not update scene");
});

QUnit.test("Application Lib: Button", function(assert: any) {
    let push_count = 0;
    let test_actor = new dummy ();
    test_actor.set_position(0, 0);
    test_actor.set_size(10, 10);
    
    let test_button = new button (test_actor, () => push_count ++);
    test_button.visible = true;
    
    let unsafe: any = test_button; // Access a private method
    unsafe.handle(gesture_type.tap, 5, 5);
    assert.deepEqual(push_count, 1, "Visible Tap");
    
    test_button.visible = false;
    unsafe.handle(gesture_type.tap, 5, 5);
    assert.deepEqual(push_count, 1, "Invisible Tap");
    
    test_button.visible = true;
    unsafe.handle(gesture_type.tap, 5, 11);
    unsafe.handle(gesture_type.tap, 11, 5);
    unsafe.handle(gesture_type.tap, -1, 5);
    unsafe.handle(gesture_type.tap, 5, -1);
    assert.deepEqual(push_count, 1, "Outside Taps");
        
    test_button.draw(new Object());
    assert.deepEqual(test_actor.draw_count, 1, "Draw");
    
    test_button.update(0);
    assert.deepEqual(test_actor.update_count, 1, "Update");
    
    test_button.finish();
});

QUnit.test("Application Lib: Animator", function(assert: any) {
    let test_animator = new animator (1);
    let test_actor = new dummy ();
    let test_actor2 = new dummy ();
    
    test_animator.add(test_actor);
    test_animator.add(test_actor2);
    
    test_animator.draw(new Object());
    assert.deepEqual(test_actor.draw_count, 1, "First frame init");
    
    test_animator.update(0.5 * 1000);
    test_animator.draw(new Object());
    assert.deepEqual(test_actor.draw_count, 2, "Small change");
    
    test_animator.update(0.5 * 1000);
    test_animator.draw(new Object());
    assert.deepEqual(test_actor2.draw_count, 1, "Second frame");
    
    test_animator.update(2.3 * 1000);
    test_animator.draw(new Object());
    assert.deepEqual(test_actor2.draw_count, 2, "Wrap back onto frame");
    
    // Static Animator
    test_animator = new animator (0);
    test_actor = new dummy ();
    test_actor2 = new dummy ();
    test_animator.add(test_actor);
    test_animator.add(test_actor2);
    
    test_animator.draw(new Object());
    assert.deepEqual(test_actor.draw_count, 1, "First frame init");
    
    test_animator.update(1.5 * 1000);
    test_animator.draw(new Object());
    assert.deepEqual(test_actor.draw_count, 2, "Time Change");
    
    test_animator.set_frame(1);
    test_animator.draw(new Object());
    assert.ok(test_actor.draw_count === 2 && test_actor2.draw_count === 1, "Frame Change");

    assert.ok(!test_actor.visible && test_actor2.visible, "Visibilities");
});