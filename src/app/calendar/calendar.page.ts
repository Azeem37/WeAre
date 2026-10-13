import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { Calendar } from '@ionic-native/calendar/ngx';
import { FireStoreService } from '../services/fire-store.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
})
export class CalendarPage implements OnInit {
  event: any = {
    title: '',
    location: '',
    message: '',
    startDate: '',
    endDate: '',
  };

  date: any;
  daysInThisMonth: any;
  daysInLastMonth: any;
  daysInNextMonth: any;
  monthNames: Array<any> = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  currentMonth: any;
  currentYear: any;
  currentDate: any;
  eventList: any;
  selectedEvent: any;
  isSelected: any;

  constructor(
    private modalCtrl: ModalController,
    public alertCtrl: AlertController,
    private calendar: Calendar,
    public fireService: FireStoreService
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.date = new Date();
    this.getDaysOfMonth();
  }

  save() {
    this.calendar
      .createEvent(
        this.event.title,
        this.event.location,
        this.event.message,
        new Date(this.event.startDate),
        new Date(this.event.endDate)
      )
      .then(
        async (msg: any) => {
          let alert = await this.alertCtrl.create({
            header: 'Success!',
            buttons: [
              {
                text: 'OK',
                handler: (value: any) => {
                  this.fireService.addMarriageDateRecord(this.event);

                  this.calendar.getCreateCalendarOptions();
                },
              },
            ],
          });
          alert.present();
        },
        async (err: any) => {
          let alert = await this.alertCtrl.create({
            header: 'Failed!',
            message: err,
            buttons: ['OK'],
          });
          alert.present();
        }
      );

    // this.loadEventThisMonth();
  }

  onDateChanged(
    dateValue: string | string[] | null | undefined,
    field: string
  ) {
    // if (field === 'start') {
    //   this.event.startDate = dateValue;
    // } else {
    //   this.event.endDate = dateValue;
    // }
    this.event.startDate = dateValue;
    this.event.endDate = dateValue;
    console.log(this.event);
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  getDaysOfMonth() {
    this.daysInThisMonth = new Array();
    this.daysInLastMonth = new Array();
    this.daysInNextMonth = new Array();
    this.currentMonth = this.monthNames[this.date.getMonth()];
    this.currentYear = this.date.getFullYear();

    if (this.date.getMonth() === new Date().getMonth()) {
      this.currentDate = new Date().getDate();
    } else {
      this.currentDate = 999;
    }

    var firstDayThisMonth = new Date(
      this.date.getFullYear(),
      this.date.getMonth(),
      1
    ).getDay();

    var prevNumOfDays = new Date(
      this.date.getFullYear(),
      this.date.getMonth(),
      0
    ).getDate();

    for (
      var i = prevNumOfDays - (firstDayThisMonth - 1);
      i <= prevNumOfDays;
      i++
    ) {
      this.daysInLastMonth.push(i);
    }

    var thisNumOfDays = new Date(
      this.date.getFullYear(),
      this.date.getMonth() + 1,
      0
    ).getDate();

    for (var i = 0; i < thisNumOfDays; i++) {
      this.daysInThisMonth.push(i + 1);
    }

    var lastDayThisMonth = new Date(
      this.date.getFullYear(),
      this.date.getMonth() + 1,
      0
    ).getDay();

    var nextNumOfDays = new Date(
      this.date.getFullYear(),
      this.date.getMonth() + 2,
      0
    ).getDate();

    for (var i = 0; i < 6 - lastDayThisMonth; i++) {
      this.daysInNextMonth.push(i + 1);
    }
    var totalDays =
      this.daysInLastMonth.length +
      this.daysInThisMonth.length +
      this.daysInNextMonth.length;
    if (totalDays < 36) {
      for (var i = 7 - lastDayThisMonth; i < 7 - lastDayThisMonth + 7; i++) {
        this.daysInNextMonth.push(i);
      }
    }
    this.loadEventThisMonth();
  }

  goToLastMonth() {
    this.date = new Date(this.date.getFullYear(), this.date.getMonth(), 0);
    this.getDaysOfMonth();
  }

  goToNextMonth() {
    this.date = new Date(this.date.getFullYear(), this.date.getMonth() + 2, 0);
    this.getDaysOfMonth();
  }

  loadEventThisMonth() {
    this.eventList = new Array();
    var startDate = new Date(this.date.getFullYear(), this.date.getMonth(), 1);
    var endDate = new Date(
      this.date.getFullYear(),
      this.date.getMonth() + 1,
      0
    );
    this.calendar.listEventsInRange(startDate, endDate).then(
      (msg) => {
        msg.forEach((item: any) => {
          this.eventList.push(item);
        });
      },
      (err) => {
        console.log(err);
      }
    );
  }

  selectDate(day: any) {
    this.isSelected = false;
    this.selectedEvent = new Array();
    var thisDate1 =
      this.date.getFullYear() +
      '-' +
      (this.date.getMonth() + 1) +
      '-' +
      day +
      ' 00:00:00';
    var thisDate2 =
      this.date.getFullYear() +
      '-' +
      (this.date.getMonth() + 1) +
      '-' +
      day +
      ' 23:59:59';
    this.eventList.forEach((event: any) => {
      if (
        (event.startDate >= thisDate1 && event.startDate <= thisDate2) ||
        (event.endDate >= thisDate1 && event.endDate <= thisDate2)
      ) {
        this.isSelected = true;
        this.selectedEvent.push(event);
      }
    });
  }

  checkEvent(day: any) {
    var hasEvent = false;
    var thisDate1 =
      this.date.getFullYear() +
      '-' +
      (this.date.getMonth() + 1) +
      '-' +
      day +
      ' 00:00:00';
    var thisDate2 =
      this.date.getFullYear() +
      '-' +
      (this.date.getMonth() + 1) +
      '-' +
      day +
      ' 23:59:59';
    this.eventList.forEach((event: any) => {
      if (
        (event.startDate >= thisDate1 && event.startDate <= thisDate2) ||
        (event.endDate >= thisDate1 && event.endDate <= thisDate2)
      ) {
        hasEvent = true;
      }
    });
    return hasEvent;
  }

  async deleteEvent(evt: any) {
    // console.log(new Date(evt.startDate.replace(/\s/, 'T')));
    // console.log(new Date(evt.endDate.replace(/\s/, 'T')));
    let alert = await this.alertCtrl.create({
      header: 'Confirm Delete',
      message: 'Are you sure want to delete this event?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          },
        },
        {
          text: 'Ok',
          handler: () => {
            this.calendar
              .deleteEvent(
                evt.title,
                evt.location,
                evt.notes,
                new Date(evt.startDate.replace(/\s/, 'T')),
                new Date(evt.endDate.replace(/\s/, 'T'))
              )
              .then(
                (msg) => {
                  console.log(msg);
                  this.loadEventThisMonth();
                  this.selectDate(
                    new Date(evt.startDate.replace(/\s/, 'T')).getDate()
                  );
                },
                (err) => {
                  console.log(err);
                }
              );
          },
        },
      ],
    });
    alert.present();
  }
}
