import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
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

    public getClusterNodes(): Observable<Object> {
        return this.http.get(this.getRestServiceRoot() + '/nodes');
    }

    public updateClusterNodes(node: ClusterNodeInfo): Observable<Object> {
        return this.http.post(this.getRestServiceRoot() + '/updateNode/'+ node.id, node);
    }

    public addClusterNodes(node: ClusterNodeInfo): Observable<Object> {
        return this.http.post(this.getRestServiceRoot() + '/nodes', node);
    }

    public deleteClusterNodes(node: ClusterNodeInfo): Observable<Object> {
        return this.http.get(this.getRestServiceRoot() + '/deleteNode/'+ node.id);
    }


}
