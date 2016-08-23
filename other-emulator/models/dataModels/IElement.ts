import {IListItem} from "./IListItem";
type elementType = "button"|"text"|"image"|"input"|"list";

/**
 * This represents the application interface in the browser.
 * Creates the interactive part of the application within the browser. 
 */
export interface IElement{
    /**
     * Creates the elements needed for interaction
     * There are four types you could use,
     * "button"|"text"|"image"|"input"|"list";
     * @type {elementType} - gives the element type
     */
    type:elementType;

    /**
     * Provides the name for the elements
     * @type {string} - gives the element a name
     */
    name:string;

    /**
     * Provides the specific elements interaction type
     * Let's say you want to check a input when use click a button'
     * you can just set this property to the name of the input
     * in the runtime, the emulator will retrieve the text value from that input
     * and pass back to you.
     * @type {[type]} - provides the interaction type for the element if needed
     */
    targetElementID?:string;

    /**
     * It defines the text showed on the element,
     * Let's say you wanna create a button,
     * this property will be the text on the button
     * You see it can be two types, the other type is used when you create a list
     * @type {string} or {Array<IListItem>} - provides a string or already listed  * item
     */
    define:string|Array<IListItem>;
}
