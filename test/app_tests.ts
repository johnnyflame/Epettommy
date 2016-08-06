
class null_actor extends actor {
    update() {};
    draw(ctx: graphics_context) {};
}

QUnit.test("Prototype Application: Game Physics", function(assert: any) {
    
    let a1 = new null_actor();
    let a2 = new null_actor();
    let target = new game_physics();
    
    a1.set_position(0, 0);
    a1.set_size(0, 0);
    a2.set_position(2, 0);
    a2.set_size(0, 0);
    assert.deepEqual(target.is_left(a1, a2), true, "Simple Left");
    assert.deepEqual(target.is_left(a2, a1), false, "Simple Right");
    a2.set_position(0, 0);
    assert.deepEqual(target.is_left(a1, a2), false, "Simple Overlap");
    
    a1.set_position(0, 0);
    a1.set_size(10, 10);
    a2.set_position(1, 0);
    a2.set_size(10, 10);
    assert.deepEqual(target.is_left(a1, a2), true, "Cover Left");
    assert.deepEqual(target.is_left(a2, a1), false, "Cover Right");
    a2.set_position(0, 0);
    assert.deepEqual(target.is_left(a1, a2), false, "Cover Overlap");
    
    a1.set_position(0, 0);
    a1.set_size(10, 10);
    a2.set_position(1, 0);
    a2.set_size(5, 5);
    assert.deepEqual(target.is_left(a1, a2), false, "Mid Left");
    assert.deepEqual(target.is_left(a2, a1), true, "Mid Right");
    
    a1.set_position(0, 0);
    a1.set_size(0, 0);
    a2.set_position(0, 1);
    a2.set_size(0, 0);
    assert.deepEqual(target.is_above(a1, a2), true, "Simple Above");
    assert.deepEqual(target.is_above(a2, a1), false, "Simple Below");
    a2.set_position(0, 0);
    assert.deepEqual(target.is_above(a1, a2), false, "Simple Overlap");
    
    a1.set_position(0, 0);
    a1.set_size(10, 10);
    a2.set_position(1, 1);
    a2.set_size(10, 10);
    assert.deepEqual(target.is_above(a1, a2), true, "Cover Above");
    assert.deepEqual(target.is_above(a2, a1), false, "Cover Below");
    a2.set_position(0, 0);
    assert.deepEqual(target.is_above(a1, a2), false, "Cover Overlap");
    
    a1.set_position(0, 0);
    a1.set_size(10, 10);
    a2.set_position(1, 1);
    a2.set_size(5, 5);
    assert.deepEqual(target.is_above(a1, a2), false, "Mid Above");
    assert.deepEqual(target.is_above(a2, a1), true, "Mid Below");


    a1.set_position(0, 0);
    a1.set_size(10, 10);
    a2.set_position(1, 1);
    a2.set_size(10, 10);
    
    assert.deepEqual(target.colliding(a1, a1), true, "Collision Self");
    assert.deepEqual(target.colliding(a1, a2), true, "Collision Large Overlap");
    assert.deepEqual(target.colliding(a2, a1), true, "Collision Large Overlap Reverse");
    
    a2.set_position(10, 0);
    
    assert.deepEqual(target.colliding(a1, a2), true, "Collision Boundary");
    assert.deepEqual(target.colliding(a2, a1), true, "Collision Boundary Reverse");
    
    a2.set_position(0, 10);
    assert.deepEqual(target.colliding(a1, a2), true, "Collision Vertical Boundary");
    assert.deepEqual(target.colliding(a2, a1), true, "Collision Vertical Boundary Reverse");
    
    a2.set_position(11, 0);
    assert.deepEqual(target.colliding(a1, a2), false, "No Collision ");
    assert.deepEqual(target.colliding(a2, a1), false, "No Collision Reverse");
    
    a2.set_position(0, 11);
    assert.deepEqual(target.colliding(a1, a2), false, "No Collision Vertical");
    assert.deepEqual(target.colliding(a2, a1), false, "No Vertical Reverse");
    
    a2.set_position(11, 0);
    assert.deepEqual(target.directly_above(a1, a2), false, "Directly Above: Side");
    assert.deepEqual(target.directly_above(a2, a1), false, "Directly Above: Other Side");

    a2.set_position(0, 10);
    assert.deepEqual(target.directly_above(a2, a1), true, "Directly Above: Above");
    assert.deepEqual(target.directly_above(a1, a2), true, "Directly Above: Below"); 
});

QUnit.test("Prototype Application: Player Model", function(assert: any) {
    let target = new tommy_model();
    
    // Redirect tommy data so we don't modify existing player information
    let unsafe: any = target;
    unsafe.tommy_state_key = "unit_test_tommy";
    
    let reset = function () {
        target.set_health(0.5);
        target.set_hunger(0.5);
        target.set_emotion(0.5);
        target.set_strength(0.5);
    };
    
    reset();
    target.feed(0.1);
    assert.ok(target.get_hunger() > 0.5, "Feed Increases Hunger Stat");
    assert.ok(target.get_health() > 0.5, "Good Feed Increases Health Stat");
    assert.ok(target.get_emotion() < 0.5, "Good Feed Decreases Emotion Stat");
    
    reset();
    target.feed(0.5);
    assert.ok(target.get_hunger() > 0.5, "Feed Increases Hunger Stat");
    assert.ok(target.get_health() < 0.5, "Bad Feed Decreases Health Stat");
    assert.ok(target.get_emotion() > 0.5, "Bad Feed Increses Emotion Stat");
    
    reset();
    target.play();
    assert.ok(target.get_emotion() > 0.5, "Play Increases Emotion Stat");

});