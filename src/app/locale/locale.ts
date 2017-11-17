
import { Component, OnInit, ElementRef, LOCALE_ID, Inject, Injectable } from '@angular/core';
import { Locale_English } from './locale.en';
import { LocaleInterface } from 'app/locale/locale.interface';
import { Locale_Turkish } from 'app/locale/locale.tr';

@Injectable()
export class Locale {
    
    public static localeObject: LocaleInterface;
    constructor(@Inject(LOCALE_ID) locale: string) {
        
        
        if (locale == "tr") {
            Locale.localeObject = Locale_Turkish;
        }
        else {
            Locale.localeObject = Locale_English;
        }
      
    }

    public static getLocaleInterface():LocaleInterface {
        return Locale.localeObject;
    }
     


    
   

}