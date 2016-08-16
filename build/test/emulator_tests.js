/*
 * Emulator Unit Tests
 */
QUnit.test("Emulator: Storage", function (assert) {
    // Get storage
    var store = os.get_local_storage();
    assert.ok(store, "Loading Storage");
    store.remove_object("idontexist");
    // Test for undefined value
    assert.deepEqual(store.get_object("idontexist"), null, "Empty Test Value");
    // Test string storage
    store.set_object("idontexist", "idoexist");
    assert.deepEqual(store.get_object("idontexist"), "idoexist", "Unable to retain string storage.");
    // Test struct storage
    var val = { test: true, index: 1987649876 };
    store.set_object("idontexist", val);
    assert.deepEqual(store.get_object("idontexist"), val, "Unable to retain object storage.");
    // Remove
    store.remove_object("idontexist");
    assert.deepEqual(store.get_object("idontexist"), null, "Unable to remove.");
});
QUnit.test("Emulator: Gesture Callbacks", function (assert) {
    // Set up
    var i = 0;
    var expected = 0;
    var inc = function (a, b, c) { i++; };
    // add test handler
    var handle = os.add_gesture_handler(inc);
    assert.equal(i, expected, "Error with add.");
    // Get unsafe/untyped emulator to access private functions
    var unsafe = os;
    // Send events and test for callback
    unsafe.internal_gesture_reciever({ type: "tap", center: { x: 0, y: 0 } });
    expected++;
    assert.equal(i, expected, "Error with recieving tap.");
    unsafe.internal_gesture_reciever({ type: "swipeleft", center: { x: 0, y: 0 } });
    expected++;
    assert.equal(i, expected, "Error with recieving swipeleft.");
    unsafe.internal_gesture_reciever({ type: "swiperight", center: { x: 0, y: 0 } });
    expected++;
    assert.equal(i, expected, "Error with recieving swiperight.");
    unsafe.internal_gesture_reciever({ type: "swipeup", center: { x: 0, y: 0 } });
    expected++;
    assert.equal(i, expected, "Error with recieving swipeup.");
    unsafe.internal_gesture_reciever({ type: "swipedown", center: { x: 0, y: 0 } });
    expected++;
    assert.equal(i, expected, "Error with recieving swipedown.");
    unsafe.internal_gesture_reciever({ type: "bogus_event", center: { x: 0, y: 0 } });
    assert.equal(i, expected, "Recieved Bogus event.");
    // Now unregister, and make sure we don't get calls
    os.remove_gesture_handler(handle);
    assert.equal(i, expected, "Recieving call on remove.");
    unsafe.internal_gesture_reciever({ type: "tap", center: { x: 0, y: 0 } });
    assert.equal(i, expected, "Recieving tap when removed.");
    unsafe.internal_gesture_reciever({ type: "swipeleft", center: { x: 0, y: 0 } });
    assert.equal(i, expected, "Recieving swipeleft when removed.");
    unsafe.internal_gesture_reciever({ type: "swiperight", center: { x: 0, y: 0 } });
    assert.equal(i, expected, "Recieving swiperight when removed.");
    unsafe.internal_gesture_reciever({ type: "swipeup", center: { x: 0, y: 0 } });
    assert.equal(i, expected, "Recieving swipeup when removed.");
    unsafe.internal_gesture_reciever({ type: "swipedown", center: { x: 0, y: 0 } });
    assert.equal(i, expected, "Recieving swipedown when removed.");
    unsafe.internal_gesture_reciever({ type: "bogus_event", center: { x: 0, y: 0 } });
    assert.equal(i, expected, "Recieved Bogus event when removed.");
});
