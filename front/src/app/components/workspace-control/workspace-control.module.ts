import { NgModule } from '@angular/core';
import {MatDialogModule} from '@angular/material/dialog'
import { SharedModule } from 'src/app/components/shared.module';

import { WorkspaceControlComponent } from './workspace-control.component';
import { ContactDialogComponent } from '../contact-dialog/contact-dialog.component';

@NgModule({
  declarations: [
    WorkspaceControlComponent
  ],
  exports: [
    WorkspaceControlComponent
  ],
  imports: [
    SharedModule,
    MatDialogModule
  ],
  entryComponents: [
    ContactDialogComponent
  ]

})
export class WorkspaceControlModule { }
