import { Component, inject, signal, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { GoogleAuthService } from '../../core/services/google-auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class SignupComponent implements AfterViewInit {
  private authService = inject(AuthService);
  private googleAuthService = inject(GoogleAuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  error = signal<string | null>(null);
  loading = signal(false);

  ngAfterViewInit() {
    this.googleAuthService.initialize((res: any) => this.handleGoogleResponse(res));
    this.googleAuthService.renderButton('google-signup-btn');
  }

  onSubmit() {
    if (!this.name || !this.email || !this.password) {
      this.error.set('Please fill in all fields');
      return;
    }

    if (this.password.length < 8) {
      this.error.set('Password must be at least 8 characters long');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.authService.signup({ 
      name: this.name, 
      email: this.email, 
      password: this.password 
    }).subscribe({
      next: () => {
        this.router.navigate(['/']);
        this.toastService.show('Account created successfully! Welcome to Khelo.', 'success');
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Signup failed. Please try again.');
        this.loading.set(false);
      },
    });
  }

  handleGoogleResponse(response: any) {
    this.loading.set(true);
    this.authService.googleAuth(response.credential).subscribe({
      next: () => {
        this.router.navigate(['/']);
        this.toastService.show('Account created with Google!', 'success');
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Google signup failed');
        this.loading.set(false);
      },
    });
  }
}
