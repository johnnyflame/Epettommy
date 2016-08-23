import {IPage} from './../dataModels/IPage'
import {IStateService} from "./IStateService";

/**
 * Provides the templating service to provide page and state of service
 * This is the service which will interact with the DOM most of the time.
 */
export interface ITemplatingService{
    /**
     * Gives the current status of the service
     * @type {IStateService}
     */
    _stateService:IStateService;

    /**
     * Create the page from a IPage object,
     * then generate its according jQuery element.
     * @method createPage
     * @param  {IPage}    page - gives the IPage
     * @return {JQuery}        - returns a JQuery object with IPage
     */
    createPage(page:IPage):JQuery;

    /**
     * It will loop through IApp.pages, then operate them one by one
     * For each page, it just pass the page to createPage()
     * then it will store the result in the according IPage.afterRenderLayout.
     * And since the IPage.afterRenderLayout is a jQuery type object,
     * it can be rendered by the browser in the runtime.
     * @method createPagesAndSave
     */
    createPagesAndSave();

    /**
     * Creates an object of the page layout
     * It represent the container for the emulator
     * we need this since it provides us a simple way to remove and add page.
     * @method createLayout
     * @return {JQuery}     - returns a JQuery object of the page layout
     */
    createLayout():JQuery;

    /**
     * Removes the selected element from the DOM using the given css class name.
     * @method removeElementFromDOM
     * @param  {string}             className - class attributes of the element
     */
    removeElementFromDOM(className:string);

    /**
     * Uses all given information to create a JQuery object
     * This is a helper method wrap around the jQuery API to provide
     * a simple and elegant to create a element.
     * @method createjQueryItem
     * @param  {string}         type         - provides the tag name, let's say you wanna create a div, it should be 'div'
     * @param  {string>}}       attrs        - provides attributes of the tag, let's say href for a tag'
     * @param  {string}         styleClasses - provides name of the css class
     * @param  {string}         text         - provides text inside the element. You can pass-in html blocks!
     * @return {JQuery}                      - returns a JQuery object
     */
    createjQueryItem(type:string,
                     attrs?:Array<{key:string,value:string}>,
                     styleClasses?:string,
                     text?:string): JQuery;
}
