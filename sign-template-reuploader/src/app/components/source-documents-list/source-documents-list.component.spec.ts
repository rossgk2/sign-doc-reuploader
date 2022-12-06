import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SourceDocumentsListComponent } from './source-documents-list.component';

describe('SourceDocumentsListComponent', () => {
  let component: SourceDocumentsListComponent;
  let fixture: ComponentFixture<SourceDocumentsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SourceDocumentsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SourceDocumentsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
