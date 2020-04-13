import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/components/shared.module';

import { EditorComponent } from './editor.component';

import { ColorSketchModule } from 'ngx-color/sketch';

@NgModule({
  declarations: [
    EditorComponent
  ],
  exports: [
    EditorComponent
  ],
  imports: [
    SharedModule,
    ColorSketchModule
  ]
})
export class EditorModule {}
