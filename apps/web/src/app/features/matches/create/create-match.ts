import { Component, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatchService } from '../../../core/services/match.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';

import { HeaderComponent } from '../../../shared/components/header/header';

@Component({
  selector: 'app-create-match',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent],
  templateUrl: './create-match.html',
  styleUrl: './create-match.scss',
})
export class CreateMatchComponent {
  private matchService = inject(MatchService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private location = inject(Location);

  formData = {
    title: '',
    format: 't20',
    totalOvers: 20,
    startTime: '',
    teamA: { name: '', players: [] },
    teamB: { name: '', players: [] },
  };

  submitting = signal(false);

  goBack() {
    this.location.back();
  }

  onSubmit() {
    const user = this.authService.currentUser();
    if (!user) {
      this.toastService.show('Please login to create a match', 'error');
      return;
    }

    this.submitting.set(true);
    const payload = {
      ...this.formData,
      createdBy: user.id,
      sportType: 'cricket',
      participants: [
        { type: 'team', role: 'home' },
        { type: 'team', role: 'away' }
      ]
    };

    this.matchService.createMatch(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.show('Match created successfully!', 'success');
          this.router.navigate(['/matches']);
        }
        this.submitting.set(false);
      },
      error: (err) => {
        this.toastService.show(err.message || 'Failed to create match', 'error');
        this.submitting.set(false);
      }
    });
  }
}
