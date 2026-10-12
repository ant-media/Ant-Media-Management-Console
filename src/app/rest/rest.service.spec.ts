import { TestBed } from '@angular/core/testing';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthInterceptor, LiveBroadcast, RestService, signAppJwt } from './rest.service';

declare function require(name: string);
const jwt = require('jsonwebtoken');

describe('RestService NDI operations', () => {
  let http: jasmine.SpyObj<HttpClient>;
  let service: RestService;

  beforeEach(() => {
    http = jasmine.createSpyObj<HttpClient>('HttpClient', ['get', 'head', 'post']);
    http.head.and.returnValue(value({}));
    http.get.and.returnValue(value([]));
    http.post.and.returnValue(value({success: true}));
    service = new RestService(http, jasmine.createSpyObj<Router>('Router', ['navigate']));
  });

  it('requests discovered NDI sources from the application endpoint', () => {
    service.getNDIStreams('live').subscribe();

    expect(http.get).toHaveBeenCalledWith(jasmine.stringMatching(
      /\/rest\/v2\/request\?_path=live\/rest\/v2\/broadcasts\/ndi-streams$/));
  });

  it('enables autoStart when creating an NDI broadcast', () => {
    const broadcast = new LiveBroadcast();
    broadcast.type = 'NDI';

    service.createLiveStream('live', broadcast, null, '').subscribe();

    expect(http.post).toHaveBeenCalledWith(jasmine.stringMatching(
      /\/rest\/v2\/request\?_path=live\/rest\/v2\/broadcasts\/create&autoStart=true&socialNetworks=$/), broadcast);
  });

  function value<T>(result: T): Observable<T> {
    return new Observable(observer => {
      observer.next(result);
      observer.complete();
    });
  }
});

describe('AuthInterceptor server clock offset', () => {
  const BROWSER_NOW = Date.UTC(2026, 9, 12, 12, 0, 0);
  const SECRET = 'x'.repeat(32);
  let http: HttpClient;
  let backend: HttpTestingController;

  // Answers one request with the given Date header (or none)
  const respond = (date?: string) => {
    http.get('/rest/v2/version').subscribe();
    backend.expectOne('/rest/v2/version').flush({}, { headers: date ? { Date: date } : {} });
  };
  const iatOf = (token: string) => jwt.decode(token).iat;

  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(BROWSER_NOW));
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }]
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    respond(new Date(BROWSER_NOW).toUTCString()); // offset is module state, reset it to 0
  });

  afterEach(() => {
    backend.verify();
    jasmine.clock().uninstall();
  });

  it('signs iat with server time when browser clock is ahead', () => {
    respond(new Date(BROWSER_NOW - 60000).toUTCString());
    expect(iatOf(signAppJwt(SECRET))).toBe((BROWSER_NOW - 60000) / 1000);
  });

  it('signs iat with server time when browser clock is behind', () => {
    respond(new Date(BROWSER_NOW + 60000).toUTCString());
    expect(iatOf(signAppJwt(SECRET))).toBe((BROWSER_NOW + 60000) / 1000);
  });

  it('keeps the last offset when Date header is missing', () => {
    respond(new Date(BROWSER_NOW - 60000).toUTCString());
    respond();
    expect(iatOf(signAppJwt(SECRET))).toBe((BROWSER_NOW - 60000) / 1000);
  });

  it('token still verifies with the app secret', () => {
    expect(() => jwt.verify(signAppJwt(SECRET), SECRET)).not.toThrow();
  });
});
