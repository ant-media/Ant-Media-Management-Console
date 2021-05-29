import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';
import {HttpClient} from '@angular/common/http';
import {ClusterNodeInfo} from '../cluster/cluster.definitions'
import {REST_SERVICE_ROOT} from './rest.service';


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

    private getRestServiceRoot():string {
        return REST_SERVICE_ROOT + "/cluster";
    }

    public getClusterNodeCount() : Observable<Object> {
        return this.http.get(this.getRestServiceRoot() + "/node-count");
    }

    public getClusterNodes(offset: number, size: number): Observable<Object> {
        return this.http.get(this.getRestServiceRoot() + '/nodes/'+offset+'/'+size);
    }

    public deleteClusterNodes(node: ClusterNodeInfo): Observable<Object> {
        return this.http.delete(this.getRestServiceRoot() + '/node/'+ node.id);
    }


}
