import {Injectable, Input} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

@Injectable()
export class DataService {


    myMethod$: Observable<any>;
    private myMethodSubject = new Subject<any>();


    serviceData: string;

    constructor() {

        this.myMethod$ = this.myMethodSubject.asObservable();
    }

    writeData(data) {
        console.log(data); // I have data! Let's return it so subscribers can use it!
        // we can do stuff with data if we want
        this.myMethodSubject.next(data);
        this.serviceData = data;


    }


}