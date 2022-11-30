import {Component, Inject, LOCALE_ID} from '@angular/core';
import {Locale} from 'app/locale/locale';
import {RestService, show403Error} from '../../rest/rest.service';
import {HttpClient} from '@angular/common/http';

@Component({
    moduleId: module.id,
    selector: 'footer-cmp',
    templateUrl: 'footer.component.html'
})

export class FooterComponent{
    test : Date = new Date();

    public target_language:string;
    public versionName : string;
    public versionType : string;
    public buildNumber : string;

    constructor(@Inject(LOCALE_ID) locale: string,private http: HttpClient, private restService: RestService) {
        
        if (locale == "en-US") {
            this.target_language = Locale.getLocaleInterface().turkish_language;
        }
        else if (locale == "tr") {
           this.target_language = Locale.getLocaleInterface().english_language;
        }
      
    }

    ngOnInit() {

            this.restService.getVersion().subscribe(data => {
            this.versionName = data["versionName"];
            this.versionType = data["versionType"];
            this.buildNumber = data["buildNumber"];
        }, error => { show403Error(error); });
    }

}
