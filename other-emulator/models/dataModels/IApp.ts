import {IPage} from './IPage';
import {IActionService} from "../serviceModels/IActionService";

/**
 * This represents the application interface.
 * Any app should implement this interface for the emulator to recognize.
 * Creates the interactive part of the application.
 */
export interface IApp {
    /**
     * Provides the title of the application
     * @type {string} - gives the title of the application 
     */
    title: string;

    /**
     * Provides the current page name that is shown on the screen
     * @type {string} - gives the current page name
     */
    currentPageName: string;

    /**
     * Provides a starting page to the emulator
     * This is the first page which will be rendered when
     * the emulator starts.
     * @type {string} - gives the starting page name
     */
    startPageName: string;

    /**
     * Provides the Array of IPage objects
     * It holds all the pages in the app.
     * Emulator will use this property to travel through page to page
     * @type {Array<IPage>} - gives relevant page information from the array
     */
    pages: Array<IPage>;

    /**
     * inject the ActionService to the application in the runtime via emulator
     * @method injectActionService
     * @param  {IActionService}    as - actions expose to application by the emulator
     */
    injectActionService(as: IActionService);

    /**
     * Adds pages to the interface
     * @method startAddingPages
     */
    startAddingPages();

    /**
     * Provides the interaction between the application and the emulator
     * @method CentralCallbackFunc
     * @param  {string}         pageName  - provides the page name
     * @param  {string}         elementID - provides specific element requested
     */
    CentralCallbackFunc(pageName: string, elementID:string, targetElementID?: string);
}
