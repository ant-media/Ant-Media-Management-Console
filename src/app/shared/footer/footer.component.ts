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
    public upTime: number; 
    public startTime: number;

    intervalId!: any;


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

            this.restService.getServerTime().subscribe(data => {
                this.upTime = data["up-time"];
                this.startTime = data["start-time"];
            }, error => {});

            this.intervalId = setInterval(() => {
                this.upTime = this.upTime + 1000;
              }, 1000);
    }

    ngOnDestroy(): void {
        // Clear the interval to avoid memory leaks
        if (this.intervalId) {
          clearInterval(this.intervalId);
        }
      }

    formatUpTime(milliseconds: number): string {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const seconds = totalSeconds % 60;
        const totalMinutes = Math.floor(totalSeconds / 60);
        const minutes = totalMinutes % 60;
        const totalHours = Math.floor(totalMinutes / 60);
        const hours = totalHours % 24;
        const days = Math.floor(totalHours / 24);
    
        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (seconds > 0) parts.push(`${seconds}s`);
    
        return parts.join(' ');
      }

}
