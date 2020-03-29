import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/components/shared.module';

import { PageNotFoundComponent } from './page-not-found.component';

@NgModule({
  declarations: [
    PageNotFoundComponent
  ],
  exports: [
    PageNotFoundComponent
  ],
  imports: [
    SharedModule
  ]
})
export class PageNotFoundModule { }
