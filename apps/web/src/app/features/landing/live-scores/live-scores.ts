import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-live-scores',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './live-scores.html',
  styleUrl: './live-scores.scss',
})
export class LiveScoresComponent {
  matches = [
    {
      id: 1,
      status: 'LIVE',
      venue: 'Lord\'s, London',
      team1: { name: 'ENG', score: '342/6' },
      team2: { name: 'NZ', score: '210/3 (34.2 ov)' },
      summary: 'New Zealand need 133 runs in 94 balls',
    },
    {
      id: 2,
      status: 'LIVE',
      venue: 'Eden Gardens, Kolkata',
      team1: { name: 'IND', score: '184/2 (18.0 ov)' },
      team2: { name: 'SA', score: 'Yet to bat' },
      summary: 'India opted to bat',
    },
    {
      id: 3,
      status: 'UPCOMING',
      venue: 'Wankhede, Mumbai',
      team1: { name: 'MI', score: '-' },
      team2: { name: 'CSK', score: '-' },
      summary: 'Starts in 2 hours',
    },
  ];
}
