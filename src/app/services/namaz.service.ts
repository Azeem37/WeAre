import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class NamazService {
  constructor(private http: HttpClient) {}

  getNamaList() {
    let date = new Date();
    var toDate =
      ('0' + date.getDate()).slice(-2) +
      '-' +
      ('0' + (date.getMonth() + 1)).slice(-2) +
      '-' +
      date.getFullYear();

    // toDate = '08-04-2024';
    // http://api.aladhan.com/v1/timings/17-07-2007?latitude=51.508515&longitude=-0.1254872&method=2
    // http://api.aladhan.com/v1/timings/02-10-2023/latitude=20.9805&longitude=70.3063&method=2
    // http://api.aladhan.com/v1/qibla/:20.98307/:70.308155
    return this.http.get(
      `${environment.PRAYER_TIMING}${toDate}?latitude=20.98307&longitude=70.308155&method=2`
    );
  }

  formateCurrent(_date: any) {
    return new Date(_date).toLocaleString('en-us', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}
