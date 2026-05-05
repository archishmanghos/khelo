import { Component } from '@angular/core';

@Component({
  selector: 'app-ticker',
  standalone: true,
  templateUrl: './ticker.html',
  styleUrl: './ticker.scss',
})
export class TickerComponent {
  items = [
    'IND vs AUS: Kohli scores 50! (84/1)',
    'IPL Auction 2026: Records shattered in Mumbai',
    'England leads by 240 runs at stumps',
    'T20 World Cup: Groups announced for 2026',
    'Live: Local League Finals streaming now',
  ];
}
