import { assert, describe, expect, test, beforeEach } from 'vitest';
import { BaseFilterCommand } from './BaseFilterCommand';
import { MockFilterCommand } from '../../../../tests/tests-utilities/architecture/mock-commands/MockFilterCommand';
import { createRenderTargetMock } from '../../../../tests/tests-utilities/fixtures/renderTarget';
import { isOdd } from '../utilities/extensions/mathUtils';

describe(BaseFilterCommand.name, () => {
  let command: MockFilterCommand;

  beforeEach(() => {
    command = new MockFilterCommand();
    command.attach(createRenderTargetMock());
  });

  test('should have icon', () => {
    expect(command.icon).toBe('Filter');
  });

  describe('when not initialized', () => {
    test('should not have children', () => {
      expect(command.children).toBeUndefined();
      expect(command.hasChildren).toBe(false);
      expect(command.isAllChecked).toBe(false);
      expect(command.isSomeChecked).toBe(false);
      expect(command.toggleAllChecked()).toBe(false);
      expect(command.getSelectedLabel()).toBe('None');
    });
  });

  describe('when initialized', () => {
    beforeEach(() => {
      command.initializeChildrenIfNeeded();
    });

    test('should have children', () => {
      assert(command.children !== undefined);
      expect(command.children.length).toBeGreaterThan(2);
      expect(command.hasChildren).toBe(true);
    });

    test('should have none checked', () => {
      assert(command.children !== undefined);
      for (const option of command.children) {
        option.setChecked(false);
      }
      expect(command.isSomeChecked).toBe(false);
      expect(command.isAllChecked).toBe(false);
      expect(command.getSelectedLabel()).toBe('None');
    });

    test('should have some checked', () => {
      assert(command.children !== undefined);
      let childIndex = 0;
      for (const option of command.children) {
        option.setChecked(isOdd(childIndex));
        childIndex++;
      }
      expect(command.isSomeChecked).toBe(true);
      expect(command.isAllChecked).toBe(false);
      expect(command.getSelectedLabel()).toBe('7 Selected');
    });

    test('should have all checked', () => {
      assert(command.children !== undefined);
      for (const option of command.children) {
        option.setChecked(true);
      }
      expect(command.isSomeChecked).toBe(true);
      expect(command.isAllChecked).toBe(true);
      expect(command.getSelectedLabel()).toBe('All');
    });

    test('should toggle all checked', () => {
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

    test('should have label and color at most options', () => {
      assert(command.children !== undefined);
      let childIndex = 0;
      for (const option of command.children) {
        expect(option.label).not.toBe('');
        if (childIndex < command.children.length - 1) {
          expect(option.color).toBeDefined();
        }
        childIndex++;
      }
    });
    test('should be checked after invoke', () => {
      assert(command.children !== undefined);
      for (const option of command.children) {
        option.setChecked(false); // To be sure that is in not checked fore invoke
        expect(option.isChecked).toBe(false);
        option.invoke();
        expect(option.isChecked).toBe(true);
      }
    });
  });
});
