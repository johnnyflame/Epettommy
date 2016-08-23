import {IFunc} from "./IFunction";
import {IElement} from "./IElement";

/**
 * This represents the page requested.
 * Provides the page requested. 
 */
export interface IPage{
    /**
     * Gives the name of the page requested
     * @type {string} - provides the name of the page
     */
    name:string;

    /**
     * Gives the overall structure of the elements
     * @type {Array<IElement>} - provides the array of needed elements
     */
    rawLayout:Array<IElement>;

    /**
     * Provides the JQuery after the rendering the rawLayout property
     * @type {[type]} - provides the appropriate JQuery when needed
     */
    afterRenderLayout?:JQuery;

    /**
     * Provides a callback functions needed to interact with this page
     * @type {Array<IFunc>} - provides the array of needed functions
     */
    callback:Array<IFunc>;
}
