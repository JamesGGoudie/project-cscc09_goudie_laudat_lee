import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ErrorDialogData } from 'src/app/interfaces';

@Component({
  selector: 'app-error-dialog',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.scss']
})
export class ErrorDialogComponent {

  public constructor(
    @Inject(MAT_DIALOG_DATA) private readonly data: ErrorDialogData
  ) {}

  public getErrors(): string[] {
    return this.data.errors;
  }

}
