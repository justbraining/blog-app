import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-subscribe-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subscribe-form.component.html',
  styleUrls: ['./subscribe-form.component.css']
})
export class SubscribeFormComponent {
  email: string = '';
  message: string = '';

  constructor(private http: HttpClient) {}

  subscribe() {
    if (!this.email) {
      this.message = 'Please enter your email.';
      return;
    }

    this.http.post('http://localhost:3000/api/subscriptions', { email: this.email }).subscribe({
      next: () => {
        this.message = 'Subscribed successfully!';
        this.email = '';
      },
      error: (err) => {
        this.message = err.error?.msg || 'Error subscribing.';
      }
    });
  }
}
