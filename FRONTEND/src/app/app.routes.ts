// Rutas del frontend:
// - /login como entrada pública.
// - /app/* protegido por sesión.
import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { guestGuard } from './core/guest.guard';
import { LayoutComponent } from './core/layout.component';
import { DashboardComponent } from './pages/dashboard.component';
import { AppointmentsComponent } from './pages/appointments.component';
import { LoginComponent } from './pages/login.component';
import { OwnersComponent } from './pages/owners.component';
import { PetsComponent } from './pages/pets.component';
import { RecordsComponent } from './pages/records.component';

export const routes: Routes = [
	// Redirección por defecto a login.
	{ path: '', pathMatch: 'full', redirectTo: 'login' },
	// Login visible sólo para usuarios sin sesión.
	{ path: 'login', component: LoginComponent, canActivate: [guestGuard] },
	{
		// Contenedor principal de área privada.
		path: 'app',
		component: LayoutComponent,
		canActivate: [authGuard],
		children: [
			// Pantalla inicial del área privada.
			{ path: '', pathMatch: 'full', redirectTo: 'dashboard' },
			{ path: 'dashboard', component: DashboardComponent },
			{ path: 'owners', component: OwnersComponent },
			{ path: 'pets', component: PetsComponent },
			{ path: 'appointments', component: AppointmentsComponent },
			{ path: 'records', component: RecordsComponent }
		]
	},
	// Guard-clause para URLs no reconocidas.
	{ path: '**', redirectTo: 'login' }
];
