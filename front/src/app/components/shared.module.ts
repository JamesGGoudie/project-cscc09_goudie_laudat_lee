import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ContactDialogComponent } from './contact-dialog/contact-dialog.component';

@NgModule({
 imports: [
   CommonModule
  ],
 exports: [
   CommonModule,

   ReactiveFormsModule,

   MatButtonModule,
   MatExpansionModule,
   MatFormFieldModule,
   MatInputModule
  ],
 declarations: [ContactDialogComponent]
})
export class SharedModule { }
