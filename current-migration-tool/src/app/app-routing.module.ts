import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MigrationConsoleComponent} from './components/migration-console/migration-console.component';
import {LoginComponent} from './components/login/login.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'migration-console', component: MigrationConsoleComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
