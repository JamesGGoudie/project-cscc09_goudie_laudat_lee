import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

import { FRONT_ROUTES } from 'src/app/constants';

import {
  CreateWorkspaceForm,
  CreateWorkspaceRes,
  JoinWorkspaceForm,
  JoinWorkspaceRes
} from 'src/app/interfaces';

import {
  WorkspaceControlService,
  WorkspaceStateService
} from 'src/app/services';

@Component({
  selector: 'app-workspace-control',
  templateUrl: './workspace-control.component.html',
  styleUrls: ['./workspace-control.component.scss']
})
export class WorkspaceControlComponent {

  public readonly createForm: FormGroup = new FormGroup({
    workspaceId: new FormControl(),
    workspacePassword: new FormControl(),
    userId: new FormControl()
  });
  public readonly joinForm: FormGroup = new FormGroup({
    workspaceId: new FormControl(),
    workspacePassword: new FormControl(),
    userId: new FormControl()
  });

  public constructor(
    private readonly router: Router,
    private readonly workspaceControlService: WorkspaceControlService,
    private readonly workspaceStateService: WorkspaceStateService
  ) {}

  public onCreateSubmit(form: CreateWorkspaceForm): void {
    this.workspaceControlService.createWorkspace(form).subscribe(
        (res: CreateWorkspaceRes): void => {
      if (res.data.createWorkspace) {
        this.setupWorkspace(form.workspaceId, form.userId);
      }
    });
  }

  public onJoinSubmit(form: JoinWorkspaceForm): void {
    this.workspaceControlService.joinWorkspace(form).subscribe(
        (res: JoinWorkspaceRes): void => {
      if (res.data.joinWorkspace) {
        this.setupWorkspace(form.workspaceId, form.userId);
      }
    });
  }

  private setupWorkspace(workspaceId: string, userId: string): void {
    this.workspaceStateService.setWorkspaceId(workspaceId);
    this.workspaceStateService.setUserId(userId);

    this.router.navigate([FRONT_ROUTES.EDITOR]);
  }

}
