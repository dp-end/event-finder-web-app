import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth';


@Component({
  selector: 'app-register-student',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './register-student.html',
  styleUrl: './register-student.css',
})
export class RegisterStudent {
  studentForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService // Servisimizi enjekte ettik
  ) {
    this.studentForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      university: ['', Validators.required],
      department: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).+$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.studentForm.valid) {
      const formValues = this.studentForm.value;

      // Backend'in tam olarak beklediği paketi (payload) hazırlıyoruz
      const requestPayload = {
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        email: formValues.email,
        userName: formValues.email.split('@')[0], // E-postanın başını kullanıcı adı yaptık
        password: formValues.password,
        confirmPassword: formValues.confirmPassword
      };

      this.authService.register(requestPayload).subscribe({
        next: (response) => {
          this.successMessage = 'Harika! Kaydınız başarıyla oluşturuldu. Giriş sayfasına yönlendiriliyorsunuz...';

          // 2 saniye bekleyip login sayfasına atıyoruz ki kullanıcı başarılı mesajını okuyabilsin
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (err) => {
          console.error('Kayıt Hatası:', err);
          // Backend'den gelen spesifik bir hata varsa (örn: Bu mail zaten kayıtlı), onu gösteririz
          this.errorMessage = err.error?.message || 'Kayıt sırasında bir hata oluştu. Lütfen bilgilerinizi kontrol edin.';
        }
      });

    } else {
      this.studentForm.markAllAsTouched();
    }
  }

  goBack() {
    window.history.back();
  }
}
