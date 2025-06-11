import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  error: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  // Define onSubmit to handle form submission
  onSubmit() {
    this.login();  // Call login method when form is submitted
  }

  login() {
    if (!this.username || !this.password) {
      this.error = 'All fields are required';
      return;
    }

    this.http.post<{ token: string }>('http://localhost:3000/api/auth/login', {
      username: this.username,
      password: this.password
    }).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        this.router.navigate(['/main']);
      },
      error: (err) => {
        this.error = err.error?.msg || 'Login failed';
      }
    });
  }
}
