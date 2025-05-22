import { assert, beforeEach, describe, expect, test } from 'vitest';
import { DeleteDomainObjectCommand } from './DeleteDomainObjectCommand';
import { FolderDomainObject } from '../domainObjects/FolderDomainObject';
import { isEmpty } from '../utilities/TranslateInput';
import { UndoCommand } from './UndoCommand';
import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';
import { createFullRenderTargetMock } from '../../../../tests/tests-utilities/fixtures/createFullRenderTargetMock';
import { ExampleDomainObject } from '../../concrete/example/ExampleDomainObject';

describe(DeleteDomainObjectCommand.name, () => {
  let renderTarget: RevealRenderTarget;
  let undoCommand: UndoCommand;

  beforeEach(() => {
    renderTarget = createFullRenderTargetMock();
    undoCommand = new UndoCommand();
    undoCommand.attach(renderTarget);
  });

  test('should have following default behavior', async () => {
    expect(isEmpty(undoCommand.tooltip)).toBe(false);
    expect(undoCommand.icon).toBe('Restore');
    expect(undoCommand.isEnabled).toBe(false);
    const keys = undoCommand.getShortCutKeys();
    expect(keys).toHaveLength(2);
    assert(keys !== undefined);
    expect(keys[0]).toBeOneOf(['Ctrl', 'Cmd']);
    expect(keys[1]).toBe('Z');
  });

  test('should remove domain object', async () => {
    const folder = new FolderDomainObject();
    renderTarget.rootDomainObject.addChild(folder);
    expect(undoCommand.isEnabled).toBe(false);

    // Add two domain objects to the folder
    const domainObjectToUndo1 = new ExampleDomainObject();
    const domainObjectToUndo2 = new ExampleDomainObject();
    folder.addChild(domainObjectToUndo1);
    folder.addChild(domainObjectToUndo2);
    expect(folder.childCount).toBe(2);

    // Delete the domain object 1
    const deleteCommand1 = new DeleteDomainObjectCommand(domainObjectToUndo1);
    deleteCommand1.attach(renderTarget);
    expect(deleteCommand1.invoke()).toBe(true);
    expect(folder.childCount).toBe(1); // Check that the domain object is removed

    // Delete the domain object 2
    const deleteCommand2 = new DeleteDomainObjectCommand(domainObjectToUndo2);
    deleteCommand2.attach(renderTarget);
    expect(deleteCommand2.invoke()).toBe(true);
    expect(folder.childCount).toBe(0); // Check that the domain object is removed

    // Undo (note that both action are undone since the timeframe is so short)
    expect(undoCommand.isEnabled).toBe(true);
    expect(undoCommand.invoke()).toBe(true);
    expect(undoCommand.isEnabled).toBe(false);
    expect(folder.childCount).toBe(2);
  });
});
