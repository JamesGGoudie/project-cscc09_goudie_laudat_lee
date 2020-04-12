import { NgModule } from '@angular/core';

import { ErrorDialogModule } from 'src/app/components/dialogs';

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
    SharedModule,

    ErrorDialogModule
  ]
})
export class WorkspaceControlModule {}
