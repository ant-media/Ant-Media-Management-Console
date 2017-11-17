import { Component } from '@angular/core';
import { Locale } from './locale/locale';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  constructor(private localeService:Locale) {

  }
}

