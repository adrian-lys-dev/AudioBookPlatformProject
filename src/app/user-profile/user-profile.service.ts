import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../shared/models/user';
import { AccountService } from '../account/account.service';
import { switchMap } from 'rxjs';
import { userLibraryParams } from '../shared/models/paramsModels/userLibraryParams';
import { AudioBook } from '../shared/models/libraryModels/audiobook';
import { Pagination } from '../shared/models/pagination';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router, private accountService: AccountService) { }

  private getLang(): string {
    return localStorage.getItem('lang') || 'en-US';
  }

  private createHeaders(): HttpHeaders {
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Accept-Language', this.getLang());
  }

  editUser(user: User){
    const headers = this.createHeaders();
    return this.http.put<User>(this.baseUrl + 'UserProfile/' + user.id, user, { headers: headers, withCredentials: true })
    .pipe(
      switchMap(() => this.accountService.loadCurrentUser())
    );
  }

  getUser(id: string){
    const headers = this.createHeaders();
    return this.http.get<User>(this.baseUrl + 'UserProfile/' + id, { headers: headers, withCredentials: true });
  }

  getUserLibrary(userLibraryParams: userLibraryParams){
    const headers = this.createHeaders();
    let params = new HttpParams();
    params = params.append('UserId', userLibraryParams.userId);
    params = params.append('StatusId', userLibraryParams.statusId);
    params = params.append('PageIndex', userLibraryParams.pageNumber);
    params = params.append('PageSize', userLibraryParams.pageSize);

    return this.http.get<Pagination<AudioBook[]>>(this.baseUrl + 'UserLibrary?' + params,
    { headers: headers, withCredentials: true });
  }
}
