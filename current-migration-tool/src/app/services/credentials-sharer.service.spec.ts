import { TestBed } from '@angular/core/testing';

import { CredentialsSharerService } from './credentials-sharer.service';

describe('CredentialsSharerService', () => {
  let service: CredentialsSharerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CredentialsSharerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
