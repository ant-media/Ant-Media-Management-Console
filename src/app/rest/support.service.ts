import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';
import {HttpClient} from '@angular/common/http';
import {REST_SERVICE_ROOT} from './rest.service';
import {SupportRequest} from '../support/support.definitions'


@Injectable()
export class SupportRestService {
    constructor(private http: HttpClient, private router: Router) {
    }

    public handleError(error: Response) {

        if (error.status == 401) {
            console.log("error -response: --> " + error);
            this.router.navigateByUrl("/pages/login");
        }
        return Observable.throw(error || 'Server error');
    }

    private getRestServiceRoot():string {
        return REST_SERVICE_ROOT + "/support";
    }

    public sendRequest(request: SupportRequest): Observable<Object> {
        return this.http.post(this.getRestServiceRoot() + '/request', request);
    }
}
