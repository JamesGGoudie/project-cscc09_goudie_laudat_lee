import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/components/shared.module';

import { EditorComponent } from './editor.component';

@NgModule({
  declarations: [
    EditorComponent
  ],
  exports: [
    EditorComponent
  ],
  imports: [
    SharedModule
  ]
})
export class EditorModule { }
