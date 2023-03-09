import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MigrationConsoleComponent } from './migration-console.component';

describe('MigrationConsoleComponent', () => {
  let component: MigrationConsoleComponent;
  let fixture: ComponentFixture<MigrationConsoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MigrationConsoleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MigrationConsoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
