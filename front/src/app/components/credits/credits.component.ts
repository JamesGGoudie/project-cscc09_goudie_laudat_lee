import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FRONT_ROUTES } from 'src/app/constants';

@Component({
  selector: 'app-credits',
  templateUrl: './credits.component.html',
  styleUrls: ['./credits.component.scss']
})
export class CreditsComponent {


  public constructor(
    private readonly router: Router
  ) {}

  public navigateToHome(): void {
    this.router.navigate([FRONT_ROUTES.WORKSPACE_CONTROL]);
  }

}
