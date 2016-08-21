# Epettommy

A Tamagochi inspired smart watch app prototype, written in TypeScript.

The folder "emulator" contains the source code for the emulator itself.
For the application prototype code, see "prototype".
Test cases can be found under "Unit Tests" in the emulator index.html. 


To run the smart watch emulator, first compile and build all files (`gulp build`),
then run index.html under Site Root. 

## Other Gulp Tasks

* `gulp typedoc` will generate documentation from the code.

* `gulp tslint` will run tslint over the code.

* `gulp clean` will delete the directories of compiled code and generated documentation.

## Usage
### Emulator

The emulator accepts swipe gestures to the left and right to select the application.
Clicking (tapping) the application loads it. The main application is called ePetTommy.

### Prototype

The entry-point of the prototype shows the pet. Feeding, full statistics and the game
are available by swiping away from the directions shown (as if pulling a window in from
that direction).

#### Game

The aim is to push the other player off the platform.

Swipe left or right to select movement direction. Tap to push, and swipe up to
jump. Stamina is shown in the bar at the bottom, and lower stamina reduces the 
ability of the pet to push. A stronger pet will have a stronger push, and slower
stamina decay.