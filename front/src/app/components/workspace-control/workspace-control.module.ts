import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/components/shared.module';

import { WorkspaceControlComponent } from './workspace-control.component';

@NgModule({
  declarations: [
    WorkspaceControlComponent
  ],
  exports: [
    WorkspaceControlComponent
  ],
  imports: [
    SharedModule
  ]
})
export class WorkspaceControlModule { }
