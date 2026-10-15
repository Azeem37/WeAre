import { TestBed } from '@angular/core/testing';

import { DummyResolverService } from './dummy-resolver.service';

describe('DummyResolverService', () => {
  let service: DummyResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DummyResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
