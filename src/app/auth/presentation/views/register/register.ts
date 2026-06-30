import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthStore } from '../../../application/auth.store';
import { LanguageSwitcher } from '../../../../shared/presentation/components/language-switcher/language-switcher';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const pw  = control.get('password');
  const cpw = control.get('confirmPassword');
  if (pw && cpw && pw.value !== cpw.value) return { passwordMismatch: true };
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, MatIconModule, LanguageSwitcher],
  templateUrl: './register.html',
  styleUrl:    './register.scss',
})
export class RegisterComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthStore);
  private router = inject(Router);

  readonly registerError   = this.auth.registerError;
  readonly registerLoading = this.auth.registerLoading;

  showPass        = false;
  showConfirmPass = false;
  accountType: 'client' | 'business' = 'client';

  form = this.fb.group(
    {
      firstName:       ['', [Validators.required, Validators.minLength(2)]],
      lastName:        ['', [Validators.required, Validators.minLength(2)]],
      dni:             ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
      phoneNumber:     ['', [Validators.required, Validators.pattern(/^[0-9]{7,15}$/)]],
      email:           ['', [Validators.required, Validators.email]],
      password:        ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatch }
  );

  get f() { return this.form.controls; }

  selectAccountType(type: 'client' | 'business'): void {
    this.accountType = type;
    this.auth.clearRegisterError();
  }

  onInputChange(): void {
    this.auth.clearRegisterError();
  }

  onSubmit(): void {
    if (this.form.invalid || this.registerLoading()) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    this.auth.register({
      firstName:      v.firstName!,
      lastName:       v.lastName!,
      dni:            v.dni!,
      phoneNumber:    v.phoneNumber!,
      email:          v.email!,
      password:       v.password!,
      businessIntent: this.accountType === 'business',
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
