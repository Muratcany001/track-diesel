import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiServiceService } from './api-service.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  title = 'trackDieselUI';
  logoutForm!: FormGroup;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiServiceService,
    private formBuilder: FormBuilder
  ){}
  ngOnInit():void{
   this.logoutForm! = this.formBuilder.group({
   });
  }
  logOutService():void{
    const token = localStorage.getItem('token');
    if (!token){
      console.log("token bulunamadı")
      return;
    }
    this.apiService.logOut()?.subscribe(
      response => {
        console.log("Çıkış yapıldı")
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      },
      err => {
        console.log("Hatayla karılaşıldı",err)
      }
    );
  }
  
}
