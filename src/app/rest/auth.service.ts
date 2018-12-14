import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {CanActivate, Router} from '@angular/router';
import {RestService, User} from './rest.service';


@Injectable()
export class AuthService implements CanActivate {

  public isAuthenticated: boolean = false;

  constructor(private restService: RestService, private router: Router) {
    setInterval(() => {
      this.checkServerIsAuthenticated();
    }, 5000);

  }

  test(): string {
    return 'working';
  }

  login(email: string, password: string): Observable<Object> {

    let user = new User(email, password);

    return this.restService.authenticateUser(user);
  }

  changeUserPassword(email: string, password: string, newPassword: string): Observable<Object> {
    let user = new User(email, password);
    user.newPassword = newPassword;
    return this.restService.changePassword(user);
  }

  isFirstLogin(): Observable<Object> {
    return this.restService.isFirstLogin();
  }

  createFirstAccount(user: User): Observable<Object> {
    return this.restService.createFirstAccount(user);
  }

  checkServerIsAuthenticated(): void {

    if (localStorage.getItem('authenticated')) {
      this.restService.isAuthenticated().subscribe(data => {

        this.isAuthenticated = data["success"];
        console.log("authenticated --> " + data["success"]);
        if (!this.isAuthenticated) {
          this.router.navigateByUrl('/pages/login');
        }
        if(this.router.url=="/pages/login"){
                  this.router.navigateByUrl('/dashboard/overview');
        }
      },
        error => {
          this.isAuthenticated = false;
          this.router.navigateByUrl('/pages/login');
        });
    }
    else{
        this.isAuthenticated = false;
    }
  }

  canActivate(): boolean {
    /*
    
    */

    if (localStorage.getItem('authenticated') && this.isAuthenticated) {

        this.restService.isAuthenticated().subscribe(data => {

                this.isAuthenticated = data["success"];

                if (!this.isAuthenticated) {
                    this.router.navigateByUrl('/pages/login');
                }
                if(this.router.url=="/pages/login"){
                    this.router.navigateByUrl('/dashboard/overview');
                }
            },
            error => {
                this.isAuthenticated = false;
                this.router.navigateByUrl('/pages/login');
            });
      return true;
    }
    else {
      this.router.navigateByUrl('/pages/login');
      this.isAuthenticated = false;
      return false;
    }

  }

}
