import {Injectable} from '@angular/core';
import {HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import 'rxjs/add/operator/do';
 
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router:Router) {}
 
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
   
  
    return next.handle(req).do(
        event => {
            if (event instanceof HttpResponse) {
                console.log("Status code: " + event.status);
                if (event.status == 401) {
                    this.router.navigateByUrl("/pages/login");
                }
              }
        }
    );
  }
}