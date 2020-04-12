import { Component, NgZone } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { ErrorDialogComponent } from 'src/app/components/dialogs';
import { FRONT_ROUTES } from 'src/app/constants';

import {
  CreateWorkspaceForm,
  CreateWorkspaceRes,
  ErrorDialogData,
  GraphQlError,
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
    private readonly dialog: MatDialog,
    private readonly router: Router,
    private readonly rtc: RtcService,
    private readonly workspaceControlService: WorkspaceControlService,
    private readonly state: WorkspaceStateService
  ) {}

  public navigateToCredits(): void {
    this.router.navigate([FRONT_ROUTES.CREDITS]);
  }

  public onCreateSubmit(form: CreateWorkspaceForm): void {
    if (!(form.userId && form.workspaceId && form.workspacePassword)) {
      this.displayErrors(['Form is Incomplete']);
    } else {
      this.workspaceControlService.createWorkspace(form).subscribe(
          (res: CreateWorkspaceRes): void => {
        if (res.errors) {
          this.displayGraphQlErrors(res.errors);
        } else {
          this.rtc.createPeer(res.data.createWorkspace.yourPeerId).subscribe(
              (): void => {
            this.setupWorkspace(form.workspaceId, form.userId, false);
          });
        }
      });
    }
  }

  public onJoinSubmit(form: JoinWorkspaceForm): void {
    if (!(form.userId && form.workspaceId && form.workspacePassword)) {
      this.displayErrors(['Form is Incomplete']);
    } else {
      this.workspaceControlService.joinWorkspace(form).subscribe(
          (res: JoinWorkspaceRes): void => {
        if (res.errors) {
          this.displayGraphQlErrors(res.errors);
        } else {
          this.rtc.createPeer(res.data.joinWorkspace.yourPeerId).subscribe(
              (): void => {
            this.rtc.connectToPeers(res.data.joinWorkspace.otherPeerIds)
                .subscribe((): void => {
              // Zone is needed due to complicated nesting.
              this.zone.run((): void => {
                this.setupWorkspace(form.workspaceId, form.userId, true);
              });
            });
          });
        }
      });
    }
  }

  /**
   * Saves all the information about the session and routes to the editor.
   *
   * @param workspaceId
   * @param userId
   * @param joined
   */
  private setupWorkspace(
    workspaceId: string,
    userId: string,
    joined: boolean
  ): void {
    this.state.setJoinedWorkspace(joined);
    this.state.setWorkspaceId(workspaceId);
    this.state.setUserId(userId);
    this.state.setInWorkspace(true);

    this.router.navigate([FRONT_ROUTES.EDITOR]);
  }

  private displayGraphQlErrors(errors: GraphQlError[]): void {
    this.displayErrors(errors.map((err: GraphQlError): string => {
      return err.message;
    }));
  }

  private displayErrors(errors: string[]): void {
    const data: ErrorDialogData = {errors}
    this.dialog.open(ErrorDialogComponent, {data});
  }

}
