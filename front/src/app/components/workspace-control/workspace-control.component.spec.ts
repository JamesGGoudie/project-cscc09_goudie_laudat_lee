import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { WorkspaceControlComponent } from './workspace-control.component';
import { WorkspaceControlModule } from './workspace-control.module';

describe('WorkspaceControlComponent', () => {
  let component: WorkspaceControlComponent;
  let fixture: ComponentFixture<WorkspaceControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkspaceControlComponent ],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,

        NoopAnimationsModule,

        WorkspaceControlModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkspaceControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
