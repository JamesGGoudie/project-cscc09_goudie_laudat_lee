import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/components/shared.module';

import { ErrorDialogComponent } from './error-dialog.component';

@NgModule({
  declarations: [
    ErrorDialogComponent
  ],
  entryComponents: [
    ErrorDialogComponent
  ],
  exports: [
    ErrorDialogComponent
  ],
  imports: [
    SharedModule
  ]
})
export class ErrorDialogModule {}
