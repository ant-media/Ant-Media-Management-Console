import {Injectable, Input} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

@Injectable()
export class DataService {


    data: Observable<any>;
    private observeData = new Subject<any>();


    serviceData: string;

    constructor() {

        this.data = this.observeData.asObservable();
    }

    writeData(data) {
        console.log(data);
        this.observeData.next(data);
        this.serviceData = data;


    }


}