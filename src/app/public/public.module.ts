import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PublicPageRoutingModule } from './public-routing.module';

import { PublicPage } from './public.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, PublicPageRoutingModule],
  declarations: [PublicPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PublicPageModule {}
