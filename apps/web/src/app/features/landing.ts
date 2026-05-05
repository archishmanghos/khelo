import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../shared/components/header/header';
import { HeroComponent } from './landing/hero/hero';
import { FeaturesGridComponent } from './landing/features-grid/features-grid';
import { LiveScoresComponent } from './landing/live-scores/live-scores';
import { FooterComponent } from '../shared/components/footer/footer';

import { TickerComponent } from '../shared/components/ticker/ticker';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    TickerComponent,
    HeaderComponent,
    HeroComponent,
    FeaturesGridComponent,
    LiveScoresComponent,
    FooterComponent,
  ],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class LandingComponent {}
