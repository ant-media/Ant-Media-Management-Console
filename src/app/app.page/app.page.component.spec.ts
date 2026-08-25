import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { AppPageComponent } from './app.page.component';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthInterceptor, LiveBroadcast, RestService,} from '../rest/rest.service';
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



  const restServiceSpy = jasmine.createSpyObj('RestService',
    ['isEnterpriseEdition', 'getApplications', 'getNDIStreams', 'createLiveStream']);
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
  restServiceSpy.getNDIStreams.and.returnValue(new Observable(observer => {
    observer.next(['Camera A', 'Camera B']);
    observer.complete();
  }));
  restServiceSpy.createLiveStream.and.returnValue(new Observable(observer => {
    observer.next({success: true});
    observer.complete();
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

  it('loads discovered NDI sources when opening the NDI form', () => {
    component.isEnterpriseEdition = true;

    component.newNDIStream();

    expect(restServiceSpy.getNDIStreams).toHaveBeenCalledWith(component.appName);
    expect(component.ndiSourceNames).toEqual(['Camera A', 'Camera B']);
    expect(component.newNDIStreamActive).toBeTrue();
    expect(component.ndiSourcesLoading).toBeFalse();
  });

  it('creates an NDI broadcast using the source name as its name', () => {
    component.isEnterpriseEdition = true;
    component.liveBroadcast = new LiveBroadcast();
    component.liveBroadcast.streamUrl = 'Camera A';
    spyOn(component, 'getAppLiveStreams');
    spyOn(component, 'getAppLiveStreamsNumber');

    component.addNDIStream(true);

    const submittedBroadcast = restServiceSpy.createLiveStream.calls.mostRecent().args[1] as LiveBroadcast;
    expect(submittedBroadcast.type).toBe('NDI');
    expect(submittedBroadcast.name).toBe('Camera A');
    expect(component.newNDIStreamActive).toBeFalse();
  });
  
  
});
