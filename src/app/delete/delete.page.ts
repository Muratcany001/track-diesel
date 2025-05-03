import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiServiceService } from '../api-service.service';
import { AuthService } from '../auth.service';
@Component({
  selector: 'app-delete',
  templateUrl: './delete.page.html',
  styleUrls: ['./delete.page.scss'],
  standalone:false,
})
export class DeletePage implements OnInit {

  carForm!: FormGroup;
  loading:boolean =false;

  constructor(
    private apiService : ApiServiceService,
    private authService : AuthService,
  ){}

  ngOnInit(): void{
      this.carForm = new FormGroup ({
        plateNumber : new FormControl('', Validators.required)
      });
  }
  deleteCar (){
    if(this.carForm.valid){
      const formValue = this.carForm.value;
      const userId = this.authService.getCurrentUserId();
      this.loading=false;
      if(!userId){
        alert("Kullanıcı bulunamadı ");
        return;
      }
      const plateNumber = formValue.plateNumber;
      this.loading=true;
      this.apiService.deleteCar(plateNumber).subscribe({
        next: (response) => {
          this.loading=false;
          console.log(response)
          this.carForm.reset()
          alert("Araç başarıyla silindi")
        },
        error: (error) => {
          console.error('Hata bulundu', error)
          if(error.error){
            console.error('Hata detayları',error.error)
          }
          alert("Kayıtlı araç bulunamadı");
          this.loading=false;
        },
        complete: () => {
          this.loading=false;
        }});
    }
    else{
      alert('Lütfen tüm alanları doldurun');
    }
  }

}
