
import { Component, OnInit, ElementRef, LOCALE_ID, Inject, Injectable } from '@angular/core';
import { Locale } from 'app/locale/locale';

@Component({
    moduleId: module.id,
    selector: 'footer-cmp',
    templateUrl: 'footer.component.html'
})

export class FooterComponent{
    test : Date = new Date();

    public target_language:string;

    constructor(@Inject(LOCALE_ID) locale: string) {
        
        if (locale == "en-US") {
            this.target_language = Locale.getLocaleInterface().turkish_language;
        }
        else if (locale == "tr") {
           this.target_language = Locale.getLocaleInterface().english_language;
        }
      
    }
}
