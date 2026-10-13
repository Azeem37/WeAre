import { Component, OnInit } from '@angular/core';
import { environment } from './../../environments/environment';
import { FireStoreService } from '../services/fire-store.service';
import { Router } from '@angular/router';
import {
  AdMob,
  BannerAdOptions,
  BannerAdPosition,
  BannerAdSize,
} from '@capacitor-community/admob';
import { isPlatform } from '@ionic/angular';

@Component({
  selector: 'app-public',
  templateUrl: './public.page.html',
  styleUrls: ['./public.page.scss'],
})
export class PublicPage implements OnInit {
  studentsList: Array<any> = [];
  constructor(public route: Router, public fireService: FireStoreService) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.getStudentList();
  }

  async getStudentList() {
    await this.fireService.getStudents().then(async (val) => {
      console.log('@PublicPage getStudents. ', val);
      if (val) this.studentsList = await val;
    });

    // this.fireService.getStudents().subscribe(async (res) => {
    //   console.log(res);
    //   this.studentsList = await res;
    //   // this.studentsList = await res.map((e: any) => {
    //   //   return {
    //   //     id: e.payload.doc.id,
    //   //     name: e.payload.doc.data()['name'],
    //   //     adhar: e.payload.doc.data()['adhar'],
    //   //     father: e.payload.doc.data()['father'],
    //   //     exam: e.payload.doc.data()['exam'],
    //   //   };
    //   // });
    // });
  }
}
