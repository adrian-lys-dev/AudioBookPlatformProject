import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router, NavigationExtras } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from 'src/app/account/account.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private accountService: AccountService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    console.log('works');
    
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error) {
          if (error.status === 400) {
            if (error.error?.errors) {
              return throwError(() => error.error);
            } else {
              this.toastr.error(error.error?.message || 'Bad Request', error.status.toString());
            }
          }
          if (error.status === 401) {
            console.log('401 part 1');
            
            return this.accountService.refreshToken().pipe(
              switchMap(() => {
                return next.handle(request);
              }),
              catchError(() => {
                return this.accountService.revokeToken().pipe(
                  switchMap(() => {
                    this.router.navigateByUrl('/account/login');
                    this.toastr.error("Try to re-login", "401");
                    return throwError(() => error);
                  })
                );
              })
            );
          }
          if (error.status === 403) {
            this.toastr.error(error.error?.message || 'Forbidden', error.status.toString());
            this.router.navigateByUrl('/forbidden');
          }
          if (error.status === 404) {
            this.router.navigateByUrl('/not-found');
          }
          if (error.status === 500) {
            const navigationExtras: NavigationExtras = { state: { error: error.error } };
            this.router.navigateByUrl('/server-error', navigationExtras);
          }
        }
        return throwError(() => error);
      })
    );
  }
}
