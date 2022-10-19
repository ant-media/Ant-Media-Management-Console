import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { AppPageComponent } from './app.page.component';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthInterceptor, RestService,} from '../rest/rest.service';
import { HttpClientModule } from '@angular/common/http'; 
import { AuthService, } from '../rest/auth.service';
import { DatePipe, HashLocationStrategy, LocationStrategy } from '@angular/common';
import {Observable} from "rxjs";
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ExpectedConditions } from 'protractor';
import {ClusterRestService} from "../rest/cluster.service";


describe('AppComponent', () => {

  let component: AppPageComponent;
  let fixture: ComponentFixture<AppPageComponent>;
  const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);



  const restServiceSpy = jasmine.createSpyObj('RestService', ['isEnterpriseEdition', 'getApplications']);
  restServiceSpy.isEnterpriseEdition.and.returnValue(new Observable(observer => 
    {
      let data = [];
      data["success"] = false;
      observer.next(data);  
    }));
  restServiceSpy.getApplications.and.returnValue(new Observable(observer => 
      {
        let data = [];
        data["applications"] = ["LiveApp", "WebRTCAppEE"];
        observer.next(data);  
      }));  


  beforeEach(async(() => {
    
    TestBed.configureTestingModule({
      declarations: [
        AppPageComponent,
      ],
      imports: [
        FormsModule,
        MatTableModule,
        MatPaginatorModule,
        RouterTestingModule.withRoutes([
          { path: 'applications/LiveApp', 
            component: AppPageComponent },

        ]),
        HttpClientModule,
        MatDialogModule,
      ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [
        { provide: RestService,  useValue: restServiceSpy },
        AuthService,
        ClusterRestService,
        DatePipe,
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    //localStorage.setItem(LOCAL_STORAGE_SCOPE_KEY, "LiveApp");
    fixture = TestBed.createComponent(AppPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it(`check share endpoint is defined`, async(() => 
  {
   
     expect(component).toBeDefined();
     expect(component.shareEndpoint).toBeUndefined();
     component.newIPCamera();
     expect(component.shareEndpoint).toBeDefined();

  }));
  
  
});
