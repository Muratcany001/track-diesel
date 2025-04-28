import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiServiceService } from '../api-service.service';
import { catchError, map, of } from 'rxjs';
import { NavController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
  standalone: false,  // standalone false
})
export class MainPage implements OnInit {
  addForm: FormGroup;  // Plaka formu
  errorForm: FormGroup;  // Arıza kodu formu
  carDetails: any = {};  // Araç detayları
  message: string = '';  // Mesajları tutan değişken
  code: string = '';  // Arıza kodu
  description: string = '';  // Arıza açıklaması
  isSuccess: boolean = false;  // İşlem sonucu durumu

  constructor(
    private navCtrl: NavController,
    private apiService: ApiServiceService,
    private formBuilder: FormBuilder,
    private httpClient: HttpClient
  ) {
    // Formlar
    this.addForm = this.formBuilder.group({
      plateNumber: ['', Validators.required],
    });
    
    this.errorForm = this.formBuilder.group({
      errorName: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  // Plaka sorgulama
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
        map((response: any) => {
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
        }),
        catchError(err => {
          this.message = "Araç bulunamadı";
          console.error('API Hatası:', err);
          return of(null);
        })
      )
      .subscribe(carData => {
        if (carData) {
          console.log('Dönüştürülmüş Araç Verisi:', carData);
          this.carDetails = carData;
          this.message = "Araç bulundu";
        }
      });
  }
}
