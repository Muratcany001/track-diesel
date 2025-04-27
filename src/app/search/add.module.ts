import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddPageRoutingModule } from './add-routing.module';

import { AddPage } from './add.page';
import { HttpClient, HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { ApiServiceService } from '../api-service.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddPageRoutingModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  declarations: [AddPage],
  providers: [ApiServiceService],
})
export class AddPageModule {}
