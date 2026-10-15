import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class InterceptorService implements HttpInterceptor {
  constructor() {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = 'my-token-string-from-server';

    //Authentication by setting header with token value
    // if (token) {
    //   request = request.clone({
    //     setHeaders: {
    //       'Authorization': token
    //     }
    //   });
    // }

    // if (!request.headers.has('Content-Type')) {
    //   request = request.clone({
    //     setHeaders: {
    //       'content-type': 'application/json'
    //     }
    //   });
    // }

    // request = request.clone({
    //   headers: request.headers.set('Accept', 'application/json')
    // });

    request.clone();

    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => {
        // if (event instanceof HttpResponse) {
        // }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        console.log('event--->>>', event);
        return throwError(error);
      })
    );
  }
}
