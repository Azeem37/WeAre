import { Component, Input, OnInit } from '@angular/core';
import { FireStoreService } from 'src/app/services/fire-store.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  @Input() dataList!: any;
  studentsList: any;
  dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  constructor(public fireService: FireStoreService) {}

  ngOnInit() {}

  async ngAfterViewInit() {
    // const res = this.fireService.getStudents();
    // (await res).subscribe(async (val) => {
    //   console.log('!@getStudents. ', val);
    //   if (val) this.studentsList = await val;
    // });

    console.log('did viewngAfterViewInit', this.dataList!!);
  }

  checkAttendance(st: any) {
    st.checkAttendance = !st.checkAttendance;
    console.log('checkAttendance', st);
  }

  saveChange() {
    const studentNamesAndIds: any = {};
    studentNamesAndIds.date = this.formatDate(new Date());
    studentNamesAndIds.day = this.dayNames[new Date().getDay()];
    studentNamesAndIds.checkStatus = this.dataList.map((student: any) => ({
      id: student.id,
      surname: student.surname,
      first_name: student.first_name,
      last_name: student.last_name,
      checkAttendance: student.checkAttendance,
    }));

    console.log(studentNamesAndIds);
  }

  formatDate(date: any) {
    const day = String(date.getDate()).padStart(2, '0'); // Ensure day is 2 digits
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed, so add 1
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }
}
