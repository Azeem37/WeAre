import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { FireStoreService } from 'src/app/services/fire-store.service';
import { UtilService } from 'src/app/services/util.service';
import Chart from 'chart.js/auto';
import { NamazService } from 'src/app/services/namaz.service';
declare var cordova: any;

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss'],
})
export class UpdateComponent implements OnInit {
  @Input() record: any;
  @ViewChild('barCanvas') private barCanvas!: ElementRef;
  barChart: any;
  invoiceList: Array<any> = [];
  islamicDetails: any;

  constructor(
    private modalCtrl: ModalController,
    private utilService: UtilService,
    public alertController: AlertController,
    public fireService: FireStoreService,
    public getNList: NamazService
  ) {}

  ngOnInit() {
    console.log(this.record);
    // this.getWallet(this.record);
  }

  ngAfterViewInit() {
    this.record?.collection?.length > 0 ? this.barChartMethod() : '';

    this.fireService.getInvoices().subscribe((res) => {
      this.invoiceList = res.map((e: any) => {
        return {
          id: e.payload.doc.id,
          name: e.payload.doc.data()['name'],
          template: e.payload.doc.data()['template'],
        };
      });
    });

    this.getNList.getNamaList().subscribe((res: any) => {
      if (res.status == 'OK') {
        this.islamicDetails = res;
      }
    });
  }

  feesAlert(act: any) {
    let alrtInputs: any = [];
    if (act == 'fees') {
      alrtInputs.push(
        {
          type: 'number',
          name: 'Fees',
          placeholder: 'Rs 1000',
          cssClass: 'al-input',
        },
        {
          type: 'text',
          name: 'type',
          placeholder: 'Tution Fees | Anual Fees | Others',
          cssClass: 'al-input',
        }
      );
    } else {
      alrtInputs.push(
        {
          type: 'text',
          name: 'surname',
          placeholder: 'surname',
          cssClass: 'al-input',
        },
        // {
        //   type: 'text',
        //   name: 'first_name',
        //   placeholder: 'Last name',
        //   cssClass: 'al-input',
        // },
        {
          type: 'text',
          name: 'adhar',
          placeholder: 'Adhar',
          cssClass: 'al-input',
        }
      );
    }
    this.alertController
      .create({
        header: act == 'fees' ? 'Getting Fees' : 'Admission',
        subHeader: 'WeAre charitable trust',
        cssClass: 'schedule-alert',
        message:
          act == 'fees'
            ? 'Are you sure? you want to donate with Hala muslim?'
            : 'Admission open',
        inputs: alrtInputs,

        buttons: [
          {
            text: 'Nop!',
            handler: () => {
              console.log('Let me think', this.record);
              // this.generatPDF(this.record);
            },
          },
          {
            text: 'Yes!',
            handler: async (data) => {
              let temp = Object.assign({}, this.record);
              data.created = new Date().toISOString();

              // &&
              // (data.type == 'Tution Fees' ||
              //   data.type == 'Anual Fees' ||
              //   data.type == 'Others')
              if (act == 'fees') {
                if (!temp.collection) temp.collection = [];
                data.invoiceNo = this.generateInvoiceNo();
                // temp.collection.push(data);
                console.log('Whatever', data);
                // this.fireService.updateRecord('Records/', this.record.id, temp);
                this.generatPDF(data);
              } else if (act == 'child') {
                data.parent_id = this.record.id;
                data.last_name = this.record.first_name;
                if (this.record.student_ids.includes(data.child)) {
                  this.utilService.presentToast('top', 'Already there');
                  return;
                }
                // temp.child = [];
                // temp.child.student_ids(data.child);
                data.class = 'MD';
                data.exams = [];
                console.log('record. ', this.record);
                console.log('student. ', data);
                this.fireService.admissionChild(data, this.record);
                // this.fireService.updateChildEntry(
                //   this.record.id,
                //   temp.child,
                //   this.record
                // );
                this.modalCtrl.dismiss('', 'confirm');
              } else {
                this.modalCtrl.dismiss('', 'cancel');
                this.utilService.presentToast('top', 'Wrong Keyword!!');
              }
            },
          },
        ],
      })
      .then((res) => {
        res.present();
      });

    // this.alertController.onDidDismiss((data?: any, role?: string) => {})
  }

  getWallet(allRecord: any) {
    let sum = 0;

    if (allRecord.collection.length > 0) {
      for (let i = 0; i < allRecord.collection.length; i++) {
        sum += parseInt(this.record.collection[i].Fees);
      }
    }
    return sum;
  }

  async barChartMethod() {
    // Now we need to supply a Chart element reference with an object that defines the type of chart we want to use, and the type of data we want to display.
    let data = [];
    let lbl = [];
    for (let num of this.record.collection) {
      data.push(parseInt(num.Fees));
      lbl.push(this.dateFormate(num.created));
    }

    this.barChart = new Chart(this.barCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: lbl,
        datasets: [
          {
            label: 'Fees',
            data: data,
            backgroundColor: [this.generateColor()],
            borderColor: [this.generateColor()],
            borderWidth: 1,
          },
        ],
      },
    });
    // this.barChart.clear();
    this.barChart.update();
  }

  dateFormate(_date: any) {
    return new Date(_date).toLocaleString('en-us', {
      month: 'short',
      year: 'numeric',
    });
  }

  formateTBL(_date: any) {
    return new Date(_date).toLocaleString('en-us', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  async receipt(data: any) {
    let template = `
    <html>
      <head>
      <title>${data.name}</title>
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
      <p style="margin-left: 10px;"><b> Maqtab hala muslim </b><br/> Sidokar 362255,<br/>Ta. Veraval <br/>Dist. Gir-somnath<br/>Invoice. ${
        this.invoiceList.length > 0 ? this.invoiceList.length + 1 : 1
      }<br/>
      ${this.islamicDetails.data.date.hijri.month.en} || ${
      this.islamicDetails.data.date.hijri.month.ar
    }
      </p>
      </div>
      <div class="user-content">
      <hr>
      <h4 style="width:100%;text-align: center;">Donation Receipt</h4>
      <p>તમારા યોગદાન માટે આભાર!  </p>
      </div>
      

      <table>
      <tr>
      <th>પ્રકાર</th>
      <th>તારીખ</th>
      <th>ઇસ્લામિક તારીખ</th>
      <th>રકમ</th>
      
    </tr>
          <tr>
      <td>${data.type}</td>
      <td>${this.formateTBL(data.created)}</td>
      <td>${this.islamicDetails.data.date.hijri.date}</td>
      <td>&#8377;${data.Fees}</td>
      
    </tr>
      <table>



      <div class="rt-bottom">
      <p><b>Donation received by</b><br/>Admin user<p/>
      </div>

      <footer>
      <p style="width:100%;text-align: center;">&#169; created by Aaiz</p>
      </footer>
      </body>
    </html>
    `;

    // તમારું દાન નોંધપાત્ર તફાવત લાવશે, કારણ કે આવક સમુદાયને ટેકો આપવામાં મદદ કરશે. તમને અમારા સમાજના સભ્ય તરીકે ગણવામાં અમને ગર્વ છે.

    template = await this.minifyJavaScript(template);
    // console.log(this.minifyJavaScript(template));
    // console.log(template);

    return template;
  }

  createFileName = (name: string = 'Maqtab_') => {
    return name + new Date().toISOString().slice(6);
  };

  generateInvoiceNo = () => {
    return this.invoiceList.length > 0 ? this.invoiceList.length + 1 : 1;
  };

  generatPDF(record: any) {
    console.log('@1. ', record);

    this.receipt(record).then((res: any) => {
      // console.log(res);
      this.modalCtrl.dismiss();
      let fName = this.createFileName(record.name);

      this.fireService.addInvoice(
        {
          invoiceNo: this.generateInvoiceNo(),
          name: fName,
          template: res,
          created: record.created,
        },
        record,
        this.record
      );

      this.fireService.downloadPDF(res, fName); //remove comment while test in device

      // cordova.plugins.pdf.htmlToPDF({
      //   data: res,
      //   documentSize: 'A4',
      //   landscape: 'portrait',
      //   type: 'share',
      //   fileName: this.createFileName(),
      // });
    });
  }

  minifyJavaScript(html: any) {
    html = html.replace(/>\s+</g, '><');

    // Remove white spaces and newlines within HTML tags
    html = html.replace(/\s+/g, ' ');

    return html;
  }

  generateColor = () => {
    let n = (Math.random() * 0xffc409 * 1000000).toString(16);
    return '#' + n.slice(0, 6);
  };
}
