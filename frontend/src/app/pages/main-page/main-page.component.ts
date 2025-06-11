import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SubscribeFormComponent } from "../../subscribe-form/subscribe-form.component";

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, SubscribeFormComponent]
})
export class MainPageComponent implements OnInit {
  blogs: any[] = [];
  filteredBlogs: any[] = [];
  searchQuery: string = '';
  currentYear: number = new Date().getFullYear();

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
    } else {
      this.loadBlogs();
    }
  }

  loadBlogs() {
    this.http.get<any[]>('http://localhost:3000/api/blogs').subscribe({
      next: (res) => {
        this.blogs = res;
        this.filteredBlogs = res;
      },
      error: (err) => console.error('Error fetching blogs:', err)
    });
  }

  filterBlogs() {
    const query = this.searchQuery.toLowerCase();
    this.filteredBlogs = this.blogs.filter(blog =>
      blog.title.toLowerCase().includes(query) ||
      blog.content.toLowerCase().includes(query)
    );
  }

  clearSearch() {
    this.searchQuery = '';
    this.filterBlogs();
  }
  

  goToAdminPanel() {
    this.router.navigate(['/admin']);
  }

  /*logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.router.navigate(['/login']);
  }*/
}
