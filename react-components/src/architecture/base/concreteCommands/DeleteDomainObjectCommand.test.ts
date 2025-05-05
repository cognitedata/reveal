import { describe, expect, test } from 'vitest';
import { DeleteDomainObjectCommand } from './DeleteDomainObjectCommand';
import { DomainObject } from '../domainObjects/DomainObject';
import { FolderDomainObject } from '../domainObjects/FolderDomainObject';
import { type TranslationInput } from '../utilities/TranslateInput';

describe(DeleteDomainObjectCommand.name, () => {
  test('should have following default behavior', async () => {
    const mock = new MockDomainObject();
    const command = new DeleteDomainObjectCommand(mock);
    expect(command.icon).toBe('Delete');
    expect(command.buttonType).toBe('ghost-destructive');
    expect(command.hasData).toBe(true);
  });

  test('should remove domain object', async () => {
    const folder = new FolderDomainObject();
    const mock = new MockDomainObject();
    folder.addChild(mock);
    expect(folder.childCount).toBe(1);

    const command = new DeleteDomainObjectCommand(mock);
    expect(command.isEnabled).toBe(true);
    expect(command.invoke()).toBe(true);
    expect(folder.childCount).toBe(0); // Check that the Domain object removed
  });

  test('should not remove domain object', async () => {
    const folder = new FolderDomainObject();
    const mock = new ReadOnlyMockDomainObject();
    folder.addChild(mock);
    expect(folder.childCount).toBe(1);

    const command = new DeleteDomainObjectCommand(mock);
    expect(command.isEnabled).toBe(false);
    expect(command.invoke()).toBe(false);
    expect(folder.childCount).toBe(1); // Check that the Domain object is not removed
  });
});

class MockDomainObject extends DomainObject {
  public override get typeName(): TranslationInput {
    return { untranslated: 'MockDomainObject' };
  }

  public override get canBeRemoved(): boolean {
    return true;
  }
}

class ReadOnlyMockDomainObject extends DomainObject {
  public override get typeName(): TranslationInput {
    return { untranslated: 'ReadOnlyMockDomainObject' };
  }

  public override get canBeRemoved(): boolean {
    return false;
  }
}
