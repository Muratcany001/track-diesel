import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiServiceService, Part } from '../api-service.service';
import { Router } from '@angular/router';
import { CheckboxCustomEvent } from '@ionic/angular';

// Issue interface tanımı
interface CarIssue {
  partName: string;
  description: string;
  isReplaced: boolean;
  dateReported: string;
  lastMaintenanceDate: string;
  partId?: number;
  count?: number;
}

@Component({
  selector: 'app-update',
  templateUrl: './update.page.html',
  styleUrls: ['./update.page.scss'],
  standalone:false
})
export class UpdatePage implements OnInit {
  plateNumber: string="";
  updateForm!:FormGroup;
  message:String="";
  carDetails:any ={};
  issues:any = [];
  isLoading: boolean=false;
  availableParts: Part[] = [];
  filteredParts: Part[] = [];
  loadingParts: boolean = false;
  selectedPart: Part | null = null;
  searchTerm: string = '';
  loading: boolean = false;
  showPartSelectionPanel: boolean = false;

  constructor(private http:HttpClient,
    private apiService:ApiServiceService,
    private router: Router,
    private formBuilder: FormBuilder
  ){
    const today = new Date().toISOString();
    this.updateForm = this.formBuilder.group({
      plateNumber: ['', Validators.required],
      partName: ['', Validators.required],
      description: ['', Validators.required],
      isReplaced: [false, Validators.required],
      dateReported: [today, Validators.required],
      lastMaintenanceDate: [today, Validators.required],
      quantity: new FormControl({value: 0, disabled: true}, [Validators.required, Validators.min(0)])
    });
  }

  ngOnInit(): void {
    this.loadAvailableParts();
    
    // isReplaced değiştiğinde değerleri güncelle
    this.updateForm.get('isReplaced')?.valueChanges.subscribe(value => {
      this.onPartReplacedChange(value === 'true');
    });
  }

  updateCar(): void {
    this.isLoading = true;
    if (this.updateForm.invalid) {
      this.message = "Lütfen tüm alanları doldurun";
      this.isLoading = false;
      return;
    }

    const formValue = this.updateForm.getRawValue();
    const isReplaced = formValue.isReplaced === true;

    // Tarih değerlerini kontrol et
    if (!formValue.dateReported || !formValue.lastMaintenanceDate) {
      alert("Lütfen tarih alanlarını doldurun");
      this.isLoading = false;
      return;
    }

    // Tarihleri ISO formatına çevir
    let dateReported: string;
    let lastMaintenanceDate: string;

    try {
      dateReported = new Date(formValue.dateReported).toISOString();
      lastMaintenanceDate = new Date(formValue.lastMaintenanceDate).toISOString();
    } catch (error) {
      console.error('Tarih dönüştürme hatası:', error);
      alert("Tarih formatı geçersiz");
      this.isLoading = false;
      return;
    }

    // Parça değiştirilecekse ancak parça seçilmediyse hata ver
    if (isReplaced && !this.selectedPart) {
      alert("Parça değiştirilecekse lütfen listeden bir parça seçin.");
      this.isLoading = false;
      return;
    }

    // Seçilen parçanın stok kontrolü
    if (isReplaced && this.selectedPart && (formValue.quantity <= 0 || formValue.quantity > this.selectedPart.count)) {
      alert(`Seçilen "${this.selectedPart.name}" parçasından ${formValue.quantity} adet kullanılamaz. Stok: ${this.selectedPart.count}.`);
      this.isLoading = false;
      return;
    }

    // Issue verisini hazırla
    const issue: CarIssue = {
      partName: formValue.partName,
      description: formValue.description,
      isReplaced: isReplaced,
      dateReported: dateReported,
      lastMaintenanceDate: lastMaintenanceDate
    };

    // Parça değiştirilecekse ek bilgileri ekle
    if (isReplaced && this.selectedPart) {
      issue.partId = this.selectedPart.id;
      issue.count = Number(formValue.quantity);
    }

    const issues = [issue];

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Lütfen önce giriş yapın');
      this.router.navigate(['/login']);
      this.isLoading = false;
      return;
    }

    const plateNumber = formValue.plateNumber;
    console.log('Gönderilen veri:', { plateNumber, issues }); // Debug için log

    this.apiService.updateCar(plateNumber, issues).subscribe({
      next: (response) => {
        console.log('Güncelleme başarılı:', response);
        alert("Araç güncellendi")
        // Araç güncelleme başarılı ve parça değişimi yapılacaksa stok güncellemesi yap
        if (isReplaced && this.selectedPart && this.selectedPart.id && formValue.quantity) {
          const quantityToUse = Number(formValue.quantity);
          const partId = Number(this.selectedPart.id);
          const currentCount = Number(this.selectedPart.count);
          const newCount = currentCount - quantityToUse;

          if (newCount < 0) {
            console.error('Yeni stok negatif olamaz!');
            alert(`Stok hatası: ${currentCount} - ${quantityToUse} = ${newCount}`);
            this.isLoading = false;
            return;
          }

          this.apiService.updatePart(partId, { count: newCount }).subscribe({
            next: (updatedStock) => {
              console.log('Stok güncellendi:', updatedStock);
              this.message = 'Araç ve stok başarıyla güncellendi';
              this.isLoading = false;
              this.loadAvailableParts(); // Parça listesini yenile
            },
            error: (err) => {
              console.error('Stok güncelleme hatası:', err);
              let errorMessage = 'Stok güncellenirken hata oluştu!';
              if (err.error) {
                if (typeof err.error === 'string') {
                  errorMessage += `\nHata: ${err.error}`;
                } else if (err.error.message) {
                  errorMessage += `\nHata: ${err.error.message}`;
                }
              }
              alert(errorMessage);
              this.isLoading = false;
            }
          });
        } else {
          this.message = 'Araç başarıyla güncellendi';
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Güncelleme hatası detayları:', error);
        
        let errorMessage = 'Araç güncellenirken hata oluştu';
        if (error.error) {
          if (typeof error.error === 'string') {
            errorMessage += `: ${error.error}`;
          } else if (error.error.message) {
            errorMessage += `: ${error.error.message}`;
          } else if (error.error.title) {
            errorMessage += `: ${error.error.title}`;
            if (error.error.errors) {
              Object.keys(error.error.errors).forEach(key => {
                errorMessage += `\n${key}: ${error.error.errors[key].join(', ')}`;
              });
            }
          }
        }
        
        this.message = errorMessage;
        this.isLoading = false;
        alert(errorMessage);
      }
    });
  }

  loadAvailableParts(): void {
    this.loadingParts = true;
    
    this.apiService.getAllParts().subscribe({
      next: (response: any) => {
        console.log('API parça yanıtı:', response);
        
        try {
          if (response && response.$values) {
            this.availableParts = response.$values;
          } else if (Array.isArray(response)) {
            this.availableParts = response;
          } else {
            console.warn('Beklenmeyen API yanıt formatı:', response);
            this.availableParts = [];
          }
          
          // Parçaları doğru şekilde işlemek için kontrol et ve stokta olmayanları filtrele
          this.availableParts = this.availableParts
            .map(part => {
              if (!part.id) console.warn('Parça ID bulunamadı:', part);
              if (!part.name) console.warn('Parça adı bulunamadı:', part);
              if (part.count === undefined || part.count === null) {
                console.warn('Parça count bulunamadı, varsayılan olarak 0 kullanılıyor:', part);
                part.count = 0;
              }
              
              return {
                ...part,
                count: typeof part.count === 'string' ? parseInt(part.count, 10) : part.count
              };
            })
            .filter(part => part.count > 0); // Sadece stokta olan parçaları göster
          
          this.filteredParts = [];
          
          if (this.availableParts.length === 0) {
            console.warn('Stokta parça bulunamadı');
            alert('Sistemde kayıtlı değiştirilebilecek parça bulunamadı!');
          } else {
            console.log('Yüklenen parçalar:', this.availableParts);
          }
        } catch (error) {
          console.error('Parça verisi işlenirken hata:', error);
          this.availableParts = [];
          this.filteredParts = [];
        } finally {
          this.loadingParts = false;
        }
      },
      error: (err) => {
        console.error('Parça yükleme hatası:', err);
        this.availableParts = [];
        this.filteredParts = [];
        this.loadingParts = false;
        
        let errorMessage = 'Parça listesi yüklenirken hata oluştu!';
        if (err.error) {
          if (typeof err.error === 'string') {
            errorMessage += `\nHata: ${err.error}`;
          } else if (err.error.message) {
            errorMessage += `\nHata: ${err.error.message}`;
          }
        }
        alert(errorMessage);
      }
    });
  }

  onPartSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.searchTerm = searchTerm;
    
    if (this.selectedPart && this.selectedPart.name.toLowerCase() !== searchTerm) {
      this.resetPartSelection();
    }
    
    // Parça değiştirilecekse ve arama terimi varsa filtreleme yap
    if (searchTerm.length > 0 && this.updateForm.get('isReplaced')?.value) {
      this.filteredParts = this.availableParts.filter(part => 
        part && part.name && part.name.toLowerCase().includes(searchTerm)
      );
      
      // Eğer hiç sonuç bulunamadıysa ve arama terimi yeterince uzunsa
      if (this.filteredParts.length === 0 && searchTerm.length >= 2) {
        console.log('Parça bulunamadı:', searchTerm);
        console.log('Mevcut parçalar:', this.availableParts);
      }
    } else {
      this.filteredParts = [];
    }
  }

  selectPart(part: Part): void {
    this.selectedPart = part;
    
    this.updateForm.patchValue({
      partName: part.name,
      quantity: 1
    });
    
    const quantityControl = this.updateForm.get('quantity');
    if (quantityControl) {
      quantityControl.enable();
      quantityControl.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(part.count)
      ]);
      quantityControl.updateValueAndValidity();
    }
    
    this.filteredParts = [];
  }

  validateQuantity(): void {
    if (!this.selectedPart) return;
    
    const quantityControl = this.updateForm.get('quantity');
    if (!quantityControl) return;

    let quantity = quantityControl.value;

    if (quantity < 1) {
      quantityControl.setValue(1);
    }

    if (quantity > this.selectedPart.count) {
      alert(`Stokta sadece ${this.selectedPart.count} adet "${this.selectedPart.name}" bulunmaktadır! Miktar ${this.selectedPart.count} olarak ayarlandı.`);
      quantityControl.setValue(this.selectedPart.count);
    }
  }

  resetPartSelection(): void {
    this.selectedPart = null;
    this.filteredParts = [];
    this.searchTerm = '';
    
    if (this.updateForm.get('isReplaced')?.value === 'true') {
      this.updateForm.patchValue({
        partName: '',
        quantity: 1
      });
    }
  }

  updatePart(): void {
    if (this.updateForm.invalid || this.isLoading || !this.selectedPart) {
      this.markFormGroupTouched(this.updateForm);
      return;
    }

    const formValue = this.updateForm.getRawValue();
    const newCount = Number(formValue.quantity);
    
    if (newCount < 0) {
      alert('Stok miktarı negatif olamaz!');
      return;
    }

    this.isLoading = true;
    
    if (!this.selectedPart?.id) {
      alert('Parça ID bulunamadı!');
      this.isLoading = false;
      return;
    }
    
    this.apiService.updatePart(this.selectedPart.id, { count: newCount }).subscribe({
      next: (updatedPart) => {
        console.log('Stok güncellendi:', updatedPart);
        alert("Stok başarıyla güncellendi.");
        this.resetPartSelection();
        this.loadAvailableParts(); // Listeyi yenile
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Stok güncelleme hatası:', err);
        let errorMessage = 'Stok güncellenirken hata oluştu!';
        if (err.error) {
          if (typeof err.error === 'string') {
            errorMessage += `\nHata: ${err.error}`;
          } else if (err.error.message) {
            errorMessage += `\nHata: ${err.error.message}`;
          }
        }
        alert(errorMessage);
        this.isLoading = false;
      }
    });
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  onPartReplacedChange(isReplaced: boolean): void {
    this.resetPartSelection();
    
    if (isReplaced) {
      this.loadAvailableParts();
      this.showPartSelectionPanel = true;
      this.updateForm.get('partName')?.enable();
      this.updateForm.get('quantity')?.enable();
    } else {
      this.showPartSelectionPanel = false;
      this.updateForm.get('partName')?.enable();
      this.updateForm.get('quantity')?.disable();
      this.updateForm.get('quantity')?.setValue(1);
    }
  }
}
