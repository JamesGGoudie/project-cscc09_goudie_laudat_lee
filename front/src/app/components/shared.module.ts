import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';

/**
 * A module for any common elements that are commonly used across components.
 */
@NgModule({
 imports: [
   CommonModule
  ],
 exports: [
   CommonModule,

   ReactiveFormsModule,

   MatButtonModule,
   MatDialogModule,
   MatSnackBarModule,
   MatExpansionModule,
   MatFormFieldModule,
   MatInputModule,
   MatButtonToggleModule,
   MatMenuModule
  ]
})
export class SharedModule {}
