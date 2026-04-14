import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EventListDto } from '../../models/models';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-card.html',
  styleUrl: './event-card.css'
})
export class EventCard {
  @Input() event!: EventListDto;

  constructor(private router: Router) {}

  goToDetail(): void {
    if (this.event?.id) {
      this.router.navigate(['/event', this.event.id]);
    }
  }

  formatPrice(price: number): string {
    return price === 0 ? 'Ücretsiz' : `₺${price}`;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString('tr-TR', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
