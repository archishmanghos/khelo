import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  themeService = inject(ThemeService);
  authService = inject(AuthService);

  constructor() {
    effect(() => {
      console.log('HeaderComponent: Auth Status Changed', {
        authenticated: this.authService.isAuthenticated(),
        user: this.authService.currentUser()
      });
    });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  logout() {
    this.authService.logout().subscribe();
  }

  getInitials(name: string) {
    return name ? name.charAt(0).toUpperCase() : '?';
  }
}
