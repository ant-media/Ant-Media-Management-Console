import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LiveBroadcast, RestService } from './rest.service';

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
