import { Component, OnInit } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Inject } from '@angular/core';



@Component({
  selector: 'app-contact-dialog',
  templateUrl: './contact-dialog.component.html',
  styleUrls: ['./contact-dialog.component.scss']
})
export class ContactDialogComponent implements OnInit {
  contactInfo: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { 
    this.contactInfo = data;
  }

  ngOnInit(): void {
  }

}
