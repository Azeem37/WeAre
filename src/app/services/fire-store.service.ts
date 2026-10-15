import { Inject, Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { UtilService } from './util.service';
import { asyncScheduler, BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, mergeMap, observeOn, delay } from 'rxjs/operators';
import Student from '../model/model';
import Parent from '../model/model';
import { Network } from '@capacitor/network';

declare var cordova: any;

@Injectable({
  providedIn: 'root',
})
export class FireStoreService {
  constructor(
    private utilService: UtilService,
    private firestore: AngularFirestore
  ) {}

  async admissionChild(stdnt: Student, record: Parent) {
    try {
      await this.firestore
        .collection('/Students/')
        .add(stdnt)
        .then((result) => {
          console.log('result student entry', result);

          record.student_ids.push(result.id);
          console.log('Parent record', record);
          this.utilService.presentToast(
            'top',
            'Admission Successfull',
            'primary'
          );

          this.updateRecord('Records/', record.id, record);
        });
    } catch (error) {
      this.utilService.presentToast('top', 'Something wring', 'danger');
    }
  }

  async upDateStudentExam(id: string, recorUpdate: any, exam: any) {
    try {
      this.utilService.showLoading('Update exam', 5000);
      this.firestore
        .doc('Students/' + id)
        .update(recorUpdate)
        .then(() => {
          this.updateRecord('Exam/', exam.id, exam);
          this.utilService.presentToast('top', 'Successfull', 'primary');
        });
    } catch (error) {
      this.utilService.presentToast('top', 'Something wring', 'danger');
    }
  }

  async addInvoice(invoiceData: any, record: any, person: any) {
    try {
      this.firestore
        .collection('/Invoices/')
        .add(invoiceData)
        .then((result) => {
          if (!person.collection) person.collection = [];
          record.id = result.id;
          person.collection.push(record);
          console.log('@Invoice. ', record);

          this.updateRecord('Records/', person.id, person);
          this.utilService.presentToast(
            'top',
            'Successfull Invoices',
            'primary'
          );
        });
    } catch (error) {
      this.utilService.presentToast('top', 'Something wring', 'danger');
    }
  }

  async updateRecord(docName: string, id: any, recorUpdate: any) {
    try {
      this.firestore
        .doc(docName + id)
        .update(recorUpdate)
        .then(() => {
          console.log(`Successfully ${docName} update `);
          this.utilService.presentToast(
            'top',
            `Successfully ${docName} update`,
            'primary'
          );
        });
    } catch (error) {
      this.utilService.presentToast('top', 'Something wring', 'danger');
    }
  }

  deleteRecord(id: any) {
    // this.firestore.doc('/Records/'+id).delete()
  }

  async getRecordsQ(): Promise<Observable<any>> {
    this.utilService.showLoading('Fetch all record', 3000);
    //////////////////////////////////////
    return await this.firestore
      .collection('/Records/')
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            console.log('test@@@', a);

            const data: any = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      );
  }

  async updateChildEntry(id: any, recorUpdate: any, record: any) {
    this.firestore
      .doc('Records/' + id)
      .update({
        student_ids: recorUpdate,
      })
      .then(() => {
        this.firestore
          .collection('/Students/')
          .snapshotChanges()
          .subscribe((res) => {
            this.utilService.presentToast('top', 'Successfull', 'primary');
            if (res) {
              let temp = res.map((e: any) => {
                return e.payload.doc.data()['name'];
              });

              for (let num of temp) {
                const index = recorUpdate.indexOf(num);
                if (index > -1) {
                  recorUpdate.splice(index, 1);
                }
              }
              record.child = recorUpdate;
              // this.admissionChild(record);
            }
          });
      });
  }

  getSingleStudent(name: string) {
    return this.firestore
      .collection('Students', (ref) => ref.where('name', '==', name))
      .snapshotChanges();
  }

  getSingleCollection(name: string) {
    this.firestore
      .collection('Records', (ref) => ref.where('adhar', '==', name))
      .valueChanges()
      .subscribe((data) => {
        console.log('()()()', data);
        return data;
      });
  }

  getInvoices() {
    return this.firestore.collection('/Invoices/').snapshotChanges();
  }

  getInvoice(inNo: number) {
    return this.firestore
      .collection('Invoices', (ref) => ref.where('invoiceNo', '==', inNo))
      .snapshotChanges();
  }

  downloadPDF(template: string, fName: string) {
    cordova.plugins.pdf.htmlToPDF({
      data: template,
      documentSize: 'A6',
      landscape: 'portrait',
      type: 'share',
      fileName: fName,
    });
  }

  addMarriageDateRecord(record: any) {
    record.created = new Date().toISOString();

    this.firestore
      .collection('/MarriageDateRecord/')
      .add(record)
      .then(() => {
        this.utilService.presentToast('top', 'Successfull', 'primary');
      });
  }

  ////////////deepseek code

  async checkNetwork(): Promise<boolean> {
    const status = await Network.getStatus();
    return status.connected;
  }

  async getRecords(retries = 3, delay = 1000): Promise<any[] | undefined> {
    this.utilService.showLoading('Fetch records.', 5000);
    try {
      const snapshot = await this.firestore
        .collection<any>('/Records/')
        .get()
        .toPromise();
      return snapshot?.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      if (retries > 0) {
        this.utilService.showLoading('Retrying fetch records.', 5000);
        console.log(`Retrying... ${retries} attempts left`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.getRecords(retries - 1, delay * 2); // Exponential backoff
      } else {
        throw new Error('Max retries reached. Unable to fetch data.');
      }
    }
  }

  async scheduleExam(record: any) {
    try {
      const isConnected = await this.checkNetwork();
      if (!isConnected) throw new Error('No network connection');

      this.utilService.showLoading('Schedule Exam.', 5000);
      this.firestore
        .collection('Exam/')
        .add(record)
        .then(() => {
          this.utilService.presentToast(
            'top',
            'Successfull Exam added',
            'primary'
          );
        });
    } catch (error: any) {
      console.error('Error adding record:', error.message);
      this.utilService.presentToast(
        'top',
        'Failed to add record. Please check your internet connection.',
        'danger'
      );
    }
  }

  async addRecord(record: any) {
    try {
      const isConnected = await this.checkNetwork();
      if (!isConnected) throw new Error('No network connection');

      if (!record?.student_ids) record.student_ids = [];
      record.created = new Date().toISOString();

      this.utilService.showLoading('Add Record.', 5000);
      await this.firestore
        .collection('/Records/')
        .add(record)
        .then(() => {
          this.utilService.presentToast('top', 'Successful', 'primary');
          if (record.student_ids && record.student_ids.length > 0) {
            // this.admissionChild(record);
          }
        });
    } catch (error: any) {
      console.error('Error adding record:', error.message);
      this.utilService.presentToast(
        'top',
        'Failed to add record. Please check your internet connection.',
        'danger'
      );
    }
  }

  async getStudents(retries = 1, delay = 1000): Promise<any[] | undefined> {
    try {
      this.utilService.showLoading('Get Students.', 5000);
      const snapshot = await this.firestore
        .collection<any>('/Students/')
        .get()
        .toPromise();
      return snapshot?.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Bad request error:', error);

      if (retries > 0) {
        this.utilService.showLoading('Retrying Get Students.', 5000);
        console.log(`Retrying... ${retries} attempts left`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.getStudents(retries - 1, delay * 2); // Exponential backoff
      } else {
        throw new Error('Max retries reached. Unable to fetch data.');
      }
    }
  }

  async getMarriageDateRecord(
    retries = 1,
    delay = 1000
  ): Promise<any[] | undefined> {
    try {
      this.utilService.showLoading('Get Marriage Date.', 5000);
      const snapshot = await this.firestore
        .collection<any>('/MarriageDateRecord/')
        .get()
        .toPromise();
      return snapshot?.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      if (retries > 0) {
        this.utilService.showLoading('Retrying Get Marriage Date.', 5000);
        console.log(`Retrying... ${retries} attempts left`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.getMarriageDateRecord(retries - 1, delay * 2); // Exponential backoff
      } else {
        throw new Error('Max retries reached. Unable to fetch data.');
      }
    }
  }

  async getExams(retries = 1, delay = 1000): Promise<any[] | undefined> {
    try {
      this.utilService.showLoading('Get Exam Date.', 5000);
      const snapshot = await this.firestore
        .collection<any>('/Exam/')
        .get()
        .toPromise();
      return snapshot?.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      if (retries > 0) {
        this.utilService.showLoading('Retrying Get Exam Date.', 5000);
        console.log(`Retrying... ${retries} attempts left`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.getExams(retries - 1, delay * 2); // Exponential backoff
      } else {
        throw new Error('Max retries reached. Unable to fetch data.');
      }
    }
  }
}
