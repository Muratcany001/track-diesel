import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { NavController } from '@ionic/angular';
import { 
  IonContent, 
  IonInput, 
  IonButton, 
  IonNote,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonBadge,
  IonItemSliding
} from '@ionic/angular/standalone';
import { HttpClient,HttpClientModule,HttpErrorResponse,HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ApiServiceService } from '../api-service.service';

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  standalone: false,
})
export class Tab3Page {

  errorForm : ReactiveFormsModule
  plateNumber: string = '';
  addForm!: FormGroup;
  message: string = '';
  carDetails: any = {};

  constructor(
    private navCtrl:NavController,
    private apiService:ApiServiceService,
    private formBuilder: FormBuilder,
    private httpClient : HttpClient
  ) {
    this.errorForm = this.formBuilder.group({
      errorName: ['', Validators.required]
    });

    this.addForm = this.formBuilder.group({
      plateNumber: ['',Validators.required]
    });
  }
 
  ngOnInit(): void {
    this.addForm = this.formBuilder.group({
      plateNumber: ['', [Validators.required]]
    });
  }

  searchPlate(): void {
    if (this.addForm.invalid) {
      return;
    }
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Lütfen önce giriş yapın');
      this.navCtrl.navigateForward(['/login']);
      return;
    }
    
    const plateNumber = this.addForm.value.plateNumber;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    this.apiService.getCarByPlate(plateNumber)
  .pipe(
    map(response => {
      console.log('API Yanıtı:', response);
      if (response.errorHistory && response.errorHistory['$values'] && Array.isArray(response.errorHistory['$values'])) {
        return {
          ...response,
          errorHistory: response.errorHistory['$values'].map((issue: any) => ({
            ...issue,
            dateReported: new Date(issue.dateReported)
          }))
        };
      }
      return response;
    })
  )
  .subscribe(
    (carData) => {
      console.log('Gelen Araç Verisi:', carData);
      this.carDetails = carData;
      this.message = "Araç bulundu";
    },
    (error) => {
      this.message = "Araç bulunamadı";
      console.error(error);
    }
  );
  }
}

