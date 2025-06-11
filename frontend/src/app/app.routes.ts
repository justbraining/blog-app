import { Routes } from '@angular/router';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AdminPanelComponent } from './pages/admin-panel/admin-panel.component';
import { authGuard } from './guards/auth.guard';
import { BlogDetailComponent } from './blog-detail/blog-detail.component';
import { UserProfileComponentComponent } from './user-profile-component/user-profile-component.component';



export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '', component: MainPageComponent },
    { path: 'main', component: MainPageComponent, canActivate: [authGuard] },
    { path: 'admin', component: AdminPanelComponent, canActivate: [authGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'blog/:id', component: BlogDetailComponent },
    { path: 'profile', component: UserProfileComponentComponent },


];
