import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import flatpickr from 'flatpickr';
import { Instance } from 'flatpickr/dist/types/instance';

@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="date-picker-wrapper" #container>
      <button class="btn-date-range" #pickerTrigger>
        <i class="material-icons">calendar_today</i>
        <span>{{ label || 'Select Date Range' }}</span>
        <i class="material-icons">expand_more</i>
      </button>
    </div>
  `,
  styles: [`
    .date-picker-wrapper {
      position: relative;
    }
    .btn-date-range {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1rem;
      background: var(--bg, #e9ecef);
      border: none;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text, #495057);
      cursor: pointer;
      transition: all 0.2s;

      &:hover { background: var(--bg-hover, #dee2e6); }
      i { font-size: 1.1rem; }
    }

    :host-context([data-theme='dark']) {
      .btn-date-range {
        --bg: #1a1a1a;
        --bg-hover: #222;
        --text: #ffffff;
      }
    }
  `]
})
export class DateRangePickerComponent implements OnInit, OnDestroy {
  @ViewChild('pickerTrigger', { static: true }) pickerTrigger!: ElementRef;
  
  @Input() label: string = '';
  @Input() maxDate: Date | string = 'today';
  @Input() mode: 'range' | 'single' = 'range';
  
  @Output() dateChange = new EventEmitter<{ start: Date | null, end: Date | null }>();

  private fpInstance?: Instance;

  ngOnInit() {
    this.fpInstance = flatpickr(this.pickerTrigger.nativeElement, {
      mode: this.mode,
      maxDate: this.maxDate,
      dateFormat: 'Y-m-d',
      onClose: (selectedDates) => {
        if (selectedDates.length === 2) {
          this.dateChange.emit({
            start: selectedDates[0],
            end: selectedDates[1]
          });
        } else if (this.mode === 'single' && selectedDates.length === 1) {
          this.dateChange.emit({
            start: selectedDates[0],
            end: null
          });
        }
      },
      // Theme handling
      onOpen: () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const calendar = document.querySelector('.flatpickr-calendar');
        if (calendar) {
          if (isDark) calendar.classList.add('dark');
          else calendar.classList.remove('dark');
        }
      }
    });
  }

  ngOnDestroy() {
    this.fpInstance?.destroy();
  }
}
