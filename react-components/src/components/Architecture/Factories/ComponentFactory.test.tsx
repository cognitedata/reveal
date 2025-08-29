import { BaseInputCommand } from '../../../architecture/base/commands/BaseInputCommand';
import { describe, expect, test } from 'vitest';
import { ComponentFactory } from './ComponentFactory';
import { CustomBaseInputCommand } from '../../../architecture/base/commands/CustomBaseInputCommand';
import { DividerCommand } from '../../../architecture/base/commands/DividerCommand';
import { createComponentFactory } from './createComponentFactory';
import { MockActionCommand } from '../../../../tests/tests-utilities/architecture/mock-commands/MockActionCommand';
import { MockEnumOptionCommand } from '../../../../tests/tests-utilities/architecture/mock-commands/MockEnumOptionCommand';
import { MockFilterCommand } from '../../../../tests/tests-utilities/architecture/mock-commands/MockFilterCommand';
import { MockSettingsCommand } from '../../../../tests/tests-utilities/architecture/mock-commands/MockSettingsCommand';
import { OptionType } from '../../../architecture/base/commands/BaseOptionCommand';
import { SectionCommand } from '../../../architecture/base/commands/SectionCommand';
import { type TranslationInput, type BaseCommand } from '../../../architecture';
import { createDivider } from '../DividerCreator';

const DEFAULT_PLACEMENT = 'left'; // Example placement, adjust as needed

describe(ComponentFactory.name, () => {
  test('should not create React element when no React element is installed', () => {
    const factory = new ComponentFactory();
    for (const command of getCommands()) {
      expect(() => {
        factory.createElement(command, DEFAULT_PLACEMENT);
      }).toThrow();
    }
  });

  test('should not create React element when the matching React element is not installed', () => {
    const factory = new ComponentFactory();
    factory.installElement(createDivider);

    expect(factory.createElement(new DividerCommand(), DEFAULT_PLACEMENT)).toBeDefined();

    expect(() => {
      factory.createElement(new MockActionCommand(), DEFAULT_PLACEMENT);
    }).toThrow();
  });

  test('should create React element when all React elements is installed', () => {
    const factory = createComponentFactory();
    for (const command of getCommands()) {
      expect(factory.createElement(command, DEFAULT_PLACEMENT)).toBeDefined();
    }
  });
});

function* getCommands(): Generator<BaseCommand> {
  yield new DividerCommand();
  yield new MockEnumOptionCommand(OptionType.Dropdown);
  yield new MockEnumOptionCommand(OptionType.Segmented);
  yield new MockFilterCommand();
  yield new MockSettingsCommand();
  yield new MockActionCommand();
  yield new SectionCommand();
  yield new MockCustomInputCommand();
  yield new MockInputCommand();
}

class MockCustomInputCommand extends CustomBaseInputCommand {
  public override getPostButtonLabel(): TranslationInput | undefined {
    return undefined;
  }

  public override getPlaceholderByIndex(_index: number): TranslationInput | undefined {
    return undefined;
  }

  public override getAllPlaceholders(): TranslationInput[] | undefined {
    return undefined;
  }
}

class MockInputCommand extends BaseInputCommand {
  public override getPostButtonLabel(): TranslationInput | undefined {
    return undefined;
  }

  public override getPlaceholder(): TranslationInput | undefined {
    return undefined;
  }
}
