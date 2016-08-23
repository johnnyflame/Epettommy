import {IActionService} from "../models/serviceModels/IActionService";
import {ISystemService} from "../models/serviceModels/ISystemService";
import {IPage} from "../models/dataModels/IPage";

declare var OAuth:any;

export class ActionService implements IActionService{
    _systemService: ISystemService;

    /**
     * Constructs the services provided to the application
     * @method constructor
     * @param  {ISystemService} systemService - retrieves required information
     * @return {[type]}                       - returns service of page request
     */
    constructor(systemService: ISystemService) {
        this._systemService = systemService;
    }

    goPage(name: string) {
        this._systemService.goPage(name);
    }

    showNotification(words: string) {
        this._systemService.showNotification(words);
    }

    saveToLocalStorage(key: string, value: string) {
        localStorage.setItem(key,value);
    }

    getFromLocalStorage(key: string): string {
        return localStorage.getItem(key);
    }

    reRenderPage(page:IPage){
        this._systemService.renderAllPages(page);
    }

    callYelpSearchAPI(keywords:string, callback:Function){
        let auth = {
            consumerKey : "sNul62e6H0We5KJLGYP_Bw",
            consumerSecret : "RxvIBp4BxRvNVxjaPlUWuiPFcYg",
            accessToken : "nguVll4te_e1oDcv2EkS4xKC6GOoQhcN",
            accessTokenSecret : "DrumlhFl5Kwb1ksCpRKEtiW6B58",
            serviceProvider : {
                signatureMethod : "HMAC-SHA1"
            }
        };

        let terms = keywords;
        let near = 'Dunedin';
        let category = 'restaurants,food,bars'

        let accessor = {
            consumerSecret : auth.consumerSecret,
            tokenSecret : auth.accessTokenSecret
        };

        let parameters = [];
        parameters.push(['term', terms]);
        parameters.push(['location', near]);
        parameters.push(['category_filter', category]);
        parameters.push(['callback', 'cb']);
        parameters.push(['oauth_consumer_key', auth.consumerKey]);
        parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
        parameters.push(['oauth_token', auth.accessToken]);
        parameters.push(['oauth_signature_method', 'HMAC-SHA1']);

        let message = {
            'action' : 'https://api.yelp.com/v2/search',
            'method' : 'GET',
            'parameters' : parameters
        };



        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, accessor);

        let parameterMap = OAuth.getParameterMap(message.parameters);

        $.ajax({
            'url' : message.action,
            'data' : parameterMap,
            'dataType' : 'jsonp',
            'jsonpCallback' : 'cb',
            'cache': true
        })
        .done((data, textStatus, jqXHR) => {
                callback(data.businesses[0]);
            }
        )
        .fail((jqXHR, textStatus, errorThrown) => {
                console.log('error[' + errorThrown + '], status[' + textStatus
                                     + '], jqXHR[' + JSON.stringify(jqXHR) + ']');
            }
        );
    }
}
