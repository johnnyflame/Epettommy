/**
 * This interface defines the listitem element
 * Provides the items requested by the user.
 */
export interface IListItem{
    /**
     * Gives the title of the item
     * @type {string} - Provides the title
     */
    title:string;

    /**
     * Gives the description of the item
     * @type {string} - Provides the description
     */
    description:string;

    /**
     * Gives the hyperlink to the item
     * @type {string} - Provides a hyperlink
     */
    url:string;
}
