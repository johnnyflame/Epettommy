/**
 * This represents the callback functions of the elements.
 * Provides the functionality of the elements.
 */
export interface IFunc {
    /**
     * Creates the function which is linked to the elements name
     * @type {string} - Provides the name of the element
     */
    bindToName: string;

    /**
     * Provides the specific string name depending on the target ID
     * which is linked to the IElement.targetElementID
     * @type {[type]} - Provides the target ID for the elements if needed
     */
    targetID?: string;

    /**
     * Provides the callback function for the elements
     * @type {Function} - Provides functionality to elements
     */
    callbackFunction:Function;
}
