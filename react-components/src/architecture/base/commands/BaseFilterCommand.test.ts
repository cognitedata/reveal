import { assert, describe, expect, test, beforeEach } from 'vitest';
import { BaseFilterCommand } from './BaseFilterCommand';
import { MockFilterCommand } from '../../../../tests/tests-utilities/architecture/mock-commands/MockFilterCommand';
import { createRenderTargetMock } from '../../../../tests/tests-utilities/fixtures/renderTarget';
import { isOdd } from '../utilities/extensions/mathExtensions';
import { translate } from '../utilities/translateUtils';

describe(BaseFilterCommand.name, () => {
  let command: MockFilterCommand;

  beforeEach(() => {
    command = new MockFilterCommand();
    command.attach(createRenderTargetMock());
  });

  test('should have icon', async () => {
    expect(command.icon).toBe('Filter');
  });

  test('should not have children when not initialized', async () => {
    expect(command.children).toBeUndefined();
    expect(command.hasChildren).toBe(false);
    expect(command.isAllChecked).toBe(false);
    expect(command.isSomeChecked).toBe(false);
    expect(command.toggleAllChecked()).toBe(false);
    expect(command.getSelectedLabel(translate)).toBe('None');
  });

  test('should have children when initialized', async () => {
    command.initializeChildrenIfNeeded();
    assert(command.children !== undefined);
    expect(command.children.length).toBeGreaterThan(2);
    expect(command.hasChildren).toBe(true);
  });

  test('should not have any checked', async () => {
    command.initializeChildrenIfNeeded();
    assert(command.children !== undefined);
    for (const option of command.children) {
      option.setChecked(false);
    }
    expect(command.isSomeChecked).toBe(false);
    expect(command.isAllChecked).toBe(false);
    expect(command.getSelectedLabel(translate)).toBe('None');
  });

  test('should have some checked', async () => {
    command.initializeChildrenIfNeeded();
    assert(command.children !== undefined);
    let childIndex = 0;
    for (const option of command.children) {
      option.setChecked(isOdd(childIndex));
      childIndex++;
    }
    expect(command.isSomeChecked).toBe(true);
    expect(command.isAllChecked).toBe(false);
    expect(command.getSelectedLabel(translate)).toBe('7 Selected');
  });

  test('should have all checked', async () => {
    command.initializeChildrenIfNeeded();
    assert(command.children !== undefined);
    for (const option of command.children) {
      option.setChecked(true);
    }
    expect(command.isSomeChecked).toBe(true);
    expect(command.isAllChecked).toBe(true);
    expect(command.getSelectedLabel(translate)).toBe('All');
  });

  test('should toggle all checked', async () => {
    command.initializeChildrenIfNeeded();
    assert(command.children !== undefined);
    for (const option of command.children) {
      option.setChecked(false);
    }
    expect(command.toggleAllChecked()).toBe(true);
    expect(command.isAllChecked).toBe(true);
    expect(command.toggleAllChecked()).toBe(true);
    expect(command.isSomeChecked).toBe(false);
    expect(command.toggleAllChecked()).toBe(true);
    expect(command.isAllChecked).toBe(true);
  });

  test('should have label and color at most options', async () => {
    command.initializeChildrenIfNeeded();
    assert(command.children !== undefined);
    let childIndex = 0;
    for (const option of command.children) {
      expect(option.getLabel(translate)).not.toBe('');
      if (childIndex < command.children.length - 1) {
        expect(option.color).toBeDefined();
      }
      childIndex++;
    }
  });
  test('should checked when invoke', async () => {
    command.initializeChildrenIfNeeded();
    assert(command.children !== undefined);
    for (const option of command.children) {
      option.setChecked(false);
      expect(option.isChecked).toBe(false);
      option.invoke();
    }
  });
});
