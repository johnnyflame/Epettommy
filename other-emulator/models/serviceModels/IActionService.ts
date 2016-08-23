import {ISystemService} from "./ISystemService";
import {IPage} from "../dataModels/IPage";

/**
 * This represents the action service intermediate.
 * Everytime when the application needs to trigger some action,
 * it uses this service
 * Provides the required services to present requested information.
 */
export interface IActionService{
    /**
     * Provides the bootup for the application
     * This service should be injected in the constructor phase.
     * @type {ISystemService} - Provides the service needed to run the application
     */
    _systemService:ISystemService;

    /**
     * go to page according to the pass-in parameter
     * This page should be stored in IApp.pages 
     * @method goPage
     * @param  {string} name - gives the name of the page that is visted
     * @return {[type]}      - returns the page that matches the name
     */
    goPage(name:string);

    /**
     * Provides a message via the emulator
     * It will display for a while then disappear.
     * @method showNotification
     * @param  {string}         words - gives an error message
     */
    showNotification(words:string);

    /**
     *
     * Provides the Yelp service to give details
     * It will call the search API
     * @method callYelpSearchAPI
     * @param  {string}    keywords - gives keywords to identify what is searched
     * @param  {Function}  callback - provides a callback to execute the function
     */
    callYelpSearchAPI(keywords:string, callback:Function);

    /**
     * Provides the layout of the page to be shown
     * You will need this method after you doing some async callback,
     * Which means you need to update some layout or information of a page.
     * Let's say you want to go to page2 after click search button on page1'
     * You need to first call YelpAPI to retrieve the information,
     * then after this you will update the IApp object,
     * but you need to re-render page2 before you go to page2
     * since page2 has already rendered during the emulator starts
     * @method reRenderPage
     * @param  {IPage}          page - gives the requested formatted page
     */
    reRenderPage(page:IPage);

    /**
     * Saves items to the local storage
     * @method saveToLocalStorage
     * @param  {string}           key   - provides way to recall from storage
     * @param  {string}           value - provides the searched item
     */
    saveToLocalStorage(key:string,value:string);

    /**
     * Retrieves items from the local storage
     * @method getFromLocalStorage
     * @param  {string}            key - gives an identifier to search storage
     * @return {string}                - returns the search result
     */
    getFromLocalStorage(key:string):string;
}
