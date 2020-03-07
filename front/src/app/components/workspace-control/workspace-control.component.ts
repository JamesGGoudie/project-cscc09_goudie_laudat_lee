import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

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

  public readonly createForm: FormGroup;
  public readonly joinForm: FormGroup;

  public constructor(
    private readonly workspaceControlService: WorkspaceControlService
  ) {
    this.createForm = new FormGroup({
      workspaceId: new FormControl(),
      workspacePassword: new FormControl(),
      username: new FormControl()
    });
    this.joinForm = new FormGroup({
      workspaceId: new FormControl(),
      workspacePassword: new FormControl(),
      username: new FormControl()
    });
  }

  public onCreateSubmit(form: CreateWorkspaceForm): void {
    this.workspaceControlService.createWorkspace(form).subscribe(
        (res: CreateWorkspaceResponse) => {
      console.log(res);
    });
  }

  public onJoinSubmit(form: JoinWorkspaceForm): void {
    this.workspaceControlService.joinWorkspace(form).subscribe(
        (res: JoinWorkspaceResponse) => {
      console.log(res);
    });
  }

}
