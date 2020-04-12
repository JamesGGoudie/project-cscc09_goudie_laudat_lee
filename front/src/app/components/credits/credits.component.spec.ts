import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditsComponent } from './credits.component';
import { CreditsModule } from './credits.module';

describe('CreditsComponent', () => {
  let component: CreditsComponent;
  let fixture: ComponentFixture<CreditsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CreditsModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
