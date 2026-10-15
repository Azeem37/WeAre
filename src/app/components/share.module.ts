import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list/list.component';
import { CommonComponent } from './common/common.component';

@NgModule({
  declarations: [
    ListComponent,
    CommonComponent
  ],
  imports:[CommonModule],
  exports: [
    ListComponent,
    CommonComponent
  ],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class ShareModule { }