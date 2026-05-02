import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class SignupComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  error = signal<string | null>(null);
  loading = signal(false);

  onSubmit() {
    this.loading.set(true);
    this.error.set(null);

    this.authService.signup({ 
      name: this.name, 
      email: this.email, 
      password: this.password 
    }).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Signup failed');
        this.loading.set(false);
      },
    });
  }

  loginWithGoogle() {
    console.log('Google signup clicked');
  }
}
