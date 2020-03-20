import { Component, NgZone } from '@angular/core';
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
  RtcService,
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
    private readonly zone: NgZone,
    private readonly router: Router,
    private readonly rtc: RtcService,
    private readonly workspaceControlService: WorkspaceControlService,
    private readonly state: WorkspaceStateService
  ) {}

  public onCreateSubmit(form: CreateWorkspaceForm): void {
    this.workspaceControlService.createWorkspace(form).subscribe(
        (res: CreateWorkspaceRes): void => {
      if (res.data.createWorkspace) {
        this.rtc.createPeer(`${form.workspaceId}-${form.userId}`).subscribe(() => {
          this.setupWorkspace(form.workspaceId, form.userId, false);
        });
      }
    });
  }

  public onJoinSubmit(form: JoinWorkspaceForm): void {
    this.workspaceControlService.joinWorkspace(form).subscribe(
        (res: JoinWorkspaceRes): void => {
      if (res.data.joinWorkspace) {
        this.rtc.createPeer(`${form.workspaceId}-${form.userId}`).subscribe(() => {
          this.rtc.connectToPeers(res.data.joinWorkspace).subscribe(() => {
            this.zone.run(() => {
              this.setupWorkspace(form.workspaceId, form.userId, true);
            });
          });
        });
      }
    });
  }

  private setupWorkspace(
    workspaceId: string,
    userId: string,
    joined: boolean
  ): void {
    this.state.setJoinedWorkspace(joined);
    this.state.setWorkspaceId(workspaceId);
    this.state.setUserId(userId);

    this.router.navigate([FRONT_ROUTES.EDITOR]);
  }

}
