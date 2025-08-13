import { BaseInputCommand } from '../../../architecture/base/commands/BaseInputCommand';
import { beforeEach, describe, expect, test } from 'vitest';
import {
  clearInstalledReactElements,
  createReactElement,
  installReactElement
} from './ReactElementFactory';
import { CustomBaseInputCommand } from '../../../architecture/base/commands/CustomBaseInputCommand';
import { DividerCommand } from '../../../architecture/base/commands/DividerCommand';
import { installReactElements } from './installReactElements';
import { MockActionCommand } from '../../../../tests/tests-utilities/architecture/mock-commands/MockActionCommand';
import { MockEnumOptionCommand } from '../../../../tests/tests-utilities/architecture/mock-commands/MockEnumOptionCommand';
import { MockFilterCommand } from '../../../../tests/tests-utilities/architecture/mock-commands/MockFilterCommand';
import { MockSettingsCommand } from '../../../../tests/tests-utilities/architecture/mock-commands/MockSettingsCommand';
import { OptionType } from '../../../architecture/base/commands/BaseOptionCommand';
import { SectionCommand } from '../../../architecture/base/commands/SectionCommand';
import { type TranslationInput, type BaseCommand } from '../../../architecture';
import { createDivider } from '../DividerCreator';

const DEFAULT_PLACEMENT = 'left'; // Example placement, adjust as needed

describe('ReactElementFactory', () => {
  beforeEach(() => {
    clearInstalledReactElements();
  });

  test('should not create React element when no React element is installed', () => {
    for (const command of getCommands()) {
      expect(() => {
        createReactElement(command, DEFAULT_PLACEMENT);
      }).toThrow();
    }
  });

  test('should not create React element when the matching React element is not installed', () => {
    installReactElement(createDivider);

    expect(createReactElement(new DividerCommand(), DEFAULT_PLACEMENT)).toBeDefined();

    expect(() => {
      createReactElement(new MockActionCommand(), DEFAULT_PLACEMENT);
    }).toThrow();
  });

  test('should create React element when all React elements is installed', () => {
    installReactElements();
    for (const command of getCommands()) {
      expect(createReactElement(command, DEFAULT_PLACEMENT)).toBeDefined();
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
