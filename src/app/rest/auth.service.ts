import { Injectable } from '@angular/core';
import { REST_SERVICE_ROOT, HTTP_SERVER_ROOT } from './rest.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { CanActivate, Router } from '@angular/router';

export class User {

  public newPassword:string;

  constructor(public email:string,public password:string) {}


}

@Injectable()
export class AuthService implements CanActivate{

  private isAuthenticated:boolean = true;

  constructor(private http:HttpClient, private router:Router) { }

  test(): string {
    return 'working';
  }

  login(email:string, password:string): Observable<Object>  {

    let user = new User (email, password);

    return this.http.post(REST_SERVICE_ROOT + "/authenticateUser", user);
  }

  changeUserPassword(email:string, password:string, newPassword:string): Observable<Object> {
    let user = new User (email, password);
    user.newPassword = newPassword;
    return this.http.post(REST_SERVICE_ROOT + "/changeUserPassword", user);
  }

  canActivate(): boolean {
    /*
    this.http.get(REST_SERVICE_ROOT + "/isAuthenticated").subscribe(data => {
      console.log("is authenticated" + data["success"]);
      this.isAuthenticated = data["success"];
    });
    */
    if (localStorage.getItem('authenticated')) { 
      return true;
    }
    else {
      this.router.navigateByUrl('/pages/login');
      return false;
    }
    
  }

}
