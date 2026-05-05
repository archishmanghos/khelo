import { Component, inject, signal, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { GoogleAuthService } from '../../core/services/google-auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent implements AfterViewInit {
  private authService = inject(AuthService);
  private googleAuthService = inject(GoogleAuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';
  error = signal<string | null>(null);
  loading = signal(false);

  ngAfterViewInit() {
    this.googleAuthService.initialize((res: any) => this.handleGoogleResponse(res));
    this.googleAuthService.renderButton('google-login-btn');
  }

  onSubmit() {
    if (!this.email || !this.password) {
      this.error.set('Please fill in all fields');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
        this.toastService.show('Welcome back!', 'success');
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Login failed. Please check your credentials.');
        this.loading.set(false);
      },
    });
  }

  handleGoogleResponse(response: any) {
    this.loading.set(true);
    this.authService.googleAuth(response.credential).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
        this.toastService.show('Successfully logged in with Google', 'success');
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Google authentication failed');
        this.loading.set(false);
      },
    });
  }
}
