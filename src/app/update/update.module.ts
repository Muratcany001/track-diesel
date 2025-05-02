import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UpdatePageRoutingModule } from './update-routing.module';

import { UpdatePage } from './update.page';
import { HttpClient } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UpdatePageRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule
  ],
  declarations: [UpdatePage]
})
export class UpdatePageModule {}
