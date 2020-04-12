import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { FRONT_ROUTES } from 'src/app/constants';

import {
  CreateWorkspaceForm,
  CreateWorkspaceRes,
  JoinWorkspaceForm,
  JoinWorkspaceRes,
} from 'src/app/interfaces';

import {
  WorkspaceControlService,
  WorkspaceStateService
} from 'src/app/services';

import { SignUpForm } from 'src/app/interfaces/forms/sign-up-form';
import { SignUpRes } from 'src/app/interfaces/responses/sign-up-response';
import { SignInForm } from 'src/app/interfaces/forms/sign-in-form';
import { SignInRes } from 'src/app/interfaces/responses/sign-in-response';
import { SignOutRes } from 'src/app/interfaces/responses/sign-out-response';
import { SignOutForm } from 'src/app/interfaces/forms/sign-out-form';
import { GetContactForm } from 'src/app/interfaces/forms/get-contact-form';
import { GetContactRes } from 'src/app/interfaces/responses/get-contact-response';
import { MatDialog} from '@angular/material/dialog';
import { ContactDialogComponent } from '../contact-dialog/contact-dialog.component';


@Component({
  selector: 'app-workspace-control',
  templateUrl: './workspace-control.component.html',
  styleUrls: ['./workspace-control.component.scss']
})
export class WorkspaceControlComponent {
  emailAddress = '';

  public constructor(
    private readonly router: Router,
    private readonly workspaceControlService: WorkspaceControlService,
    private readonly workspaceStateService: WorkspaceStateService,
    public dialog: MatDialog,
  ){}

  openDialog(): void {
    const dialogRef = this.dialog.open(ContactDialogComponent, {
      data: {email: this.emailAddress}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

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

  public readonly signUp: FormGroup = new FormGroup({
    emailAddress: new FormControl(),
    username: new FormControl(),
    password: new FormControl(),
    workspaceId: new FormControl()
  });

  public readonly signIn: FormGroup = new FormGroup({
    username: new FormControl(),
    password: new FormControl() 
  });

  public readonly signOut: FormGroup = new FormGroup({
    username: new FormControl(),
    password: new FormControl()
  });

  public readonly getContact: FormGroup = new FormGroup({
    username: new FormControl()
  });



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


  public onSignUpSubmit(form: SignUpForm): void {
    this.workspaceControlService.signUp(form).subscribe(
        (res: SignUpRes): void => {
      if (res.data.signUp) {
      }
    });
  }

  public onSignInSubmit(form: SignInForm): void {
    this.workspaceControlService.signIn(form).subscribe(
      (res: SignInRes): void => {
    if (res.data.signIn) {
    }
  });
  }

  public onSignOutSubmit(form: SignOutForm): void {
    this.workspaceControlService.signOut(form).subscribe(
      (res: SignOutRes): void => {
    if (res.data.signOut) {
    }
  });
  }

  public getContactSubmit(form: GetContactForm): void {
    this.workspaceControlService.getContact(form).subscribe(
      (res: GetContactRes): void => {
    if (res.data.getContact != '') {
      this.emailAddress = res.data.getContact;
      //alert(res.data.getContact);
    }
  });
  }

}
