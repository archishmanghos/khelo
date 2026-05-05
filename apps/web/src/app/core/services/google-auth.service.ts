import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

declare var google: any;

@Injectable({
  providedIn: 'root',
})
export class GoogleAuthService {
  private authService = inject(AuthService);
  private readonly CLIENT_ID = environment.googleClientId;

  initialize(callback: (response: any) => void) {
    if (typeof google === 'undefined') {
      setTimeout(() => this.initialize(callback), 100);
      return;
    }

    google.accounts.id.initialize({
      client_id: this.CLIENT_ID,
      callback: (res: any) => callback(res),
      ux_mode: 'popup',
      context: 'signin',
      auto_select: false,
      use_fedcm_for_prompt: true,
      itp_support: true,
    });

    // Optional: Show One Tap prompt
    google.accounts.id.prompt();
  }

  renderButton(elementId: string) {
    if (typeof google === 'undefined') {
      setTimeout(() => this.renderButton(elementId), 100);
      return;
    }

    const element = document.getElementById(elementId);
    if (element) {
      google.accounts.id.renderButton(element, {
        type: 'standard',
        shape: 'rectangular',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        width: element.offsetWidth || 320,
        logo_alignment: 'left',
      });
    }
  }
}
