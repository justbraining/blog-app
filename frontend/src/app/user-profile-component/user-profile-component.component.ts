import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-user-profile-component',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './user-profile-component.component.html',
  styleUrls: ['./user-profile-component.component.css']
})
export class UserProfileComponentComponent implements OnInit {
  profileForm!: FormGroup;
  successMsg = '';
  imagePreview: string | ArrayBuffer | null = null;
  selectedFile!: File;
  user: any;
  userId: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.minLength(8)]],
    });

    this.loadUserProfile();
  }

  // File input change handler
  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Load current user profile from backend
  loadUserProfile() {
    this.http.get<any>(`${environment.apiUrl}/auth/profile`, {
      headers: { Authorization: 'Bearer ' + this.authService.getToken() },
    }).subscribe(user => {
      // Patch username
      this.profileForm.patchValue({ username: user.username });
      // If user has a profile image, show it:
      if (user.profileImage) {
        this.imagePreview = `${environment.apiUrl}${user.profileImage}`;
      }
    }, err => {
      console.error('Error loading profile:', err);
    });
  }

  // Submit form to update profile (username, password, and image)
  onSubmit() {
    if (this.profileForm.invalid) return;

    const { username, password } = this.profileForm.value;
    const updateData = new FormData();
    updateData.append('username', username);
    if (password) {
      updateData.append('password', password);
    }
    if (this.selectedFile) {
      updateData.append('profileImage', this.selectedFile);
    }

    this.http.put<any>(`${environment.apiUrl}/auth/profile`, updateData, {
      headers: { Authorization: 'Bearer ' + this.authService.getToken() },
    }).subscribe(res => {
      this.successMsg = 'Profile updated!';
      // Save the new image path in localStorage so the header can use it
      if (res.profileImage) {
        localStorage.setItem('profileImage', res.profileImage);
      }
    }, err => {
      console.error('Error updating profile:', err);
    });
  }
}
