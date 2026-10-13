import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NamazService } from '../services/namaz.service';
import { AlertController, isPlatform } from '@ionic/angular';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { FireStoreService } from '../services/fire-store.service';
import { UtilService } from '../services/util.service';
import { Plugins } from '@capacitor/core';
import { IonicSlides } from '@ionic/angular';
import {
  AdMob,
  AdOptions,
  BannerAdOptions,
  BannerAdPosition,
  BannerAdSize,
} from '@capacitor-community/admob';
import { environment } from 'src/environments/environment';

const { LocalNotifications } = Plugins;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  details: any;
  detailsList: any;
  timeoutID: any;
  currentStamp = [];
  date: any;

  swiperModules = [IonicSlides];
  @ViewChild('swiper')
  swiperRef: ElementRef | undefined;
  marriegeList: Array<any> = [];

  constructor(
    private utilService: UtilService,
    public getNList: NamazService,
    public route: Router,
    public activeSnap: ActivatedRoute,
    private alertController: AlertController,
    public fireService: FireStoreService
  ) {
    this.initialize();
    this.getDateList();
  }

  ngOnInit() {}

  async ionViewWillEnter() {
    this.details = await this.activeSnap.snapshot.data['namaz'];
    this.detailsList = Object.entries(this.details?.data?.timings);
    this.delayTimer();

    setTimeout(() => this.utilService.clearUtilServices(), 5000);
  }

  delayTimer() {
    if (this.timeoutID) {
      clearInterval(this.timeoutID);
      this.timeoutID = null;
    }

    let date = new Date();
    this.date = date;
    // this.currentStamp = this.getTime();
    let toDate: any =
      ('0' + date.getHours()).slice(-2) +
      '-' +
      ('0' + (date.getSeconds() + 1)).slice(-2);

    toDate = toDate.substring(0, 2);
    let curr = this.detailsList[0][1].substring(0, 2);
    let diff = Math.abs(toDate - curr);

    for (let i = 0; i < this.detailsList.length; i++) {
      let dum = parseInt(this.detailsList[i][1].substring(0, 2));
      let newdiff = Math.abs(toDate - dum);
      let sAd;

      if (newdiff < diff) {
        diff = newdiff;
        this.currentStamp = this.detailsList[i];
        // this.adhanAlarm(this.detailsList[i][0]);
        // console.log('A');
      }
    }

    // console.log(toDate);
    // this.currentStamp = this.detailsList.reduce(
    //   async (prev: any, curr: any) => {
    //     curr = await curr[1].substring(0, 2);
    //     prev = await prev[1].substring(0, 2);
    //     console.log(prev);
    //     return Math.abs(curr - toDate) < Math.abs(prev - toDate) ? curr : prev;
    //   }
    // );

    // console.log(toDate);
    console.log('currentStamp. ');
    this.timeoutID = setInterval(() => {
      this.delayTimer();
    }, 15000);
  }

  getTime() {
    // const msSinceEpoch = new Date().getTime();
    // return msSinceEpoch;

    const localTimeString = new Date().toLocaleTimeString('en-us', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return localTimeString;
  }

  ionViewWillLeave() {
    console.log('ionViewWillLeave');
    clearInterval(this.timeoutID);
    this.timeoutID = null;
  }

  tConvert(time: any) {
    // Check correct time format and split into components
    if (!time) return '00:00';

    time = time
      .toString()
      .match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

    if (time.length > 1) {
      // If time format correct

      time = time.slice(1); // Remove full string match value
      time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
      time[0] = +time[0] % 12 || 12; // Adjust hours
      time[0] = '0' + time[0];
      time[0] = time[0].slice(-2);
    }
    return time.join(''); // return adjusted time or original string
  }

  async loginValidation(user: string) {
    const userChk = await this.alertController.create({
      message: `Please enter ${
        user == 'admin' ? 'Admin password' : 'User Aadhar'
      }.`,
      inputs: [
        {
          name: 'user',
          placeholder: `Enter ${
            user == 'admin' ? 'Admin password' : 'User name'
          }`,
          type: user == 'admin' ? 'password' : 'number',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: (data) => {
            console.log('Cancel clicked.');
            userChk.dismiss();
          },
        },
        {
          text: 'Okay',
          handler: async (data) => {
            if (!data.user) {
              this.utilService.presentToast(
                'top',
                'Something wrong...!',
                'danger'
              );
              return;
            }
            await localStorage.setItem('user', user);
            console.log('User', user);
            console.log('data', data);

            if (user === 'admin') {
              if (data.user === 'Ismail') {
                this.utilService.clearUtilServices();
                this.route.navigate(['home']);
              } else {
                this.utilService.presentToast(
                  'top',
                  'Something wrong...!',
                  'danger'
                );
              }

              userChk.dismiss();
              return;
            } else {
              userChk.dismiss();
            }
          },
        },
      ],
    });

    this.utilService.clearUtilServices();
    userChk.present();
  }

  adhanAlarm(title: string = 'Azan') {
    LocalNotifications['schedule']({
      notifications: [
        {
          title: title,
          body: 'Body',
          id: 1,
          schedule: { at: new Date(Date.now() + 1000 * 5) },
          sound: '../assets/audio/azan.wav',
          // attachments: null,
          // actionTypeId: "",
          // extra: null
        },
      ],
    });
  }

  async getDateList() {
    this.fireService.getMarriageDateRecord().then(async (result) => {
      if (result) this.marriegeList = await result;
    });
  }

  studentCorner() {
    this.route.navigate(['public']);
  }

  async initialize() {
    const { status } = await AdMob.trackingAuthorizationStatus();

    if (status === 'notDetermined') {
    }

    AdMob.initialize({
      // requestTrackingAuthorization: true,
      testingDevices: ['YOURTESTDEVICECODE'],
      initializeForTesting: true,
    });

    this.showBanner();
  }

  async showBanner() {
    const adId = isPlatform('ios') ? 'ios-ad-id' : 'android-ad-unit';

    const options: BannerAdOptions = {
      adId,
      isTesting: true,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      // npa: true
    };
    AdMob.showBanner(options);
  }
}
