import {IApp} from './../dataModels/IApp';
import {IPage} from "../dataModels/IPage";
import {IElement} from "../dataModels/IElement";

/**
 * This represents the current state of the application.
 * It is a wrapper class around the IApp
 * Whenever you need to interact with the IApp object,
 * just call this service
 */
export interface IStateService{
    /**
     * This is the application
     * @type {IApp} - gives the application
     */
    _app:IApp;

    /**
     * Provides the current page
     * @method getCurrentPage
     * @return {IPage}        - returns values/layout of Ipage
     */
    getCurrentPage():IPage;

    /**
     * Provides the current page name
     * @method getCurrentPageName
     * @return {string}           - returns the name of current page
     */
    getCurrentPageName():string;

    /**
     * Provides the name of the start page
     * @method getStartPageName
     * @return {string}         - returns the name of start page
     */
    getStartPageName():string;

    /**
     * Sets the current page name to what was retrieved
     * @method setCurrentPageName
     * @param  {string}           name - sets the name to what was retrieved
     */
    setCurrentPageName(name:string);

    /**
     * Gets all pages from IApp.pages
     * @method getPages
     * @return {Array<IPage>} - returns the page that is retrieved from IPages
     */
    getPages():Array<IPage>;

    /**
     * get a specific page with the given name
     * @method getPage
     * @param  {string} name - gives the name to what was retrieved
     * @return {IPage}       - returns the IPage with the name
     */
    getPage(name:string ):IPage;

    /**
     * get the callback function of the application
     * @type {IElement} - provides elements from IElement to the application
     */
    getAppCallBack:(element:IElement,targetElementInfo?:string)=>void;

    /**
     * This is the central place to manage the callback
     * every event trigger in the browser will first hit this method
     * Then after some operations, check targetElementInfo etc,
     * it will pass back to IApp.CentralCallbackFunc
     * @type {IElement} - provides elements from IElement
     */
    emulatorCentralCallBack:(element:IElement,targetElementInfo?:string)=>void;
}
