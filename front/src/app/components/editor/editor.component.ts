import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  ViewChild
} from '@angular/core';

// import { FormControl, FormGroup } from '@angular/forms';

import { Editor } from '../../../assets/js/Editor';


@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements AfterViewInit {
  private readonly editor: Editor;

  public constructor() {
    this.editor = new Editor();
  }

  public ngAfterViewInit(): void {
    this.editor.addNewObject('box');
  }

}
