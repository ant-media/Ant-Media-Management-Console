import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {AppSettings, ServerSettings} from "../app.page/app.definitions";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';
import {HttpClient, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Endpoint,PlaylistItem} from "../app.page/app.definitions";
import { filter } from 'rxjs-compat/operator/filter';

declare function require(name: string);

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
    playListItemList: PlaylistItem[];
    hlsViewerCount: number = 0;
    webRTCViewerCount : number = 0;
    rtmpViewerCount : number = 0;
    mp4Enabled : number = 0;
    webRTCViewerLimit: number;
    hlsViewerLimit: number;
    currentPlayIndex: number;

    constructor() {
        this.playListItemList = [];
    }
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor{
    constructor(){}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let str = req.url;
        let appName;
        //For internal requests
        if(str.includes("_path=")){
            var begin = str.indexOf("_path=");
            var last = str.indexOf("/rest/v2");
            appName = str.substring(begin+6, last);
        }
        //for remote requests
        else if(str.includes("rest/v2")){
            var begin = str.indexOf(":5080/");
            var last = str.indexOf("/rest/v2");
            appName = str.substring(begin+6, last);
        }
        let currentAppJwtToken = localStorage.getItem(appName+'jwtToken');
        let currentAppJwtStatus =  localStorage.getItem(appName+'jwtControlEnabled');

        // Check AppName, JWT Token status and JWT Token not null
        if(appName != null && currentAppJwtToken != null && currentAppJwtStatus != "false"){
            req = req.clone({
                withCredentials: true,
                headers: req.headers.append('Authorization', currentAppJwtToken).append('Content-Type', 'application/json')
            });
        }
        else {
            req = req.clone({
                withCredentials: true
            });
        }

        return next.handle(req);
    }
}

@Injectable()
export class RestService {

    /**
     * Cache server response
     */
    isEnterpriseObject:Object = null;

    constructor(private http: HttpClient, private router: Router)
    {
        if (!location.protocol.startsWith("https"))
        {
            HTTP_SERVER_ROOT = "http://" + location.hostname + ":" + location.port + "/";
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
        if (location.port == "4200")
        {
            //if it is angular development
            HTTP_SERVER_ROOT = "//" + location.hostname + ":5080/";
        }
        else if (location.protocol.startsWith("https")){
            HTTP_SERVER_ROOT = "https://" + location.hostname + ":" + location.port + "/";
        }
        REST_SERVICE_ROOT = HTTP_SERVER_ROOT + "rest";
    }

    public isShutdownProperly(appNames: string): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + '/shutdown-properly?appNames=' + appNames);
    }

    public setShutdownProperly(appNames: string): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + '/setShutdownProperly?appNames=' + appNames);
    }

    public getSystemResourcesInfo(): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + '/getSystemResourcesInfo');
    }

    public getCPULoad(): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + '/getCPUInfo');
    }

    public checkAuthStatus(networkName: string, appName: string): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName + "/rest/v2/broadcasts/social-network-status/" + networkName,
            {});
    }    

    public getVersion(): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/getVersion");
    }

    public getDetectionList(appName:string, streamId:string, offset:number, size:Number): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/v2/broadcasts/'+streamId+'/detections/'+offset+"/"+size);
    }

    public getObjectDetectedTotal(appName:string, streamId:string): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/v2/broadcasts/' + streamId + '/detections/count');
    }

    public getAppLiveStreams(appName:string, offset:Number, size:Number, sortBy:string, orderBy:string, filterValue:string): Observable<Object> {
        if(filterValue == null){
            return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/v2/broadcasts/list/'+offset+"/"+size
            +"&sort_by="+sortBy+"&order_by="+orderBy,{});
        }else{
            return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/v2/broadcasts/list/'+offset+"/"+size
                +"&sort_by="+sortBy+"&order_by="+orderBy+"&search="+filterValue,{});
        }
    }

    public getBroadcast(appName: string, id: string): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName + "/rest/v2/broadcasts/" + id);
    }

    public createLiveStream(appName: string, liveBroadcast: LiveBroadcast, REMOTE_REST_SERVICE_ROOT: string, socialNetworks:string): Observable<Object> {
        var autoStart = false;
        let REST_SERVICE_ADDRESS;

        if (liveBroadcast.type == "ipCamera" || liveBroadcast.type == "streamSource") {
            autoStart = true;
        }
        if(REMOTE_REST_SERVICE_ROOT == null){
            REST_SERVICE_ADDRESS = REST_SERVICE_ROOT + "/request?_path=" + appName + "/rest/v2/broadcasts/create&autoStart="+autoStart+"&socialNetworks="+socialNetworks;
        }
        else{
            REST_SERVICE_ADDRESS = REMOTE_REST_SERVICE_ROOT + "/" + appName + "/rest/v2/broadcasts/create?autoStart="+autoStart+"&socialNetworks="+socialNetworks;
        }

    return this.http.post(REST_SERVICE_ADDRESS,
    liveBroadcast);
    }

    public updateLiveStream(appName: string, broadcast: LiveBroadcast, socialNetworks): Observable<Object> {
        return this.http.put(REST_SERVICE_ROOT + "/request?_path=" + appName + "/rest/v2/broadcasts/"+broadcast.streamId+"?socialNetworks="+socialNetworks,
            broadcast);
    }

    public stopStream(appName: string, streamId: string): Observable<Object> {
        return this.http.post(REST_SERVICE_ROOT + "/request?_path=" + appName + "/rest/v2/broadcasts/" + streamId + "/stop", {});
    }

    public startStream(appName: string, streamId: string): Observable<Object> {
        return this.http.post(REST_SERVICE_ROOT + "/request?_path=" + appName + "/rest/v2/broadcasts/" + streamId + "/start", {});
    }

    public deleteBroadcast(appName: string, streamId:string, REMOTE_REST_SERVICE_ROOT:string): Observable<Object> {
        let REST_SERVICE_ADDRESS;
        if(REMOTE_REST_SERVICE_ROOT == null){
            REST_SERVICE_ADDRESS = REST_SERVICE_ROOT + "/request?_path=" +  appName + '/rest/v2/broadcasts/'+streamId;
        }
        else{
            REST_SERVICE_ADDRESS = REMOTE_REST_SERVICE_ROOT + "/" + appName + '/rest/v2/broadcasts/'+streamId;
        }
        return this.http.delete(REST_SERVICE_ADDRESS, {});
    }

    public deleteVoDFile(appName: string, vodName:string,id:number, type:string) {
        return this.http.delete(REST_SERVICE_ROOT + "/request?_path=" +  appName + '/rest/v2/vods/'+id, {});
    }

    public deleteRTMPEndpointV2(appName: string, id:number, endpointServiceId:string) {
        return this.http.delete(REST_SERVICE_ROOT + "/request?_path=" +  appName + '/rest/v2/broadcasts/'+id+ '/rtmp-endpoint?endpointServiceId='+endpointServiceId, {});
    }

    public deleteRTMPEndpointV1(appName: string, id:number, rtmpUrl:string) {
        return this.http.delete(REST_SERVICE_ROOT + "/request?_path=" +  appName + '/rest/v2/broadcasts/'+id+ '/endpoint?rtmpUrl='+rtmpUrl, {});
    }

    public addRTMPEndpoint(appName: string,id:number, endpoint:Endpoint) {
        return this.http.post(REST_SERVICE_ROOT + "/request?_path=" +  appName + '/rest/v2/broadcasts/'+id+ '/rtmp-endpoint',
            endpoint);
    }

    public revokeSocialNetwork(appName: string, serviceId:string): Observable<Object> {
        return this.http.delete(REST_SERVICE_ROOT + "/request?_path=" +  appName + '/rest/v2/broadcasts/social-networks/'+serviceId, {});
    }

    public isEnterpriseEdition(): Observable<Object> {    
            
        return new Observable(observer => 
        {
            if (this.isEnterpriseObject == null) 
            {
                this.http.get(REST_SERVICE_ROOT + "/isEnterpriseEdition").subscribe(data => {
                  //cache value
                  this.isEnterpriseObject = data;
                  observer.next(this.isEnterpriseObject);
                });
            }
            else {
                //use the cached value 
                observer.next(this.isEnterpriseObject);
            }
        });
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

    public get(url: string, options:any): Observable<Object> {
        return this.http.get(url, options);
    }

    public getSocialEndpoints(appName: string): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName + "/rest/v2/broadcasts/social-endpoints/0/20");
    }

    public setSocialNetworkChannel(appName: string, serviceId: string, type:string, value:string): Observable<Object> {
        return this.http.put(REST_SERVICE_ROOT + "/request?_path=" + appName + "/rest/v2/broadcasts/social-networks-channels/"
            +serviceId+"/"+type+"/"+value, {});
    }

    public getSocialNetworkChannelList(appName: string, serviceId: string, type: string): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName + "/rest/v2/broadcasts/social-networks-channel-lists/"+ serviceId +"/" + type);
    }

    public getSettings(appName: string): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/getSettings/" + appName);
    }
    public getServerSettings(): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/getServerSettings/" );
    }

    public changeSettings(appName: string, appSettings: AppSettings ): Observable<Object> {
        return this.http.post(REST_SERVICE_ROOT + '/changeSettings/' + appName, appSettings);
    }

    public changeServerSettings(serverSettings: ServerSettings ): Observable<Object> {
        return this.http.post(REST_SERVICE_ROOT + '/changeServerSettings', serverSettings);
    }
    public getDeviceAuthParameters(appName: string, networkName: string): Observable<Object> {
        return this.http.post(REST_SERVICE_ROOT + "/request?_path=" + appName + "/rest/v2/broadcasts/social-networks/" + networkName, {});
    }

    public getLicenseStatus(licenceKey : string): Observable<Object> {
        return  this.http.get(REST_SERVICE_ROOT + '/getLicenceStatus/?key='+ licenceKey);
    }

    public getLastLicenseStatus(): Observable<Object> {
        return  this.http.get(REST_SERVICE_ROOT + '/getLastLicenceStatus');
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

    public getLogFile(offset:number, logType:string): Observable<Object>{
        return this.http.get(REST_SERVICE_ROOT + '/getLogFile/' + offset +'/10000/?logType='+ logType);
    }

    public getLogLevel(): Observable<Object>{
        return this.http.get(REST_SERVICE_ROOT + '/getLogLevel');
    }

    public changeLogLevel(logLevel : string): Observable<Object>{
        return this.http.get(REST_SERVICE_ROOT + '/changeLogLevel/'+logLevel);
    }


    public getVodList(appName:string, offset:Number, size:Number, sortBy: String, orderBy: String, filterValue: String): Observable<Object>  {
        if(filterValue == null){
            return this.http.get(REST_SERVICE_ROOT + "/request?_path="  +  appName + '/rest/v2/vods/list/'+offset+"/"+size
                +"&sort_by="+sortBy+"&order_by="+orderBy,{});
        }
        else{
            return this.http.get(REST_SERVICE_ROOT + "/request?_path="  +  appName + '/rest/v2/vods/list/'+offset+"/"+size
                +"&sort_by="+sortBy+"&order_by="+orderBy+"&search="+filterValue,{});
        }
    }

    public getCameraError(appName: string , ipAddr:string): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/v2/broadcasts/' + ipAddr + '/ip-camera-error', {});
    }


    public getTotalVodNumber(appName: string, filterValue : string): Observable<Object> {
        if(filterValue == null){
            return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/v2/vods/count', {});
        }
        else{
            return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/v2/vods/count/' + filterValue, {});
        }
    }


    public getTotalBroadcastNumber(appName: string, filterValue : string): Observable<Object> {
        if(filterValue == null){
            return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/v2/broadcasts/count', {});
        }
        else{
            return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/v2/broadcasts/count/' + filterValue, {});
        }
    }

    public uploadVod(fileName:string, formData:any,appName:string): Observable<Object>  {
        return this.http.post(REST_SERVICE_ROOT + "/request?_path=" +  appName + "/rest/v2/vods/create?name="+fileName, formData);
    }

    /**
     * This method gets comments from social endpoint like facebook, youtube, ...
     */
    public getLiveComments(appName: string, streamId: string, serviceId:string, offset:number, batch:number): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName
                + "/rest/v2/broadcasts/"+streamId+"/social-endpoints/" + serviceId + "/live-comments/" + offset + "/" + batch );
    }

    /**
     * This methods get live comments count from social endpoint like facebook, youtube,...
     */
    public getLiveCommentsCount(appName: string, streamId: string, serviceId:string): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName
                + "/rest/v2/broadcasts/"+streamId+"/social-endpoints/" + serviceId + "/live-comments-count");
    }

    /**
     * This methods get interactions(like, dislike, etc.) from social endpoint like facebook, youtube,...
     */
    public getInteraction(appName: string, streamId: string, serviceId:string) : Observable<Object>{
        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName
                    + "/rest/v2/broadcasts/" + streamId + "/social-endpoints/" + serviceId + "/interaction");
    }

    /**
     * This methods get live views count from social endpoint like facebook, youtube,...
     */
    public getLiveViewsCount(appName: string, streamId: string, serviceId:string) : Observable<Object>{
        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName
                    + "/rest/v2/broadcasts/" + streamId + "/social-endpoints/" + serviceId + "/live-views-count");
    }

    /**
     * This methods get live views count from social endpoint like facebook, youtube,...
     */
    public getToken(appName: string, streamId: string, expireDate:number) : Observable<Object>{
       return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName
            + "/rest/v2/broadcasts/"+ streamId + "/token&expireDate="  + expireDate + "&type=play" );
    }

    public getRtmpUrl(appName:string, streamId:string): string {
       return "rtmp://" + SERVER_ADDR + "/" + appName + "/" + streamId;
    }

    public getText(Url: string): Observable<Object> {
        return this.http.get(Url, { responseType: 'text' });
    }

    public  autoDiscover(appName: string): Observable<any> {

        let streamInfoUrl = REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/v2/broadcasts/onvif-devices';

        return this.http.get(streamInfoUrl);

    }

    moveLeft(camera: LiveBroadcast,appName: string): Observable<Object> {

        let streamInfoUrl = REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/v2/broadcasts/'+camera.streamId+'/ip-camera/move-left';

        return this.http.post(streamInfoUrl, {});
    }

    //TODO: test
    moveRight(camera: LiveBroadcast,appName: string): Observable<Object> {

        let streamInfoUrl = REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/v2/broadcasts/'+camera.streamId+'/ip-camera/move-right';

        return this.http.post(streamInfoUrl, {});

    }

    moveUp(camera: LiveBroadcast,appName: string): Observable<Object> {

        let streamInfoUrl = REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/v2/broadcasts/'+camera.streamId+'/ip-camera/move-up';

        return this.http.post(streamInfoUrl, {});

    }

    moveDown(camera: LiveBroadcast,appName: string): Observable<Object> {

        let streamInfoUrl = REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/v2/broadcasts/'+camera.streamId+'/ip-camera/move-down';

        return this.http.post(streamInfoUrl, {});
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

    public getStats(appName:string, streamId:string): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/v2/broadcasts/' + streamId + '/broadcast-statistics');
    }

    public getWebRTCStatsList(appName:string, streamId:string, offset:Number, size:Number): Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/v2/broadcasts/'+streamId+'/webrtc-client-stats/'+offset+"/"+size);
    }
    public setStreamRecordingStatus(appName:string, streamId:string, recordingStatus:boolean, recordingType:string): Observable<Object> {
        return this.http.put(REST_SERVICE_ROOT + "/request?_path=" + appName + '/rest/v2/broadcasts/'+streamId+'/recording/'+recordingStatus+'?recordType='+recordingType,
            {});
    }
}
