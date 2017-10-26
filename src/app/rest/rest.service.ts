import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';


export const SERVER_ADDR = "127.0.0.1"; //"193.140.239.100";
export const HTTP_SERVER_ROOT = "http://" + SERVER_ADDR + ":5080/";
export const REST_SERVICE_ROOT = HTTP_SERVER_ROOT + "Console/rest";

export class LiveBroadcast {
    public name

}

@Injectable()
export class RestService {
    constructor(private http: Http, private router: Router) {
    }


    public getCPULoad(): Observable<Response> {
        return this.http.get(REST_SERVICE_ROOT + '/getCPUInfo')
            .map((res: Response) => res.json());
    }

    public checkAuthStatus(networkName: string, appName: string): Observable<Response> {
        return this.http.post(HTTP_SERVER_ROOT + appName + "/rest/broadcast/checkDeviceAuthStatus/" + networkName,
            {})
            .map((res: Response) => res.json());
    }


    public getAppLiveStreams(appName:string, offset:Number, size:Number): Observable<Response>  {
        return this.http.get(HTTP_SERVER_ROOT +  appName + '/rest/broadcast/getList/'+offset+"/"+size)
                .map((res: Response) => res.json());
    }

    public createLiveStream(appName: string, liveBroadcast: LiveBroadcast, socialNetworks:string): Observable<Response> {


        return this.http.post(HTTP_SERVER_ROOT + appName + "/rest/broadcast/createWithSocial?socialNetworks="+socialNetworks,
            liveBroadcast)
            .map((res: Response) => res.json());
    }

    public deleteBroadcast(appName: string, streamId:string): Observable<Response> {
        return this.http.post(HTTP_SERVER_ROOT +  appName + '/rest/broadcast/delete/'+streamId, {})
        .map((res: Response) => res.json());
    }

    public deleteVoDFile(appName: string, streamId:string) {
        return this.http.post(HTTP_SERVER_ROOT +  appName + '/rest/broadcast/deleteVoDFile/'+streamId, {})
        .map((res: Response) => res.json());

    }

    public revokeSocialNetwork(appName: string, serviceName:string): Observable<Response> {
        return this.http.post(HTTP_SERVER_ROOT +  appName + '/rest/broadcast/revokeSocialNetwork/'+serviceName, {})
        .map((res: Response) => res.json());
    }

    public isEnterpriseEdition(): Observable<Response> {
        return this.http.get(REST_SERVICE_ROOT + "/isEnterpriseEdition")
            .map((res: Response) => res.json());
    }

    public handleError(error: Response) {

        if (error.status == 401) {
            console.log("error -response: --> " + error);
            this.router.navigateByUrl("/pages/login");
        }
        return Observable.throw(error || 'Server error');
    }
}