import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

import { FRONT_ROUTES } from 'src/app/constants';

import {
  CreateWorkspaceForm,
  CreateWorkspaceResponse,
  JoinWorkspaceForm,
  JoinWorkspaceResponse
} from 'src/app/interfaces';

import { WorkspaceControlService } from 'src/app/services';

@Component({
  selector: 'app-workspace-control',
  templateUrl: './workspace-control.component.html',
  styleUrls: ['./workspace-control.component.scss']
})
export class WorkspaceControlComponent {

  public readonly createForm: FormGroup = new FormGroup({
    workspaceId: new FormControl(),
    workspacePassword: new FormControl(),
    username: new FormControl()
  });
  public readonly joinForm: FormGroup = new FormGroup({
    workspaceId: new FormControl(),
    workspacePassword: new FormControl(),
    username: new FormControl()
  });

  public constructor(
    private readonly router: Router,
    private readonly workspaceControlService: WorkspaceControlService
  ) {}

  public onCreateSubmit(form: CreateWorkspaceForm): void {
    this.workspaceControlService.createWorkspace(form).subscribe(
        (res: CreateWorkspaceResponse) => {
      this.router.navigate([FRONT_ROUTES.EDITOR]);
    });
  }

  public onJoinSubmit(form: JoinWorkspaceForm): void {
    this.workspaceControlService.joinWorkspace(form).subscribe(
        (res: JoinWorkspaceResponse) => {
      this.router.navigate([FRONT_ROUTES.EDITOR]);
    });
  }

}
