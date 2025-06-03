/*!
 * Copyright 2024 Cognite AS
 */

import { describe, test, expect } from 'vitest';
import { FolderDomainObject } from './FolderDomainObject';

describe(FolderDomainObject.name, () => {
  test('should have following default values', () => {
    const domainObject = new FolderDomainObject();
    expect(domainObject.label).toBe('Folder');
    expect(domainObject.hasIconColor).toBe(false);
    expect(domainObject.hasIndexOnLabel).toBe(false);
    expect(domainObject.icon).toBe('Folder');
  });

  test('should clone', () => {
    const domainObject = new FolderDomainObject();
    expect(domainObject.clone()).instanceOf(FolderDomainObject);
    expect(domainObject.clone()).not.toBe(domainObject);
  });
});
