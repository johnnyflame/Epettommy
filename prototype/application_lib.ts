/*
 * This file contains reusable code for building (game) applications. This
 * code was inspired by the quintus and excalibur web game engines.
 */


/*
 * At the current stage, until any decisions on the graphics context are final,
 * we simply allow it to be any type
 */
 type graphics_context = any;

/* Actors are the units which make up the scene. The scene is the entire view, 
 * and is responsible for drawing the display.
 */
interface actor {
    
    /* Width and height of the actor */
    width: number;
    height: number;
    
    /* actor position */
    x: number;
    y: number;
    
    /* draw the actor on the display */
    draw (ctx: graphics_context): void;
    
    /* Update the actor. This is given dt - the amount of time that has passed
     * since the last time the scene was updated
     */
    update (dt : number): void;
}

/* A scene is responsible for drawing all of the actors, and updating them all.
 * draw() and update() will be called from the main application loop.
 * 
 * The purpose of putting everything in a scene means that changing the UI stage
 * is as simple as changing the active scene class.
 */
class scene {
    /* list of actors */
    private actors: actor[];
    
    /* Add an actor to the scene */
    public add(item: actor) : void{
        this.actors.push(item);
    }

    /* Draw the scene on the given graphics context */
    public draw(ctx: graphics_context) : void{
        this.actors.forEach(function (item: actor){
            item.draw(ctx);
        })
    }
    
    /* Update all the actors. */
    public update(dt: number) : void{
        this.actors.forEach(function (item: actor){
            item.update(dt);
        })
    }
}

/* 
 * Proposed classes:
 *  * Implementing actor:
 *    - Sprite (draws sprite, but does nothing on update)
 *    - AnimatedSprite (updates current sprite graphic after a given time)
 *  
 *  * Application
 *    - Contains a scene. Loops calling draw and update on the scene.
 *  
 *  * Physics
 *    - Will contain code for collision detection and other generic but useful things
 *    - Special physics for game (e.g push strength) will go inside a class which
 *      inherits from this one.cd 
 */