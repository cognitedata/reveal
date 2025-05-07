/*!
 * Copyright 2025 Cognite AS
 */

import { describe, expect, test } from 'vitest';
import { ClipFolder } from './ClipFolder';
import { isEmpty } from '../../base/utilities/TranslateInput';

describe(ClipFolder.name, () => {
  test('Should have typename', () => {
    const domainObject = new ClipFolder();
    expect(isEmpty(domainObject.typeName)).toBe(false);
  });
});
