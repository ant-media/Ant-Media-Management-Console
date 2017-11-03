import { Injectable } from '@angular/core';
import { REST_SERVICE_ROOT, HTTP_SERVER_ROOT } from './rest.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { CanActivate, Router } from '@angular/router';

export class User {

  public newPassword: string;
  public fullName: string;

  constructor(public email: string, public password: string) { }
}

@Injectable()
export class AuthService implements CanActivate {

  private isAuthenticated: boolean = true;

  constructor(private http: HttpClient, private router: Router) {
    setInterval(() => {
      this.checkServerIsAuthenticated();
    }, 10000);

  }

  test(): string {
    return 'working';
  }

  login(email: string, password: string): Observable<Object> {

    let user = new User(email, password);

    return this.http.post(REST_SERVICE_ROOT + "/authenticateUser", user);
  }

  changeUserPassword(email: string, password: string, newPassword: string): Observable<Object> {
    let user = new User(email, password);
    user.newPassword = newPassword;
    return this.http.post(REST_SERVICE_ROOT + "/changeUserPassword", user);
  }

  isFirstLogin(): Observable<Object> {
    return this.http.get(REST_SERVICE_ROOT + "/isFirstLogin");
  }

  createFirstAccount(user: User): Observable<Object> {
    return this.http.post(REST_SERVICE_ROOT + "/addInitialUser", user);
  }

  checkServerIsAuthenticated(): void {

    if (localStorage.getItem('authenticated')) {
      this.http.get(REST_SERVICE_ROOT + "/isAuthenticated").subscribe(data => {

        this.isAuthenticated = data["success"];
        if (!this.isAuthenticated) {
          this.router.navigateByUrl('/pages/login');
        }
      },
        error => {
          this.isAuthenticated = false;
          this.router.navigateByUrl('/pages/login');
        });
    }
  }

  canActivate(): boolean {
    /*
    
    */

    if (localStorage.getItem('authenticated') && this.isAuthenticated) {
      return true;
    }
    else {
      this.router.navigateByUrl('/pages/login');
      return false;
    }

  }

}
