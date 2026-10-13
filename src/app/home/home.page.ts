import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { FireStoreService } from '../services/fire-store.service';
import { ModalController } from '@ionic/angular';
import { UpdateComponent } from '../components/update/update.component';
import { UtilService } from '../services/util.service';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  FormArray,
} from '@angular/forms';
import Chart from 'chart.js/auto';
import { ActivatedRoute, Router } from '@angular/router';
import { CalendarPage } from '../calendar/calendar.page';
import Parent from '../model/model';
import { ChangeDetectorRef } from '@angular/core';

declare var cordova: any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  publicList: any = [];
  typeForAction: boolean = true;
  actionTyVal: any = 'data';
  gettingFees: any = {};
  adminInfo: any = {};
  toggleValue: boolean = false;
  entryForm!: FormGroup;
  @ViewChild('lineCanvas') private lineCanvas!: ElementRef;
  lineChart: any;
  accademicForm!: FormGroup;
  combine: any = {};
  studentsList: any = [];
  examsList: Array<any> = [];
  studentDetails: any = {};
  attendance: boolean = false;

  constructor(
    public formBuilder: FormBuilder,
    private utilService: UtilService,
    private modalCtrl: ModalController,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    public fireService: FireStoreService,
    public route: Router,
    public activeSnap: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.entryForm = this.formBuilder.group({
      surname: ['', [Validators.required, Validators.minLength(2)]],
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      adhar: ['', [Validators.required, Validators.minLength(2)]],
      at: ['', [Validators.required, Validators.minLength(2)]],
      // child: [''],
    });

    this.accademicForm = this.formBuilder.group({
      type: ['', [Validators.required, Validators.minLength(2)]],
      class: ['', [Validators.required, Validators.minLength(2)]],
      subjects: this.formBuilder.array([]),
      note: '',
    });
  }

  ngOnInit() {}

  ionViewWillEnter() {
    let user: any = localStorage.getItem('user');
    // let data = this.activeSnap.snapshot.data['user'];
    console.log('@user. ', user);
    this.actionTyVal = 'entry';
    // this.publicList = this.activeSnap.snapshot.data['user'];
    this.getAllUser();
    // setTimeout(() => this.utilService.clearUtilServices(), 5000);
  }

  ionViewWillLeave() {
    let d: any = this.actionSheetController.getTop();
    d ? this.actionSheetController.dismiss() : false;

    let c: any = this.alertController.getTop();
    c ? this.alertController.dismiss() : false;
    this.actionTyVal = 'data';
  }

  checking() {
    let temp: Parent = Object.assign({}, this.entryForm.value);
    console.log(temp);

    let chk = Object.keys(temp);
    if (chk.length == 0 || chk.length < 1) return;

    // let c: any = [];
    // if (temp.child == '') delete temp.child;

    // if (temp.child && temp.child.length > 0) {
    //   if (temp.child.match(',')) {
    //     c = temp.child.split(',');
    //   } else {
    //     c = temp.child.split(' ');
    //   }
    //   temp.child = c;
    // }

    temp.adhar = temp.adhar.toString();
    if (temp.adhar.length > 4) {
      temp.register_no =
        this.publicList.length > 0 ? this.publicList.length + 1 : 1;
      temp.student_ids = [];
      console.log('Form. ', temp);
      this.entryForm.reset();
      this.fireService.addRecord(temp).then(() => this.getAllUser());
      this.actionTyVal = 'data';
    } else this.utilService.presentToast('bottom', 'Wrong');
  }

  // async checkUser() {
  //   // if (this.publicList.length > 0) this.lineChart.destroy();
  //   const actionSheet = await this.actionSheetController.create({
  //     header: 'Choose user',
  //     backdropDismiss: false,
  //     buttons: [
  //       {
  //         text: 'Admin',
  //         role: 'selected',
  //         htmlAttributes: {
  //           'aria-label': 'close',
  //         },
  //         handler: () => {
  //           this.actionTyVal = 'data';
  //           this.adminUser = true;
  //           this.loginValidation();
  //         },
  //       },
  //       {
  //         text: 'Public',
  //         role: 'selected',
  //         handler: () => {
  //           this.actionTyVal = 'public';
  //           this.adminUser = false;
  //           this.loginValidation();
  //         },
  //       },
  //     ],
  //   });

  //   actionSheet.present();
  // }

  // selectUser(ev: any) {
  //   if (!ev.detail.value) {
  //     return;
  //   }

  //   this.fireService.getSingleStudent(ev.detail.value).subscribe((result) => {
  //     this.studentDetails = result.map((e: any) => {
  //       console.log(e);
  //       return {
  //         id: e.payload.doc.id,
  //         name: e.payload.doc.data()['name'],
  //         adhar: e.payload.doc.data()['adhar'],
  //         father: e.payload.doc.data()['father'],
  //         exam: e.payload.doc.data()['exam'],
  //       };
  //     });

  //     // this.generateChart(this.studentDetails[0]);

  //     console.log('@', ev.detail.value);
  //   });
  // }

  // async loginValidation() {
  //   const userChk = await this.alertController.create({
  //     message: `Please enter ${this.adminUser ? 'Admin' : 'User'} name.`,
  //     inputs: [
  //       {
  //         name: 'user',
  //         placeholder: `Enter ${
  //           this.adminUser ? 'Admin password' : 'User name'
  //         }`,
  //         type: this.adminUser ? 'password' : 'number',
  //       },
  //     ],
  //     buttons: [
  //       {
  //         text: 'Cancel',
  //         role: 'cancel',
  //         handler: (data) => {
  //           console.log('Cancel clicked.');
  //           this.publicList = [];
  //           this.checkUser();
  //         },
  //       },
  //       {
  //         text: 'Okay',
  //         handler: (data) => {
  //           if (data.user == 'ismail' && this.adminUser) {
  //             this.getAllUser();
  //             this.adminInfo.balance = 'this.grandTotal()';
  //             this.alertController.dismiss();
  //             return false;
  //           } else if (!this.adminUser && this.actionTyVal === 'public') {
  //             console.log(data.user);

  //             // this.lineChartMethod();
  //             this.fireService
  //               .getSingleCollection(data.user)
  //               .subscribe((result) => {
  //                 this.publicList = result.map((e: any) => {
  //                   return {
  //                     id: e.payload.doc.id,
  //                     name: e.payload.doc.data()['name'],
  //                     at: e.payload.doc.data()['at'],
  //                     adhar: e.payload.doc.data()['adhar'],
  //                     child: e.payload.doc.data()['child'],
  //                     collection: e.payload.doc.data()['collection'],
  //                     RegisterNo: e.payload.doc.data()['RegisterNo'],
  //                   };
  //                 });
  //               });
  //             this.alertController.dismiss();
  //             setTimeout(() => {
  //               console.log(this.publicList);

  //               if (this.publicList.length <= 0) this.checkUser();
  //             }, 500);
  //             return;
  //           } else {
  //             this.utilService.presentToast('top', 'Something wrong!!');
  //             this.checkUser();
  //           }
  //           return;
  //         },
  //       },
  //     ],
  //   });

  //   userChk.present();
  // }

  toggleChanged() {
    console.log('Toggle changed:', this.toggleValue);

    // this.actionTyVal =  this.toggleValue;
    this.typeForAction = !this.typeForAction;
  }

  async selectSegment(ev: any) {
    if (!ev) return;

    // this.utilService.showLoading('Change segment', 3000);

    this.actionTyVal = await ev?.detail?.value;

    if (this.actionTyVal === 'students') {
      console.log('selectSegment', this.actionTyVal);
      if (this.studentsList.length <= 0) {
        this.getStudentList();
      }
    }
  }

  async getStudentList() {
    await this.fireService.getStudents().then(async (val) => {
      console.log('getStudents. ', val);
      if (val) this.studentsList = await val;
      if (this.studentsList.length > 1) {
        this.getExamList();
      }

      // setTimeout(
      //   () => this.studentsList.map((item: any) => this.syncOpr(item)),
      //   1000
      // );
    });
  }

  async updateModal(record: any) {
    const modal = await this.modalCtrl.create({
      component: UpdateComponent,
      componentProps: { record: record },
      initialBreakpoint: 0.5,
      breakpoints: [0, 0.2, 1],
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      this.getStudentList();
      this.actionTyVal = 'students';
    }
  }

  async getAllUser() {
    this.fireService.getRecords().then(async (val) => {
      if (val) this.publicList = await val;
      if (this.publicList.length > 0) {
        this.actionTyVal = 'data';
        this.getStudentList();
      }
    });
    // this.fireService.getRecords().subscribe(async (res) => {
    //   console.log('record. ', res);
    //   this.publicList = await res;

    //   // this.publicList = await res.map((e: any) => {
    //   //   console.log('record. ', e);
    //   //   return {
    //   //     id: e.payload.doc.id,
    //   //     name: e.payload.doc.data()['name'],
    //   //     at: e.payload.doc.data()['at'],
    //   //     adhar: e.payload.doc.data()['adhar'],
    //   //     child: e.payload.doc.data()['child'],
    //   //     collection: e.payload.doc.data()['collection'],
    //   //     RegisterNo: e.payload.doc.data()['RegisterNo'],
    //   //   };
    //   // });
    // });

    // this.getExamList();
  }

  lineChartMethod() {
    this.lineChart = new Chart(this.lineCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Urdu', 'Farsi', 'English'],
        datasets: [
          {
            label: 'Sell per week',
            // fill: false,
            backgroundColor: '#ffc409',
            borderColor: '#ffc409',
            data: [100, 100, 100],
            // spanGaps: true,
          },

          {
            label: 'Passing Line',
            // fill: false,
            backgroundColor: '#009000',
            borderColor: '#009000',
            // borderDashOffset: 0.0,
            data: [50, 50, 50],
            // spanGaps: true,
            // pointBorderWidth: 0,
            // pointHoverRadius: 0,
            // pointRadius: 1,
            // pointHitRadius: 10,
          },
        ],
      },
    });
    this.lineChart.update();
  }

  get subjects(): FormArray {
    return this.accademicForm.get('subjects') as FormArray;
  }

  newSubject(): FormGroup {
    return this.formBuilder.group({
      subject: this.combine.subject,
      mark: this.combine.mark,
      // obt_mark: '000',
      date: this.combine.date,
    });
  }

  addSubject(): false | undefined {
    console.log(this.combine);
    // if (parseInt(this.combine.mark) > 100) {
    //   this.utilService.presentToast('top', 'Marks under 100');
    //   return;
    // }
    if (!this.combine.subject || !this.combine.mark || !this.combine.date) {
      this.utilService.presentToast(
        'top',
        'Please add subject details...!',
        'danger'
      );
      return false;
    }

    this.subjects.push(this.newSubject());
    return false;
  }

  removeSubject(i: number) {
    this.subjects.removeAt(i);
  }

  async submitSchedule() {
    const alert = await this.alertController.create({
      header: 'Confirmation',
      cssClass: 'schedule-alert',
      subHeader: 'WeAre charitable trust',
      message: 'Are sure to schedule this exam',
      buttons: [
        {
          text: 'Nop!',
          role: 'cancel',
          handler: (data) => {},
        },
        {
          text: 'Skip PDF',
          handler: (data) => {
            data = Object.assign({}, this.accademicForm.value);
            data.student_ids = [];
            data.created = new Date().toISOString();
            console.log('Exam', data);

            this.fireService
              .scheduleExam(data)
              .then(() => this.getStudentList());
            this.accademicForm.reset();
          },
        },

        {
          text: 'With PDF',
          handler: (data) => {
            console.log(this.accademicForm.value);
            // this.schedulePDF(this.accademicForm.value);
            this.fireService
              .scheduleExam(this.accademicForm.value)
              .then(() => this.getStudentList());
            this.utilService.presentToast('top', 'Successfull...', 'primary');

            this.schedulePDF(this.accademicForm.value).then((res: any) => {
              this.fireService.downloadPDF(res, this.createFileName());

              // cordova.plugins.pdf.htmlToPDF({
              //   data: res,
              //   documentSize: 'A4',
              //   landscape: 'portrait',
              //   type: 'share',
              //   fileName: this.createFileName(),
              // });
            });

            this.accademicForm.reset();
            // this.actionTyVal = 'students';
            this.accademicForm.value.subjects = [];
            this.subjects.clear();
          },
        },
      ],
    });

    if (this.accademicForm.value.subjects.length < 0) {
      this.utilService.presentToast('top', 'Please add subject.');
      return;
    }
    if (
      this.accademicForm.value.type &&
      this.accademicForm.value.class &&
      this.accademicForm.value.subjects.length > 0
    ) {
      alert.present();
    } else {
      this.utilService.presentToast('top', 'Please add valid data');
    }
  }

  syncAvailExam(rec: any) {
    let chk: boolean = false;
    if (rec.exams) {
      if (this.examsList.length === rec?.exams?.length) return true;
    }
    return false;
  }

  async syncOpr(rec: any) {
    // let temp = JSON.parse(JSON.stringify(this.examsList));
    let remainExam: any = [];
    console.log('000000000');

    console.log(rec.exams, '\n Exam list \n', this.examsList);
    // console.log(this.examsList.length, rec.exam.length);

    if (this.examsList?.length === rec?.exam?.length) return;

    if (rec?.exams && rec.exams?.length > 0) {
      remainExam = this.examsList.filter(
        (exam) => !rec.exams.some((recExam: any) => recExam.id === exam.id)
      );

      // for (let i = 0; i < rec.exams?.length; i++) {
      //   remainExam = this.examsList.filter(
      //     (item, index) => item.id !== rec.exams[i].id
      //   );
      // }

      // remainExam = [...rec?.exams, ...this.examsList].filter(
      //   (value, index, self) => self.indexOf(value.id) !== index
      // );

      // for (let i = 0; i < rec.exam?.length; i++) {
      //   remainExam = this.examsList.filter(
      //     (item, index) => rec.exam[i]?.indexOf(item) == index
      //   );
      // }
    } else {
      remainExam = this.examsList;
    }

    await rec.exams.push(remainExam[remainExam.length - 1]);

    remainExam.length > 0 ? this.obtMarkAlert(rec, remainExam) : '';
  }

  getExamList() {
    this.fireService.getExams().then((res) => {
      if (res) this.examsList = res;
    });
  }

  async obtMarkAlert(rec: any, leftExam: any) {
    let obtMark: any = [];
    let updateIndex = 0;
    // let updateIndex = leftExam.length - 1;

    for (let i = 0; i < leftExam[updateIndex]?.subjects?.length; i++) {
      await obtMark.push({
        name: `${leftExam[updateIndex]?.subjects[i].subject}`,
        placeholder: `Obtain mark in ${leftExam[updateIndex]?.subjects[i].subject} out of ${leftExam[updateIndex]?.subjects[i].mark}`,
        type: 'number',
      });
    }

    console.log('subject. ', obtMark);
    const alert = await this.alertController.create({
      message: `Add mark ${leftExam[updateIndex]?.type}`,
      inputs: obtMark,
      cssClass: ['custome-alert'],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: (data) => {
            console.log('Cancel clicked.');
            this.getStudentList();
          },
        },
        {
          text: 'Okay',
          handler: async (data) => {
            console.log('@data, ', data);
            console.log('@leftExam, ', leftExam);
            console.log('@rec, ', rec);

            let tempArray = leftExam[updateIndex].subjects.filter(
              (item: any, index: any) => {
                return (item.obt_mark = data[item.subject]);
              }
            );

            console.log('@tempArray, ', tempArray);
            // rec?.exams[indexOfEx].forEach((item: any, index: any) => {
            //   item.obt_mark = data[item.subject];
            // });

            // leftExam[updateIndex].subjects.forEach((item: any, index: any) => {
            //   item.obt_mark = data[item.subject];
            // });
            // leftExam[updateIndex].student_ids.push(rec.id);
            rec.exams.push({
              type: leftExam[updateIndex].type,
              id: leftExam[updateIndex].id,
              subjects: tempArray,
            });

            // console.log('Updated exam, ', leftExam[updateIndex]);
            console.log('\n \n record', rec);

            this.fireService.upDateStudentExam(
              rec.id,
              rec,
              leftExam[updateIndex]
            );
          },
        },
      ],
    });

    alert.present();
  }

  generateChart(data: any) {
    let temp: any = { dataset: [] };

    for (let i = 0; i < data.exam.length; i++) {
      temp.labels = this.generatesLBL(data.exam[i].subjects);
      temp.dataset.push({
        label: data.exam[i].type,
        data: this.generateMark(data.exam[i].subjects),
        backgroundColor: this.generateColor(),
        borderColor: '#ffc409',
      });
    }

    this.lineChart.data.labels = temp.labels;
    this.lineChart.data.datasets = temp.dataset;
    this.lineChart.update();
    console.log('-', this.lineChart);
  }

  generateColor = () => {
    let n = (Math.random() * 0xffc409 * 1000000).toString(16);
    return '#' + n.slice(0, 6);
  };

  generateMark = (data: any) => {
    let tmp: any = [];
    data.forEach((item: any) => {
      tmp.push(parseFloat(item.obt_mark));
    });
    return tmp;
  };

  generatesLBL = (data: any) => {
    let tmp: any = [];
    data.forEach((item: any) => {
      tmp.push(item.subject);
    });
    return tmp;
  };

  downloaded(fee: any) {
    console.log(fee.invoiceNo);
    this.utilService.showLoading('Downloading fees', 3000);
    this.fireService.getInvoice(fee.invoiceNo).subscribe((res) => {
      let inV: any = res.map((e: any) => {
        return {
          id: e.payload.doc.id,
          created: e.payload.doc.data()['created'],
          invoiceNo: e.payload.doc.data()['invoiceNo'],
          name: e.payload.doc.data()['name'],
          template: e.payload.doc.data()['template'],
        };
      });

      setTimeout(() => {
        // this.fireService.downloadPDF(inV[0].template, inV[0].name);
        console.log(inV[0].template);
      }, 2000);
    });
  }

  getBalance(data: any) {
    let sum = 0;
    if (!data) return sum;

    for (let num of data) {
      sum += parseFloat(num.Fees);
    }
    return sum;
  }

  async schedulePDF(data: any) {
    let tbl: any = [];
    for (let i = 0; i < data.subjects.length; i++) {
      tbl.push(`
      <tr>
          <td>${data.subjects[i].subject}</td>
          <td>${data.subjects[i].mark}</td>
          <td>${data.subjects[i].date}</td>
      </tr>
      `);
    }
    console.log(tbl, '@ \n', data);

    let template = `
    <html>
      <head>
      <title>${data.type}</title>
      </head>
      <style>
      table{
        width:100%;
        }
      th, tr, td {
        color: #009000;
        text-align:center;
      }
      .dg-back {
        background: #eee;
      }
      .lt-content{
        float:left;
        width:100%;
        border-bottom: 1px solid #000;
        }

        .user-content{
          margin-top: 10px;
          }
          .lt-bottom{
            float:left;
           width:100%;
            }
            .rt-bottom{
            text-align: end;
            }
      </style>
      <body>
      <div class="lt-content">
      <img style="float:right; margin-right: 10px;" width="100" src="https://gitlab.com/azeem.workspace/weare/-/raw/main/card-logo.png" alt="Italian Trulli">
      <p style="margin-left: 10px;"><b> Maqtab hala muslim </b><br/> Sidokar 362255,<br/>Ta. Veraval <br/>Dist. Gir-somnath<br/>Time.:
      </p>
      </div>

      <div class="user-content">
      <hr>
      <h4 style="width:100%;text-align: center;">${data.type} Exam</h4>
      
      </div>
      
      <table>
      <tr>
      <th>Subject</th>
      <th>Mark</th>
      <th>Date</th>
    </tr>
          ${tbl}
      <table>

      <div class="rt-bottom">
      <p><b>Exam conduct by</b><br/>Admin user<p/>
      </div>

      <footer>
      <p style="width:100%;text-align: center;">&#169; created by Aaiz</p>
      </footer>
      </body>
    </html>
    `;

    template = await this.minifyJavaScript(template);
    // console.log(this.minifyJavaScript(template));
    console.log(template);

    return template;
  }

  minifyJavaScript(html: any) {
    html = html.replace(/>\s+</g, '><');

    // Remove white spaces and newlines within HTML tags
    html = html.replace(/\s+/g, ' ');

    return html;
  }

  createFileName(name: string = 'Exam_') {
    return name + new Date().toISOString().slice(5);
  }

  async getPublicUser(name: string) {
    // this.utilService.showLoading();
    // await this.fireService.publicList.subscribe(async (result) => {
    //   if (result.length > 0) this.publicList = result;
    //   console.log('PublicList ', this.publicList);
    //   await this.getStudentList();
    // });
    // return;
    // this.fireService
    //   .getSingleCollection(name)
    //   .subscribe(async (result: any) => {
    //     console.log('---result---', result);
    //     if (result.length > 0) {
    //       this.publicList = await result;
    //       this.getStudentList();
    //     } else {
    //       // this.goToBack();
    //     }
    //   });
  }

  goToBack() {
    this.route.navigate(['/dashboard']);
  }

  async getLisFeesList() {
    let btn: Array<any> = [
      {
        text: 'Cancel',
        role: 'cancel',
      },
    ];

    for (let num of this.publicList[0]?.collection) {
      btn.push({
        text: `${num?.Fees}/- ${num?.type}`,
        // icon: 'arrow-down-circle-outline',
        htmlAttributes: {
          'aria-label': 'close',
        },
        handler: () => {
          this.downloaded(num);
        },
      });
    }
    // if (this.publicList.length > 0) this.lineChart.destroy();
    const actionSheet = await this.actionSheetController.create({
      header: 'Download reciept',
      backdropDismiss: true,
      buttons: btn,
      mode: 'ios',
      // [
      //   {
      //     text: 'Admin',
      //     role: 'selected',
      //     htmlAttributes: {
      //       'aria-label': 'close',
      //     },
      //     handler: () => {

      //     },
      //   },
      //   {
      //     text: 'Public',
      //     role: 'selected',
      //     handler: () => {

      //     },
      //   },
      // ],
    });

    actionSheet.present();
  }

  async addEvent() {
    const modal = await this.modalCtrl.create({
      component: CalendarPage,
      backdropDismiss: false,
      keyboardClose: true,
    });
    modal.present();

    modal.dismiss().then((val) => {
      let user: any = localStorage.getItem('user');
      this.actionTyVal = 'data';
    });
  }
}
