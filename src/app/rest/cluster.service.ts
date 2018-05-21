import {Injectable} from '@angular/core';
import {Response} from '@angular/http';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {environment} from '../../environments/environment';
import {AppSettings, SearchParam} from "../app.page/app.page.component";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';
import {HttpClient, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {ClusterNodeInfo} from '../cluster/cluster.definitions'


export const SERVER_ADDR = location.hostname;
export var HTTP_SERVER_ROOT;

if (environment.production) {
    HTTP_SERVER_ROOT = "//" + location.hostname + ":" + location.port + "/";
}
else {
    HTTP_SERVER_ROOT = "//" + location.hostname + ":5080/";
}


export const REST_SERVICE_ROOT = HTTP_SERVER_ROOT + "ConsoleApp/rest/cluster";

@Injectable()
export class ClusterRestService {
    constructor(private http: HttpClient, private router: Router) {
    }

    public handleError(error: Response) {

        if (error.status == 401) {
            console.log("error -response: --> " + error);
            this.router.navigateByUrl("/pages/login");
        }
        return Observable.throw(error || 'Server error');
    }


    public getClusterNodes(): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + '/nodes');
    }

    public updateClusterNodes(node: ClusterNodeInfo): Observable<Object> {
        return this.http.post(REST_SERVICE_ROOT + '/updateNode/'+ node.id, node);
    }

    public addClusterNodes(node: ClusterNodeInfo): Observable<Object> {
        return this.http.post(REST_SERVICE_ROOT + '/nodes', node);
    }

    public deleteClusterNodes(node: ClusterNodeInfo): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + '/deleteNode/'+ node.id);
    }


}
