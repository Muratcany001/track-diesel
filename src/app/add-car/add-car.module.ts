import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { IonicModule } from '@ionic/angular';

import { AddCarPageRoutingModule } from './add-car-routing.module';

import { AddCarPage } from './add-car.page';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddCarPageRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule
  ],
  declarations:[AddCarPage]
})
export class AddCarPageModule {}
