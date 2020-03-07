import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkspaceControlComponent } from './components';
import { FIXED_ROUTES } from './constants';

const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: FIXED_ROUTES.WORKSPACE_CONTROL},
  {path: FIXED_ROUTES.WORKSPACE_CONTROL, component: WorkspaceControlComponent},
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
