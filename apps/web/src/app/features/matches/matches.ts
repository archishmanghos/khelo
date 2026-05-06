import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatchService } from '../../core/services/match.service';
import { HeaderComponent } from '../../shared/components/header/header';
import { DateRangePickerComponent } from '../../shared/widgets/date-range-picker/date-range-picker';

@Component({
  selector: 'app-matches',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent, DateRangePickerComponent],
  templateUrl: './matches.html',
  styleUrl: './matches.scss',
})
export class MatchesComponent implements OnInit {
  private matchService = inject(MatchService);

  matches = this.matchService.matches;
  loading = this.matchService.loading;
  total = this.matchService.total;
  
  selectedDateRangeLabel = signal<string>('Select Date Range');

  filters = signal<any>({
    sportType: 'cricket',
    format: '',
    status: '',
    startDate: '',
    endDate: '',
    searchTerm: '',
    skip: 0,
    take: 20
  });

  ngOnInit() {
    this.loadMatches();
  }

  onSearch(event: any) {
    const value = event.target.value;
    this.filters.update(f => ({ ...f, searchTerm: value }));
    this.loadMatches(true);
  }

  setFormat(format: string) {
    if (this.filters().format === format) return;
    this.filters.update(f => ({ ...f, format }));
    this.loadMatches();
  }

  onDateRangeChange(range: { start: Date | null, end: Date | null }) {
    if (range.start && range.end) {
      const startStr = range.start.toISOString().split('T')[0];
      const endStr = range.end.toISOString().split('T')[0];
      
      this.filters.update(f => ({ 
        ...f, 
        startDate: startStr,
        endDate: endStr
      }));
      
      this.selectedDateRangeLabel.set(
        `${range.start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${range.end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
      );
      
      this.loadMatches(true);
    }
  }

  loadMatches(force: boolean = false) {
    this.matchService.getMatches(this.filters(), force).subscribe();
  }

  onFilterChange() {
    this.loadMatches(true);
  }

  getRelativeTime(date: string) {
    const now = new Date();
    const matchDate = new Date(date);
    const diff = matchDate.getTime() - now.getTime();
    
    if (diff < 0) return 'Finished';
    if (diff < 3600000) return 'Starts soon';
    
    return matchDate.toLocaleDateString(undefined, { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
}
