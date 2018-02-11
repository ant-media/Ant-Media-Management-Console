import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {
  HttpRequest,
  HttpHandler,
  HttpInterceptor,
  HttpEvent
} from '@angular/common/http';
import { AppSettings } from '../app.page/app.page.component';


export class User {

    public newPassword: string;
    public fullName: string;
  
    constructor(public email: string, public password: string) { }
  }

export const SERVER_ADDR = location.hostname;
export var HTTP_SERVER_ROOT;

if (environment.production) {
    HTTP_SERVER_ROOT = "//" + location.hostname + ":" + location.port + "/"; 
}
else {
    HTTP_SERVER_ROOT = "//" + location.hostname + ":5080/"; 
}


export const REST_SERVICE_ROOT = HTTP_SERVER_ROOT + "ConsoleApp/rest";

export class LiveBroadcast {
    public name

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
        return this.http.post(HTTP_SERVER_ROOT + appName + "/rest/broadcast/checkDeviceAuthStatus/" + networkName,
            {});
    }


    public getAppLiveStreams(appName:string, offset:Number, size:Number): Observable<Object> {
        return this.http.get(HTTP_SERVER_ROOT +  appName + '/rest/broadcast/getList/'+offset+"/"+size);
    }

    public createLiveStream(appName: string, liveBroadcast: LiveBroadcast, socialNetworks:string): Observable<Object> {


        return this.http.post(HTTP_SERVER_ROOT + appName + "/rest/broadcast/createWithSocial?socialNetworks="+socialNetworks,
            liveBroadcast);
    }

    public deleteBroadcast(appName: string, streamId:string): Observable<Object> {
        return this.http.post(HTTP_SERVER_ROOT +  appName + '/rest/broadcast/delete/'+streamId, {});
    }

    public deleteVoDFile(appName: string, streamId:string) {
        return this.http.post(HTTP_SERVER_ROOT +  appName + '/rest/broadcast/deleteVoDFile/'+streamId, {});

    }

    public revokeSocialNetwork(appName: string, serviceName:string): Observable<Object> {
        return this.http.post(HTTP_SERVER_ROOT +  appName + '/rest/broadcast/revokeSocialNetwork/'+serviceName, {});
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

    public setSocialNetworkChannel(appName: string, serviceName: string, type:string, value:string): Observable<Object> {
        return this.http.post(HTTP_SERVER_ROOT + appName + "/rest/broadcast/setSocialNetworkChannel/"
                +serviceName+"/"+type+"/"+value, {});
    }

    public getSocialNetworkChannelList(appName: string, serviceName: string, type: string): Observable<Object> {
        return this.http.get(HTTP_SERVER_ROOT + appName + "/rest/broadcast/getSocialNetworkChannelList/"+serviceName +"/" + type);
    }

    public getSocialNetworkChannel(appName: string, serviceName: string): Observable<Object> {
       return this.http.get(HTTP_SERVER_ROOT + appName + "/rest/broadcast/getSocialNetworkChannel/" + serviceName, {});
    }

    public getSettings(appName: string) : Observable<Object> {
        return this.http.get(REST_SERVICE_ROOT + "/getSettings/" + appName);
    }

    public checkDeviceAuthStatus(appName: string, serviceName:string): Observable<Object> {
        return this.http.post(HTTP_SERVER_ROOT + appName + "/rest/broadcast/checkDeviceAuthStatus/" + serviceName, {});
    }

    public changeSettings(appName: string, appSettings: AppSettings ): Observable<Object> {
        return this.http.post(REST_SERVICE_ROOT + '/changeSettings/' + appName, appSettings);
    }

    public getDeviceAuthParameters(appName: string, networkName: string): Observable<Object> {
        return this.http.post(HTTP_SERVER_ROOT + appName + "/rest/broadcast/getDeviceAuthParameters/" + networkName, {});
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
    
            
}