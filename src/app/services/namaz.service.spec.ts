import { TestBed } from '@angular/core/testing';

import { NamazService } from './namaz.service';

describe('NamazService', () => {
  let service: NamazService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NamazService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
