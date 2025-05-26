/*!
 * Copyright 2025 Cognite AS
 */

import { describe, expect, test } from 'vitest';
import { isEmpty } from '../../base/utilities/TranslateInput';
import { Image360AnnotationFolder } from './Image360AnnotationFolder';

describe(Image360AnnotationFolder.name, () => {
  test('should be empty', () => {
    const domainObject = new Image360AnnotationFolder();
    expect(isEmpty(domainObject.typeName)).toBe(false);
  });

  test('should be cloned', () => {
    const domainObject = new Image360AnnotationFolder();
    const clone = domainObject.clone();

    expect(clone).toBeInstanceOf(Image360AnnotationFolder);
    expect(clone).not.toBe(domainObject);
  });
});
