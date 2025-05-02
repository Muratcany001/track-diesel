import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiServiceService } from '../api-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-update',
  templateUrl: './update.page.html',
  styleUrls: ['./update.page.scss'],
  standalone:false
})
export class UpdatePage {

  plateNumber: string="";
    updateForm!:FormGroup;
    message:String="";
    carDetails:any ={};
    issues:any = [];
    isLoading: boolean=false;
    constructor(private http:HttpClient,
      private apiService:ApiServiceService,
      private router: Router,
      private formBuilder: FormBuilder
    ){
      this.updateForm = this.formBuilder.group({
        plateNumber : ['',Validators.required],
        partName : ['',Validators.required],
        description:['',Validators.required],
        isReplaced:[false, Validators.required],
        dateReported: ['',Validators.required],
        lastMaintenanceDate: ['',Validators.required]
      })
    }
    updateCar(): void{
      this.isLoading=true;
      if(this.updateForm.invalid){
        this.message= "Lütfen tüm alanları doldurun"
        return;
      }
      const issues = [{
        PartName: this.updateForm.value.partName,
        Description: this.updateForm.value.description,
        IsReplaced: this.updateForm.value.isReplaced,
        DateReported: new Date(this.updateForm.value.dateReported)
      }];
      const token = localStorage.getItem('token');
      if(!token){
        alert('Lütfen önce giriş yapın');
        this.router.navigate(['/login']);
        return;
      }
      const plateNumber = this.updateForm.value.plateNumber;
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }); 

      this.apiService.updateCar(
        this.updateForm.value.plateNumber, 
        issues
      ).subscribe({
        next: (response) => {
          this.carDetails = {
            plateNumber: this.updateForm.value.plateNumber,
            errorHistory: Array.isArray(response) ? response.map(issue => ({
              ...issue,
              dateReported: new Date(issue.dateReported)
            })) : [],
            lastMaintenanceDate: new Date(this.updateForm.value.lastMaintenanceDate)
          };
          this.message = 'Araç başarıyla güncellendi';
          this.isLoading = false;
        },
        error: (error) => {
          this.message = 'Araç güncellenirken hata oluştu: ' + (error.error?.message || error.message);
          this.isLoading = false;
          console.error('Güncelleme hatası:', error);
        }
      });
  }

}
