import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Camera} from "../app.page/app.page.component";
import {SearchParam} from "../app.page/app.page.component";
import {promise} from "selenium-webdriver";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';


export const SERVER_ADDR = location.hostname;
export const HTTP_SERVER_ROOT = "http://" + location.hostname + ":5080/";

export const REST_SERVICE_ROOT = HTTP_SERVER_ROOT + "ConsoleApp/rest";

export class LiveBroadcast {
    public name:string;
    public type:string;
    public ipAddr: string;
    public username: string;
    public password: string;
    public rtspUrl: string;


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


    public getAppLiveStreams(appName:string, offset:Number, size:Number): Promise<Response>  {
        return this.http.get(HTTP_SERVER_ROOT +  appName + '/rest/broadcast/getList/'+offset+"/"+size).toPromise()
            .then((res: Response) => res.json());
    }

    public getVodList(appName:string, offset:Number, size:Number): Promise<Response>  {
        return this.http.get(HTTP_SERVER_ROOT +  appName + '/rest/broadcast/getVodList/'+offset+"/"+size).toPromise()
            .then((res: Response) => res.json());
    }


    public filterAppLiveStreams(appName:string, offset:Number, size:Number,type:String): Promise<Response>  {
        return this.http.get(HTTP_SERVER_ROOT +  appName + '/rest/broadcast/filterList/'+offset+"/"+size+"/"+type).toPromise()
            .then((res: Response) => res.json());
    }

    public filterVod(appName:string, offset:Number, size:Number,searchParam:SearchParam): Promise<Response>  {
        return this.http.post(HTTP_SERVER_ROOT +  appName + "/rest/broadcast/filterVoD?offset="+offset+"&size="+size,searchParam).toPromise()
            .then((res: Response) => res.json());

    }



    public createLiveStreamSocialNetworks(appName: string, liveBroadcast: LiveBroadcast, socialNetworks:string): Promise<Response> {

        return this.http.post(HTTP_SERVER_ROOT + appName + "/rest/broadcast/createWithSocial?socialNetworks="+socialNetworks,
            liveBroadcast).toPromise()
            .then((res: Response) => res.json());
    }

    public createLiveStream(appName: string, liveBroadcast: LiveBroadcast): Promise<Response> {

        return this.http.post(HTTP_SERVER_ROOT + appName + "/rest/broadcast/create",
            liveBroadcast).toPromise()
            .then((res: Response) => res.json());
    }

    public deleteBroadcast(appName: string, streamId:string): Observable<Response> {
        return this.http.post(HTTP_SERVER_ROOT +  appName + '/rest/broadcast/delete/'+streamId, {})
            .map((res: Response) => res.json());
    }

    public deleteVoDFile(appName: string, name:string,vodId:number) {
        return this.http.post(HTTP_SERVER_ROOT +  appName + '/rest/broadcast/deleteVoDFile/'+name+"/"+vodId, {})
            .map((res: Response) => res.json());

    }

    public deleteIPCamera(appName: string, streamId:string) {
        return this.http.get(HTTP_SERVER_ROOT +  appName + '/rest/camera/deleteCamera?ipAddr='+streamId, {})
            .map((res: Response) => res.json());

    }

    public addIPCamera(appName: string, camera:Camera): Promise<Response> {




        let url=HTTP_SERVER_ROOT + appName + '/rest/camera/add';

        console.log('URL ' + url);

        return this.http.post(url,camera).toPromise().then((res: Response) => res.json());
    }


    public  autoDiscover(appName: string): Promise<String[]> {

        let streamInfoUrl = HTTP_SERVER_ROOT + appName +'/rest/camera/searchOnvifDevices';
        console.log('URL ' + streamInfoUrl);

        return this.http.get(streamInfoUrl).toPromise()
            .then(this.extractData)
            .catch(this.handleError);

    }

    public  getCamList(appName: string): Promise<Response> {

        let url = HTTP_SERVER_ROOT + appName +'/rest/camera/getList';
        console.log('URL ' + url);

        return this.http.get(url).toPromise()
            .then((res: Response) => res.json());

    }

    moveLeft(camera: Camera,appName: string): Promise<Response> {

        let streamInfoUrl = HTTP_SERVER_ROOT + appName +'/rest/camera/moveLeft?ipAddr='+camera.ipAddr;
        console.log('URL ' + streamInfoUrl);

        return this.http.get(streamInfoUrl).toPromise()
            .then(this.extractData)
            .catch(this.handleError);

    }

    moveRight(camera: Camera,appName: string): Promise<Response> {

        let streamInfoUrl = HTTP_SERVER_ROOT + appName +'/rest/camera/moveRight?ipAddr='+camera.ipAddr;
        console.log('URL ' + streamInfoUrl);

        return this.http.get(streamInfoUrl).toPromise()
            .then(this.extractData)
            .catch(this.handleError);

    }

    moveUp(camera: Camera,appName: string): Promise<Response> {

        let streamInfoUrl = HTTP_SERVER_ROOT + appName +'/rest/camera/moveUp?ipAddr='+camera.ipAddr;
        console.log('URL ' + streamInfoUrl);

        return this.http.get(streamInfoUrl).toPromise()
            .then(this.extractData)
            .catch(this.handleError);

    }

    moveDown(camera: Camera,appName: string): Promise<Response> {

        let streamInfoUrl = HTTP_SERVER_ROOT + appName +'/rest/camera/moveDown?ipAddr='+camera.ipAddr;
        console.log('URL ' + streamInfoUrl);

        return this.http.get(streamInfoUrl).toPromise()
            .then(this.extractData)
            .catch(this.handleError);

    }

    editCameraInfo(camera: Camera,appName: string): Promise<Response> {

        let streamInfoUrl = HTTP_SERVER_ROOT + appName +'/rest/camera/updateCamInfo';
        console.log('URL ' + streamInfoUrl);

        return this.http.post(streamInfoUrl,camera).toPromise()
            .then(this.extractData)
            .catch(this.handleError);

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

    public getApplications(): Observable<Response> {
        return this.http.get(REST_SERVICE_ROOT + '/getApplications')
            .map((res: Response) => res.json());;
    }


    private extractData(res: Response) {
        let body = res.json();
        return body || { };
    }

}