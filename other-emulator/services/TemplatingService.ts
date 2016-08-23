///<reference path="../ui/types/jquery.d.ts" />

import {IPage} from '../models/dataModels/IPage'
import {ITemplatingService} from "../models/serviceModels/ITemplatingService";
import {IElement} from "../models/dataModels/IElement";
import {IStateService} from "../models/serviceModels/IStateService";
import {IListItem} from "../models/dataModels/IListItem";

export class TemplatingService implements ITemplatingService {
    _stateService: IStateService;

    /**
     * Constructs the service state
     * @method constructor
     * @param  {IStateService} stateService - provides the service state
     * @return {[type]}                     - returns service template
     */
    constructor(stateService: IStateService) {
        this._stateService = stateService;
    }

    createPage(page: IPage): JQuery {
        let outDiv: JQuery = this.createLayout();

        for (let element1 of page.rawLayout){
            let row = this.createjQueryItem("div",
                undefined,
                "row",
                undefined);
            let element:IElement = element1;
            switch (element.type) {
                case "button":
                    let temp = this.createjQueryItem("button",
                        [{key:"id", value:element.name}],
                        "btn btn-primary btn-lg btn-block", //btn-block
                        <string>element.define);
                    if (element.targetElementID) {
                        $(".emulator").on(
                            'click',
                            "#"+element.name,
                            ()=>{
                                let targetText = $("#"+element.targetElementID).val();
                                this._stateService.emulatorCentralCallBack(element,targetText);
                            });
                    } else {
                        $(".emulator").on(
                            'click',
                            "#"+element.name,
                            ()=>{
                                this._stateService.emulatorCentralCallBack(element);
                            });
                    }
                    if($(".btn", outDiv).length) { //if there already a button on the page
                        var buttons = $(".btn", outDiv);
                        let width  = 12 / (buttons.length + 1);
                        buttons.after(temp);
                        buttons = $(".btn", outDiv); //to capture new button too
                        buttons.removeClass("btn-block");
                        buttons.addClass("col-sm-" + width);
                    } else {
                        row.append(temp);
                    }
                    break;
                case "text":
                    let temp1 = this.createjQueryItem("p",
                        [{key:"id", value:element.name}],
                        undefined,
                        <string>element.define);
                    row.append(temp1);
                    break;
                case "image":
                    let temp2 = this.createjQueryItem("img",
                        [{key:"id", value:element.name}, {key:"src", value:<string>element.define}],
                        "img-fluid");
                    row.append(temp2);
                    break;
                case "input":
                    let temp3 = this.createjQueryItem("div", undefined, "form-group");

                    let label = this.createjQueryItem("label",
                        [{key:"for", value:element.name}],
                        "sr-only",
                        <string>element.define);
                    temp3.append(label);

                    let input = this.createjQueryItem("input",
                        [{key:"type", value:"text"}, {key:"id", value:element.name}, {key:"for", value:element.name}, {key:"placeholder", value:<string>element.define}],
                        "form-control",
                        <string>element.define);
                    temp3.append(input);
                    row.append(temp3);
                    break;
                case "list":
                    let listGroup = this.createjQueryItem("div", undefined, "list-group");
                    let listItemsData = <Array<IListItem>>(element.define);
                    for (let item of listItemsData){
                        let a = this.createjQueryItem("a",
                            undefined,
                            "list-group-item list-group-item-action");
                        $(".emulator").on(
                            'click',
                            "#"+element.name,
                            ()=>{
                                this._stateService.emulatorCentralCallBack(element,item.url);
                            });
                        let h5 = this.createjQueryItem("h5",
                            undefined,
                            "list-group-item-heading",
                            item.title);
                        let p = this.createjQueryItem("p",
                            undefined,
                            "list-group-item-text",
                            item.description);
                        a.append(h5);
                        a.append(p);
                        listGroup.append(a);
                    }
                    row.append(listGroup);
                    break;
            }
            outDiv.append(row);
        }

        return outDiv;
    }

    createPagesAndSave() {
        for (let page of this._stateService.getPages()){
            page.afterRenderLayout = this.createPage(page);
        }
    }

    createLayout(): JQuery {
        return this.createjQueryItem('div', undefined, "container-fluid");
    }

    removeElementFromDOM(className: string) {
        $(className).remove();
    }

    createjQueryItem(type: string,
                     attrs?: Array<{key: string,value: string}>,
                     styleClasses?: string,
                     text?: string): JQuery {
        let domElement = $(document.createElement(type));
        if (styleClasses) {
            domElement.addClass(styleClasses);
        }
        if (attrs) {
            for (let item of attrs){
                domElement.attr(item.key, item.value);
            }
        }

        if (text) {
            domElement.html(text);
        }
        return domElement;
    }
}
