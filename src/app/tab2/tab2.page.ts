import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiServiceService, newError } from '../api-service.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
  standalone:false
})
export class Tab2Page implements OnInit {
  errorForm: FormGroup;
  code: string = '';
  description: string = '';
  errorName: string = '';
  message: string = '';
  isSuccess: boolean = false;

  constructor(
    private apiService: ApiServiceService,
    private fb: FormBuilder
  ) {
    this.errorForm = this.fb.group({
      errorName: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  getError() {
    if (this.errorForm.invalid) {
      this.message = 'Geçersiz form işlemi';
      this.isSuccess = false;
      return;
    }
  
    const errorName = this.errorForm.value.errorName;
    console.log('Sorgulanan hata kodu:', errorName);
    
    this.apiService.getError(errorName)
      .pipe(
        catchError(err => {
          console.error('API Hatası:', err);
          this.message = 'API bağlantı hatası';
          this.isSuccess = false;
          return of(null);
        })
      )
      .subscribe((response: any) => {
        if (response && response.code) {
          this.code = response.code;
          this.description = response.description;
          this.message = 'İşlem başarılı';
          this.isSuccess = true;
        } else {
          this.code = '';
          this.description = '';
          this.message = 'Arıza kodu bulunamadı';
          alert(this.message);
          this.isSuccess = false;
        }
      });
  }

  addNewError() {
    const addError: newError = {
      code: 'Hata kodu',
      description: 'Açıklama'
    };
    this.apiService.addError(addError)
      .pipe(
        catchError(err => {
          console.error('hata oluştu', err);
          return of(null);
        })
      )
      .subscribe(Response => {
        if (Response) {
          console.log('Hata başarıyla eklendi', Response);
        }
      });
  }
}