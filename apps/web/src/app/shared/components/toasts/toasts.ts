import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toasts.html',
  styleUrl: './toasts.scss',
})
export class ToastsComponent {
  toastService = inject(ToastService);
}
