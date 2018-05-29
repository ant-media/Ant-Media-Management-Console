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
import {Endpoint} from "../app.page/app.definitions";


export class User {

    public newPassword: string;
    public fullName: string;

    constructor(public email: string, public password: string) { }
}


export const SERVER_ADDR = location.hostname;
export var HTTP_SERVER_ROOT;

if (location.port == "4200") {
    HTTP_SERVER_ROOT = "//" + location.hostname + ":5080/";
}
else {
    HTTP_SERVER_ROOT = "//" + location.hostname + ":" + location.port + "/";
}


export const REST_SERVICE_ROOT = HTTP_SERVER_ROOT + "ConsoleApp/rest";

export class LiveBroadcast {
    name: string;
    type:string;
    streamId: string;
    viewerCount: number;
    status: string;
    ipAddr:string;
    username:string;
    password:string;
    streamUrl: string;
    date:number;
    duration:number;
    description:string;
    quality: string;
    speed: number;
    endPointList:Endpoint[];
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor{
    constructor(){}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        req = req.clone({
            withCredentials: true
        });
        return next.handle(req);
    }
}




@Injectable()
export class RestService {
    constructor(private http: HttpClient, private router: Router) {
    }

    public getCPULoad(): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + '/getCPUInfo');
    }

    public checkAuthStatus(networkName: string, appName: string): Observable<Object> {
        return this.http.post(REST_SERVICE_ROOT + "/request?_path=" + appName + "/rest/broadcast/checkDeviceAuthStatus/" + networkName,
            {});
    }

    public getVersionList(appName: string): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/broadcast/getVersion');
    }

    public getDetectionList(appName:string, streamId:string, offset:number, size:Number): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/detection/getList/'+offset+"/"+size+"?id="+streamId);
    }

    public getAppLiveStreams(appName:string, offset:Number, size:Number): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/broadcast/getList/'+offset+"/"+size);
    }

    public getBroadcast(appName: string, id: string): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName + "/rest/broadcast/get?id=" + id);
    }

    public createLiveStream(appName: string, liveBroadcast: LiveBroadcast, socialNetworks:string): Observable<Object> {

        return this.http.post(REST_SERVICE_ROOT + "/request?_path=" + appName + "/rest/broadcast/createWithSocial?socialNetworks="+socialNetworks,
            liveBroadcast);
    }

    public updateLiveStream(appName: string, broadcast: LiveBroadcast, socialNetworks): Observable<Object> {

        return this.http.post(REST_SERVICE_ROOT + "/request?_path=" + appName + "/rest/broadcast/update?socialNetworks="+socialNetworks,
            broadcast);
    }

    public importLiveStreams2Stalker(appName: string): Observable<Object> {
        return this.http.post(REST_SERVICE_ROOT + "/request?_path=" + appName + "/rest/importLiveStreamsToStalker", {});
    }

    public importVoDStreams2Stalker(appName: string): Observable<Object> {
        return this.http.post(REST_SERVICE_ROOT + "/request?_path=" + appName + "/rest/importVoDsToStalker", {});
    }

    public deleteBroadcast(appName: string, streamId:string): Observable<Object> {
        return this.http.post(REST_SERVICE_ROOT + "/request?_path=" +  appName + '/rest/broadcast/delete/'+streamId, {});
    }

    public deleteVoDFile(appName: string, vodName:string,id:number) {
        return this.http.post(REST_SERVICE_ROOT + "/request?_path=" +  appName + '/rest/broadcast/deleteVoDFile/'+vodName+'/'+id, {});

    }

    public revokeSocialNetwork(appName: string, serviceName:string): Observable<Object> {
        return this.http.post(REST_SERVICE_ROOT + "/request?_path=" +  appName + '/rest/broadcast/revokeSocialNetwork/'+serviceName, {});
    }

    public isEnterpriseEdition(): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/isEnterpriseEdition");
    }

    public handleError(error: Response) {

        if (error.status == 401) {
            console.log("error -response: --> " + error);
            this.router.navigateByUrl("/pages/login");
        }
        return Observable.throw(error || 'Server error');
    }

    public getApplications(): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + '/getApplications');
    }

    public authenticateUser(user: User): Observable<Object> {
        return this.http.post(REST_SERVICE_ROOT + "/authenticateUser", user);
    }

    public changePassword(user: User): Observable<Object> {
        return this.http.post(REST_SERVICE_ROOT + "/changeUserPassword", user);
    }

    public isFirstLogin(): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/isFirstLogin");
    }

    public createFirstAccount(user: User): Observable<Object> {
        return this.http.post(REST_SERVICE_ROOT + "/addInitialUser", user);
    }

    public isAuthenticated(): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/isAuthenticated");
    }

    public getVoDStreams(appName: String): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + '/getAppVoDStreams/' + appName);
    }

    public get(url: string, options:any): Observable<Object> {
        return this.http.get(url, options);
    }

    public getSocialEndpoints(appName: string): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName + "/rest/broadcast/getSocialEndpoints/0/20");
    }

    public setSocialNetworkChannel(appName: string, serviceName: string, type:string, value:string): Observable<Object> {
        return this.http.post(REST_SERVICE_ROOT + "/request?_path=" + appName + "/rest/broadcast/setSocialNetworkChannel/"
            +serviceName+"/"+type+"/"+value, {});
    }

    public getSocialNetworkChannelList(appName: string, serviceName: string, type: string): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName + "/rest/broadcast/getSocialNetworkChannelList/"+serviceName +"/" + type);
    }

    public getSocialNetworkChannel(appName: string, serviceName: string): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName + "/rest/broadcast/getSocialNetworkChannel/" + serviceName, {});
    }

    public getSettings(appName: string): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/getSettings/" + appName);
    }

    public checkDeviceAuthStatus(appName: string, serviceName:string): Observable<Object> {
        return this.http.post(REST_SERVICE_ROOT + "/request?_path=" + appName + "/rest/broadcast/checkDeviceAuthStatus/" + serviceName, {});
    }

    public changeSettings(appName: string, appSettings: AppSettings ): Observable<Object> {
        return this.http.post(REST_SERVICE_ROOT + '/changeSettings/' + appName, appSettings);
    }

    public getDeviceAuthParameters(appName: string, networkName: string): Observable<Object> {
        return this.http.post(REST_SERVICE_ROOT + "/request?_path=" + appName + "/rest/broadcast/getDeviceAuthParameters/" + networkName, {});
    }

    public getLiveClientsSize(): Observable<Object> {
        return  this.http.get(REST_SERVICE_ROOT + '/getLiveClientsSize');
    }

    public getSystemMemoryInfo(): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + '/getSystemMemoryInfo');
    }


    public getFileSystemInfo(): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + '/getFileSystemInfo');
    }

    public getJVMMemoryInfo(): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + '/getJVMMemoryInfo');
    }

    public getApplicationsInfo(): Observable<Object>{
        return this.http.get(REST_SERVICE_ROOT + '/getApplicationsInfo');
    }

    public getVodList(appName:string, offset:Number, size:Number): Observable<Object>  {
        return this.http.get(REST_SERVICE_ROOT + "/request?_path="  +  appName + '/rest/broadcast/getVodList/'+offset+"/"+size,{});

    }

    public synchUserVodList(appName: string): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/streamSource/synchUserVoDList', {});
    }

    public getTotalVodNumber(appName: string): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/broadcast/getTotalVodNumber', {});
    }


    public getTotalBroadcastNumber(appName: string): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/broadcast/getTotalBroadcastNumber', {});
    }


    public filterAppLiveStreams(appName:string, offset:Number, size:Number,type:String): Observable<Object>  {
        return this.http.get(REST_SERVICE_ROOT + "/request?_path="  +  appName + '/rest/broadcast/filterList/'+offset+"/"+size+"/"+type,{});

    }

    public filterVod(appName:string, offset:Number, size:Number,searchParam:SearchParam): Observable<Object>  {
        return this.http.post(REST_SERVICE_ROOT + "/request?_path="   +  appName + "/rest/broadcast/filterVoD?offset="+offset+"&size="+size,searchParam);
    }


    public uploadVod(fileName:string, formData:any,appName:string): Observable<Object>  {
        return this.http.post(REST_SERVICE_ROOT + "/request?_path=" +  appName + "/rest/broadcast/uploadVoDFile/"+fileName,formData);
    }



    public createLiveStreamSocialNetworks(appName: string, liveBroadcast: LiveBroadcast, socialNetworks:string): Observable<Object> {

        return this.http.post(REST_SERVICE_ROOT + "/request?_path=" + appName + "/rest/broadcast/createWithSocial?socialNetworks=" + socialNetworks,
            liveBroadcast);
    }

    public deleteIPCamera(appName: string, streamId:string): Observable<Object> {

        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/streamSource/deleteCamera?ipAddr=' + streamId, {});
    }

    public addStreamSource(appName: string, stream: LiveBroadcast): Observable<Object> {

        let url = REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/streamSource/addStreamSource';


        return this.http.post(url, stream);
    }


    public  autoDiscover(appName: string): Observable<any> {

        let streamInfoUrl = REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/streamSource/searchOnvifDevices';
        console.log('URL ' + streamInfoUrl);

        return this.http.get(streamInfoUrl);

    }

    public  getCamList(appName: string): Observable<Object> {

        let url = REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/streamSource/getList';
        console.log('URL ' + url);

        return this.http.get(url);

    }

    moveLeft(camera: LiveBroadcast,appName: string): Observable<Object> {

        let streamInfoUrl = REST_SERVICE_ROOT + "/request?_path=" + "/request?_path=" + appName + '/rest/streamSource/moveLeft?id=' + camera.streamId;
        console.log('URL ' + streamInfoUrl);

        return this.http.get(streamInfoUrl);
    }

    moveRight(camera: LiveBroadcast,appName: string): Observable<Object> {

        let streamInfoUrl = REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/streamSource/moveRight?id=' + camera.streamId;
        console.log('URL ' + streamInfoUrl);

        return this.http.get(streamInfoUrl);

    }

    moveUp(camera: LiveBroadcast,appName: string): Observable<Object> {

        let streamInfoUrl = REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/streamSource/moveUp?id=' + camera.streamId;
        console.log('URL ' + streamInfoUrl);

        return this.http.get(streamInfoUrl);

    }

    moveDown(camera: LiveBroadcast,appName: string): Observable<Object> {

        let streamInfoUrl = REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/streamSource/moveDown?id=' + camera.streamId;
        console.log('URL ' + streamInfoUrl);

        return this.http.get(streamInfoUrl);


    }

    editCameraInfo(camera: LiveBroadcast,appName: string):Observable<Object> {

        let streamInfoUrl = REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/streamSource/updateCamInfo';
        console.log('URL ' + streamInfoUrl);

        return this.http.post(streamInfoUrl,camera);

    }
    private extractData(res: Response) {
        let body = res.json();
        return body || { };
    }

}
