import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { FireStoreService } from '../services/fire-store.service';
import { NamazService } from '../services/namaz.service';

@Injectable({
  providedIn: 'root',
})
export class DummyResolverService implements Resolve<any> {
  constructor(
    public fireService: FireStoreService,
    public namazTime: NamazService
  ) {}

  resolve(route: ActivatedRouteSnapshot) {
    if (route.routeConfig?.path === 'dashboard') {
      return this.namazTime.getNamaList();
    }

    return false;
  }
}

// async resolve(route: ActivatedRouteSnapshot) {
//   let user: any = localStorage.getItem('user');
//   console.log('-=-=-=', route.routeConfig?.path);
//   let response: any;
//   if (route.routeConfig?.path === 'dashboard') {
//     response = await this.namazTime.getNamaList();
//     // return await response;
//   }
//   return response;
//   // if (user === 'admin') {
//   //   this.fireService.getRecords().subscribe((data) => {
//   //     response = data;
//   //   });
//   //   return response;
//   // } else {
//   //   response = await this.fireService.getSingleCollection(user);
//   //   response = response.length > 0 ? response : false;
//   //   return response;
//   // }
//   // return false;
//   console.log('-=-=222-=', response);
