import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-features-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './features-grid.html',
  styleUrl: './features-grid.scss',
})
export class FeaturesGridComponent {
  features = [
    {
      icon: 'bolt',
      title: 'Zero Latency',
      description: 'Update scores in real-time. Our optimized event-bus ensures data reaches fans before they hear the cheer.',
    },
    {
      icon: 'analytics',
      title: 'Deep Analytics',
      description: 'Wagon wheels, pitch maps, and player vs player stats generated automatically as you score.',
    },
    {
      icon: 'groups',
      title: 'Tournament Engine',
      description: 'Manage leagues, knockout stages, and player registrations with professional-grade tournament tools.',
    },
    {
      icon: 'share',
      title: 'Instant Socials',
      description: 'Auto-generate beautiful match summaries and player milestones ready for social media sharing.',
    },
  ];
}
