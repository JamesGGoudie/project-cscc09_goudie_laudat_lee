import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkspaceControlComponent } from './components';
import { FRONT_ROUTES } from './constants';

const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: FRONT_ROUTES.WORKSPACE_CONTROL},
  {path: FRONT_ROUTES.WORKSPACE_CONTROL, component: WorkspaceControlComponent},
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
