/**
 * Emulator Interface.
 *
 * This contains several interfaces
 *
 *  - The emulator interface. The public methods on this define the public interface
 *  for an application running inside the emulator.
 *  - The graphics context for drawing on the watch screen.
 *  - The emulator_storage class, which is how the application can access
 *  persistant storage on the smart watch.
 *
 */
/** Available gesture types. */
var gesture_type;
(function (gesture_type) {
    /** Single tap. */
    gesture_type[gesture_type["tap"] = 0] = "tap";
    /** Swipe upwards. */
    gesture_type[gesture_type["swipeup"] = 1] = "swipeup";
    /** Swipe downwards. */
    gesture_type[gesture_type["swipedown"] = 2] = "swipedown";
    /** Swipe to the left. */
    gesture_type[gesture_type["swipeleft"] = 3] = "swipeleft";
    /** Swipe to the right. */
    gesture_type[gesture_type["swiperight"] = 4] = "swiperight";
})(gesture_type || (gesture_type = {}));
