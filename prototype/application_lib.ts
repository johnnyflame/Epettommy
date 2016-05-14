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
abstract class actor {
    
    /* Width and height of the actor */
    width: number;
    height: number;
    
    /* actor position */
    x: number;
    y: number;
    
    /* draw the actor on the display */
    abstract draw (ctx: graphics_context): void;
    
    /* Update the actor. This is given dt - the amount of time that has passed
     * since the last time the scene was updated
     */
    abstract update (dt : number): void;

    /* Put it at the given position */
    set_position (x : number, y:number){
        this.x = x;
        this.y = y;
    }

    /* Set the size. */
    set_size (width: number, height : number){
        this.width = width;
        this.height = height;
    }

    /* There are no get_ methods, as the components can be accessed publicly easily. */
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
    
    /* Add an actor to the scene. */
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

    /* Initialize the scene. For implementation, this might be where all the
     actions would be set up. */
    public init () {
    }

    /* Finish the scene, e.g. remove action requests. */
    public end (){
    }

    
}



/*
 * Application class. Contains main loop and exit controls
 */
class application{

    private current_scene : scene;
    private ctx : graphics_context;
    private running : boolean;
    
    /*
     * Run Main Loop
     */
    public run() {

        /* Init loop and graphics */
        this.ctx = os.get_graphics_context();
        this.running = true;
        
        let last_time : number = new Date().getTime();
        let curr_time : number;

        this.current_scene.init();
        
        while(this.running)
        {
            
            /* Calculate time differences for animation. */
            curr_time = new Date().getTime();
            let dt : number = curr_time - last_time;
            last_time = curr_time;

            /* Clear Display */
            this.ctx.clear();

            /* Draw Scene to display */
            this.current_scene.draw(this.ctx);

            /* Update Scene */
            this.current_scene.update(dt);
        }

        this.current_scene.end();
    }

    /*
     * Set game loop to finish
     */
    public quit (){
        this.running = false;
    }

    /*
     * Change the scene being drawn
     */
    public change_scene(new_scene : scene){
        this.current_scene.end();
        this.current_scene = new_scene;
        this.current_scene.init();
    }
}


/* 
 * Proposed classes:
 *  * Implementing actor:
 *    - AnimatedSprite (updates current sprite graphic after a given time)
 *  
 *  * Physics
 *    - Will contain code for collision detection and other generic but useful things
 *    - Special physics for game (e.g push strength) will go inside a class which
 *      inherits from this one.cd 
 */

/*
 * This actor displays a single sprite from a sprite sheet.
 */
class sprite extends actor{

    /* Displayed height and width of the sprite */
    public width: number;
    public height: number;
    
    /* Displayed Sprite position */
    public x: number;
    public y: number;

    /* Constructs the sprite from the given image, corresponding to the offset position and size
     * inside the sprite-sheet image.
     */
    constructor (private image:any, private offset_x : number, private offset_y : number,
                 private offset_width:number, private offset_height:number)
    {
        super();
        this.width = offset_width;
        this.height= offset_height;
    }
    
    /* Draw the sprite. */
    draw (ctx: graphics_context) : void{
        ctx.drawImage(
            this.image,
            this.offset_x, this.offset_y, this.offset_width, this.offset_height,
            this.x, this.y, this.width, this.height
        );
    }
    
    /* Update the actor. A Sprite does nothing. */
    update (dt : number): void{
    }

}
