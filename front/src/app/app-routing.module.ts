import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {
  EditorComponent,
  PageNotFoundComponent,
  WorkspaceControlComponent
} from './components';

import { FRONT_ROUTES } from './constants';

const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: FRONT_ROUTES.WORKSPACE_CONTROL},
  {path: FRONT_ROUTES.WORKSPACE_CONTROL, component: WorkspaceControlComponent},
  {path: FRONT_ROUTES.EDITOR, component: EditorComponent},
  {path: '**', component: PageNotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
