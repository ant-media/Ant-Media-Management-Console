import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
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

let SERVER_ADDR = location.hostname;

export var HTTP_SERVER_ROOT;
export var REST_SERVICE_ROOT;

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
    hlsViewerCount: number = 0;
    webRTCViewerCount : number = 0;
    rtmpViewerCount : number = 0;
    mp4Enabled : number = 0;
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
    constructor(private http: HttpClient, private router: Router) 
    {
        HTTP_SERVER_ROOT = "//" + location.hostname + ":" + location.port + "/";
        REST_SERVICE_ROOT = HTTP_SERVER_ROOT + "rest";
        if (location.port == "4200") 
        {
            //if it is angular development
            HTTP_SERVER_ROOT = "//" + location.hostname + ":5080/";
            REST_SERVICE_ROOT = HTTP_SERVER_ROOT + "rest";
        }
        else if (!location.protocol.startsWith("https")) 
        {
            //protocol is not https, check that https is available
            let url = "https://" + location.hostname + ":5443/";
            this.http.head(url).subscribe(data => {
                HTTP_SERVER_ROOT = url;
                REST_SERVICE_ROOT = HTTP_SERVER_ROOT + "rest";
            },
            error => {
                console.log("No https avaiable");
            });
        } 
    }

    public getSystemResourcesInfo(): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + '/getSystemResourcesInfo');
    }

    public getCPULoad(): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + '/getCPUInfo');
    }

    public checkAuthStatus(networkName: string, appName: string): Observable<Object> {
        return this.http.post(REST_SERVICE_ROOT + "/request?_path=" + appName + "/rest/broadcast/checkDeviceAuthStatus/" + networkName,
            {});
    }

    public getVersion(): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/getVersion");
    }

    public getDetectionList(appName:string, streamId:string, offset:number, size:Number): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/detection/getList/'+offset+"/"+size+"?id="+streamId);
    }

    public getObjectDetectedTotal(appName:string, streamId:string): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/detection/getObjectDetectedTotal?id='+streamId);
    }

    public getAppLiveStreams(appName:string, offset:Number, size:Number): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/broadcast/getList/'+offset+"/"+size);
    }

    public getBroadcast(appName: string, id: string): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName + "/rest/broadcast/get?id=" + id);
    }

    public stopBroadcast(appName: string, id: string): Observable<Object> {

        return this.http.post(REST_SERVICE_ROOT + "/request?_path=" + appName + "/rest/broadcast/stop?id=" + id, {});
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

    public deleteVoDFile(appName: string, vodName:string,id:number, type:string) {
        return this.http.post(REST_SERVICE_ROOT + "/request?_path=" +  appName + '/rest/broadcast/deleteVoDFile/'+ vodName+'/'+id +'/'+ type, {});

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

    public getCameraError(appName: string , id:string): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/streamSource/getCameraError?id=' + id, {});
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

    /**
     * This method gets comments from social endpoint like facebook, youtube, ...
     */
    public getLiveComments(appName: string, streamId: string, serviceId:string, offset:number, batch:number): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName 
                + "/rest/broadcast/getLiveComments/" + serviceId + "/"  + streamId + "/" + offset + "/" + batch );
    }

    /**
     * This methods get live comments count from social endpoint like facebook, youtube,...
     */
    public getLiveCommentsCount(appName: string, streamId: string, serviceId:string): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName 
                + "/rest/broadcast/getLiveCommentsCount/" + serviceId + "/"  + streamId );
    }

    /**
     * This methods get interactions(like, dislike, etc.) from social endpoint like facebook, youtube,...
     */
    public getInteraction(appName: string, streamId: string, serviceId:string) : Observable<Object>{
        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName 
                    + "/rest/broadcast/getInteraction/" + serviceId + "/"  + streamId );
    }

    /**
     * This methods get live views count from social endpoint like facebook, youtube,...
     */
    public getLiveViewsCount(appName: string, streamId: string, serviceId:string) : Observable<Object>{
        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName 
                    + "/rest/broadcast/getLiveViewsCount/" + serviceId + "/"  + streamId );
    }

    /**
     * This methods get live views count from social endpoint like facebook, youtube,...
     */
    public getToken(appName: string, streamId: string, expireDate:number) : Observable<Object>{
        console.log("stream id in rest service" + streamId);
        var url = REST_SERVICE_ROOT + "/request?_path=" + appName
            + '/rest/broadcast/getToken&id=' + streamId + '&expireDate='  + expireDate + '&type=play';

        console.log("url in rest service : " + url);
        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName
            + "/rest/broadcast/getToken&id=" + streamId + "&expireDate="  + expireDate + "&type=play" );
    }

    public getRtmpUrl(appName:string, streamId:string): string {
       return "rtmp://" + SERVER_ADDR + "/" + appName + "/" + streamId;
    }

    public getText(Url: string): Observable<Object> {
        return this.http.get(Url, { responseType: 'text' });
    }

    public deleteIPCamera(appName: string, streamId:string): Observable<Object> {

        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/streamSource/deleteCamera?ipAddr=' + streamId, {});
    }

    public addStreamSource(appName: string, stream: LiveBroadcast, socialNetworks:string): Observable<Object> {

        let url = REST_SERVICE_ROOT + "/request?_path=" + appName + "/rest/streamSource/addStreamSource?socialNetworks="+socialNetworks;


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

        let streamInfoUrl = REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/streamSource/moveLeft?id=' + camera.streamId;
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

    editCameraInfo(camera: LiveBroadcast,appName: string, socialNetworks):Observable<Object> {

        let streamInfoUrl = REST_SERVICE_ROOT + "/request?_path=" + appName + "/rest/streamSource/updateCamInfo?socialNetworks="+socialNetworks;
        console.log('URL ' + streamInfoUrl);

        return this.http.post(streamInfoUrl,camera);

    }
    private extractData(res: Response) {
        let body = res.json();
        return body || { };
    }

    validateIPaddress(ipaddress : string) : boolean {
        if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {
            return true;
        }
        return false;
    }

    checkStreamUrl(url : string) : boolean{

        var streamUrlControl = false;

        var ipAddr;

        if(url.includes("//")){

            ipAddr = url.split("//");

            ipAddr = ipAddr[1];

        } else { ipAddr = url;

        }

        if (ipAddr.includes("@")){

            ipAddr = ipAddr.split("@");

            ipAddr = ipAddr[1];

        }

        if (ipAddr.includes(":")){

            ipAddr = ipAddr.split(":");

            ipAddr = ipAddr[0];

        }

        if (ipAddr.includes("/")){

            ipAddr = ipAddr.split("/");

            ipAddr = ipAddr[0];

        }

        console.log("ipAddress: " + ipAddr);

        if( url.startsWith("http://") ||
            url.startsWith("https://") ||
            url.startsWith("rtmp://") ||
            url.startsWith("rtmps://") ||
            url.startsWith("rtsp://")) {

            streamUrlControl=true;
        }


        if(ipAddr.split(".").length == 4){
            if(!this.validateIPaddress(ipAddr)){
                console.log("not valid IP");
                streamUrlControl=false;

                return;
            }
        }

        return streamUrlControl;

    }

    public checkStreamName(name:string) {

        if (!name || name.length === 0 || /^\s*$/.test(name) ){

            return false;
        }
        else{
            return true;
        }
    }

    public isInClusterMode(): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/isInClusterMode");
    }

    public getWebRTCStats(appName:string, streamId:string): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/broadcast/getWebRTCClientStats/'+streamId);
    }

    public getWebRTCStatsList(appName:string, streamId:string, offset:Number, size:Number): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/broadcast/getWebRTCClientStatsList/'+offset+"/"+size+"/"+streamId);
    }
}