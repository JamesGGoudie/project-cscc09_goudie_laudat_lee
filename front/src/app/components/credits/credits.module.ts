import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/components/shared.module';

import { CreditsComponent } from './credits.component';

@NgModule({
  declarations: [
    CreditsComponent
  ],
  exports: [
    CreditsComponent
  ],
  imports: [
    SharedModule
  ]
})
export class CreditsModule {}
