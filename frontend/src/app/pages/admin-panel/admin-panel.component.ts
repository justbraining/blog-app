import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {
  blogForm!: FormGroup;
  blogs: any[] = [];
  subscriptions: any[] = [];
  selectedImage!: File;
  selectedVideo!: File;
  imagePreview: string | null = null;
  videoPreview: string | null = null;
  editingId: string | null = null;
  currentView: 'add' | 'list' | 'subscriptions' = 'add';

  user = { username: '', email: '', photo: '' };
  showDropdown = false;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.blogForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required]
    });

    this.loadBlogs();
    this.loadSubscriptions();
    this.loadUserFromToken();
  }

  switchView(view: 'add' | 'list' | 'subscriptions') {
    this.currentView = view;
  }

  onImageSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedImage = event.target.files[0];
      this.imagePreview = URL.createObjectURL(this.selectedImage);
    }
  }

  onVideoSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedVideo = event.target.files[0];
      this.videoPreview = URL.createObjectURL(this.selectedVideo);
    }
  }

  submitBlog() {
    const formData = new FormData();
    formData.append('title', this.blogForm.value.title);
    formData.append('content', this.blogForm.value.content);
    if (this.selectedImage) formData.append('coverImage', this.selectedImage);
    if (this.selectedVideo) formData.append('video', this.selectedVideo);

    const request = this.editingId
      ? this.http.put(`http://localhost:3000/api/blogs/${this.editingId}`, formData)
      : this.http.post('http://localhost:3000/api/blogs', formData);

    request.subscribe(() => {
      this.resetForm();
      this.loadBlogs();
      this.switchView('list');
    });
  }

  resetForm() {
    this.blogForm.reset();
    this.selectedImage = null as any;
    this.selectedVideo = null as any;
    this.imagePreview = null;
    this.videoPreview = null;
    this.editingId = null;
  }

  loadBlogs() {
    this.http.get<any[]>('http://localhost:3000/api/blogs').subscribe(res => this.blogs = res);
  }

  loadSubscriptions() {
    this.http.get<any[]>('http://localhost:3000/api/subscriptions').subscribe(res => this.subscriptions = res);
  }

  editBlog(blog: any) {
    this.blogForm.patchValue({ title: blog.title, content: blog.content });
    this.editingId = blog._id;
    this.switchView('add');
    this.imagePreview = blog.coverImage ? `http://localhost:3000/${blog.coverImage}` : null;
    this.videoPreview = blog.video ? `http://localhost:3000/${blog.video}` : null;
  }

  deleteBlog(id: string) {
    this.http.delete(`http://localhost:3000/api/blogs/${id}`).subscribe(() => this.loadBlogs());
  }

  cancelEdit() {
    this.resetForm();
  }

  deleteSubscription(id: string) {
    this.http.delete(`http://localhost:3000/api/subscriptions/${id}`).subscribe(() => this.loadSubscriptions());
  }

  loadUserFromToken() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const payload = JSON.parse(atob(token.split('.')[1]));
    this.user.username = payload.username;
    this.user.email = payload.email;
    const profileImage = localStorage.getItem('profileImage');
this.user.photo = profileImage ? `http://localhost:3000/${profileImage}` : 'assets/default-user.png';

  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  openUpdateDialog() {
    alert('Future enhancement: Open dialog to update username/email!');
  }
  
}
