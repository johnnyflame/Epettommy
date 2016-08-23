import {IStateService} from "./IStateService";
import {ITemplatingService} from "./ITemplatingService";
import {IPage} from "../dataModels/IPage";

/**
 * This is the services provided for the system.
 * It provides all the features that the emulator needs.
 */
export interface ISystemService{
    /**
     * Provides the service for IStateService
     * @type {IStateService} - gives the current state of the service
     */
    _stateService:IStateService;

    /**
     * Provides the template to present given information
     * @type {ITemplatingService} - gives the template for the information
     */
    _templatingService:ITemplatingService;

    /**
     * Removes current page from screen.
     * It is the first step to go to a new page.
     * @method removeCurrentPageFromScreen
     */
    removeCurrentPageFromScreen();

    /**
     * Directs to specific page requested
     * @method goPage
     * @param  {string} name - name of the page that will be directed to
     */
    goPage(name:string);

    /**
     * Refreshes the current page
     * @method renewCurrentPage
     * @param  {string}        name - name of the page that needs to be refreshed
     */
    renewCurrentPage(name:string);

    /**
     * Sets the first page to start/homescreen
     * It will retrieve IApp.startPageName,
     * then find the very page in IApp.pages using that name
     * then show it on the screen.
     * @method goStartPage
     * @return {[type]}    - returns the startup page
     */
    goStartPage();

    /**
     * It will render all the pages (now show, just render)
     * the result will be jQuery objects.
     * It will iterate through the IApp.pages:Array<IPage>.
     * For each IPage object stored in that list,
     * It will first fetch the IPage.rawLayout, render it,
     * then stored in IPage.afterRenderLayout.
     * @method renderAllPages
     * @param  {string}       pageName - provides the page name
     * @return {[type]}                - returns rendered page
     */
    renderAllPages(page?:IPage);

    /**
     * Starts up the emulator to be executed and show splash screen
     * @method showSplashScreen
     */
    startEmulator();

    /**
     * Hides the splash screen after startup
     * @method hideSplashScreen
     */
    hideSplashScreen();

    /**
     * Gives the notification when something occurs
     * @method showNotification
     * @param  {string}         text - error message
     */
    showNotification(text:string);
}
