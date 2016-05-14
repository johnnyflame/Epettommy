

declare var hammertime : any;




 

 /**
 * Emulator internals. Contains the API as well as the emulator UI.
 */


//http://hammerjs.github.io/api/#hammer.input-event 
//
//var hammertime = new Hammer(myElement, myOptions);
//hammertime.on('pan', function(ev) {
//	console.log(ev);
//});
//
//hammertime.get('pinch').set({ enable: true });
//hammertime.get('rotate').set({ enable: true });



/* Local Storage Class. Stores an object by converting it to a JSON string
 * and storing it in the browser's local storage. */
class emulator_storage{
    
    
    private table(){ 
        /* Access the HTML table.*/
        /* Retrieve from localStorage and output in HTML table. */
        
        var data = "<tr><th>Key</th><th>Value</th></tr>";
        
      for (var key in localStorage) {
        data += "<tr><td>" + key + '</td><td>' + localStorage[key] + "</td></tr>";
      }
      
      document.getElementById("data_table").innerHTML = data;
}





    
    
    
    set_object(key: string, value: any) {
        localStorage.setItem(key, JSON.stringify(value));
    }
    get_object(key: string) {
        var value = localStorage.getItem(key);
        return value && JSON.parse(value);
    }
}

/* Container Class for application information inside the emulator */
class registered_application{
    constructor(public name:string, public start_callback: Function)
    {}
}

class emulator_ui{
    private current_app: number;
    public app_list: registered_application[];
    private canvas: HTMLCanvasElement;
    
    /* Construct this emulator ui, and connect it to a canvas as a display */
    constructor(display: HTMLCanvasElement){
        this.current_app = 0;
        this.canvas = display;
    }
    
    /* Draw the application name of the current application to screen */
    draw(){
        let ctx : CanvasRenderingContext2D = this.canvas.getContext('2d');
        ctx.clearRect(0,0,this.canvas.width, this.canvas.height/2);
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.app_list[this.current_app].name, this.canvas.width/2, this.canvas.height/2);
        
        
    }
    
    /* TODO: psudo code ish. Change the current application on swipe. */
    swipe_handle(direction){
        var left;
        /* If swipe left */
        if(direction == left){
            this.current_app = (this.current_app + 1) % this.app_list.length;
        } else {
            this.current_app --;
            if(this.current_app < 0)
                this.current_app = this.app_list.length - 1;
        }
    }
    
    click_handle(){
        /* TODO: First unregister click/swipe handlers */
        
        /* Call application */
        this.app_list[this.current_app].start_callback();
        
        /* TODO: re-register click/swipe handlers - the application has finished */
    }
    
}

/*
 * Available mouse gesture types.
 */
enum guesture_type {gesture_tap, gesture_swipe}


/*
 * Main emulator API. Also contains init logic.
 */

class emulator {
    
    private display : HTMLCanvasElement;
    private ui: emulator_ui;
    
    /* Initialize and start the smart watch */
    init(){
        this.display = <HTMLCanvasElement> document.getElementById("emulator_display");
        this.ui = new emulator_ui(this.display);
        this.ui.draw();
    }
    
    /* Get a CanvasRenderingContext2D which can draw on the display.
     * 
     * TODO: do we need to change this to our own context type?
     *   */
    get_graphics_context(){
        return this.display.getContext('2d');
    }
    
    /*
     * Get the emulator's persistant storage.
     */
    get_local_storage(): emulator_storage{
        return new emulator_storage()
    }
    
    /*
     * Set a handler for gestures.
     * 
     * TODO: Will use third party library for implementation
     */    
    set_gesture_handler(gest_type: guesture_type, callback: (x:number, y:number)=>void){
    }
    
}