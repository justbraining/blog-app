import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username: string = '';
  password: string = '';
  confirmPassword: string = '';  // Add this line to define confirmPassword
  error: string = '';
  success: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  // Method that handles form submission
  onSubmit() {
    this.register(); // Call the register method when form is submitted
  }

  register() {
    if (!this.username || !this.password || !this.confirmPassword) {
      this.error = 'All fields are required';
      return;
    }

    const isValidPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(this.password);
    if (!isValidPassword) {
      this.error = 'Password must be 8+ characters, with uppercase, lowercase, number, and special character';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    this.http.post('http://localhost:3000/api/auth/register', {
      username: this.username,
      password: this.password
    }).subscribe({
      next: () => {
        this.success = 'Registered successfully. You can now login.';
        this.error = '';
      },
      error: (err) => {
        this.error = err.error?.msg || 'Registration failed';
        this.success = '';
      }
    });
  }
}
