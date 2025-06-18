import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  type BaseCommand,
  Changes,
  CopyToClipboardCommand,
  CycleLengthUnitsCommand,
  DeleteDomainObjectCommand,
  DomainObject,
  PanelInfo,
  Quantity,
  type TranslationInput
} from '../../architecture';
import { act, type PropsWithChildren, type ReactElement } from 'react';
import { ViewerContextProvider } from '../RevealCanvas/ViewerContext';
import { DomainObjectPanel } from './DomainObjectPanel';
import { DomainObjectPanelUpdater } from '../../architecture/base/reactUpdaters/DomainObjectPanelUpdater';
import { type IconName } from '../../architecture/base/utilities/IconName';
import { createFullRenderTargetMock } from '../../../tests/tests-utilities/fixtures/createFullRenderTargetMock';

describe(DomainObjectPanel.name, () => {
  test('should not be visible for no domain object', async () => {
    render(<DomainObjectPanel />, {});
    const buttons = screen.queryAllByRole('button');
    expect(buttons.length).toBe(0);
  });

  test('should render with correct label and icon', async () => {
    const domainObject = new MockDomainObject();
    renderDomainObjectPanel(domainObject);
    expect(screen.getByText(domainObject.label)).toBeDefined();
    expect(screen.getByLabelText('SnowIcon')).toBeDefined();
  });

  test('should render with correct number of buttons', async () => {
    const domainObject = new MockDomainObject();
    renderDomainObjectPanel(domainObject);
    const buttons = screen.getAllByRole('button');
    const expectedButtonsLength = domainObject.getPanelToolbar().length;
    expect(buttons.length).toBe(expectedButtonsLength);
  });

  test('should render with correct info text', async () => {
    const domainObject = new MockDomainObject();
    renderDomainObjectPanel(domainObject);
    for (const subString of EXPECTED_SUB_STRINGS) {
      expect(screen.getByText(subString)).toBeDefined();
    }
  });

  test('should copy info text to clipboard when clicking at the copy button', async () => {
    const domainObject = new MockDomainObject();
    renderDomainObjectPanel(domainObject);
    const buttons = screen.getAllByRole('button');
    await act(async () => {
      await userEvent.click(buttons[0]); // Copy button
    });
    const text = await navigator.clipboard.readText();
    for (const subString of EXPECTED_SUB_STRINGS) {
      expect(text).contain(subString);
    }
  });
  test('should delete domain object when clicking at the delete button', async () => {
    const domainObject = new MockDomainObject();
    renderDomainObjectPanel(domainObject);
    const beforeButtons = screen.getAllByRole('button');
    await act(async () => {
      await userEvent.click(beforeButtons[2]); // Delete button
    });
    const afterButtons = screen.queryAllByRole('button');
    expect(afterButtons.length).toBe(0);
  });

  test('should hide the panel when the domain object is not selected anymore', async () => {
    const domainObject = new MockDomainObject();
    renderDomainObjectPanel(domainObject);
    const beforeButtons = screen.getAllByRole('button');
    expect(beforeButtons.length).toBeGreaterThan(0);
    await act(async () => {
      domainObject.setSelectedInteractive(false);
    });
    const afterButtons = screen.queryAllByRole('button');
    expect(afterButtons.length).toBe(0);
  });

  test('should update when name change', async () => {
    const domainObject = new MockDomainObject();
    renderDomainObjectPanel(domainObject);
    await act(async () => {
      domainObject.name = 'New Name';
      domainObject.notify(Changes.naming);
    });
    expect(screen.getByText('New Name')).toBeDefined();
  });
});

function renderDomainObjectPanel(domainObject: DomainObject | undefined): void {
  const renderTarget = createFullRenderTargetMock();
  if (domainObject !== undefined) {
    renderTarget.rootDomainObject.addChild(domainObject);
  }
  if (domainObject !== undefined) {
    domainObject.isSelected = true; // Select the domain object to show the panel
    DomainObjectPanelUpdater.show(domainObject);
  }
  const wrapper = ({ children }: PropsWithChildren): ReactElement => (
    <ViewerContextProvider value={renderTarget}>{children}</ViewerContextProvider>
  );
  render(<DomainObjectPanel />, {
    wrapper
  });
}

class MockDomainObject extends DomainObject {
  public constructor() {
    super();
    this.name = 'Mock';
  }

  public override get icon(): IconName {
    return 'Snow';
  }

  public override get typeName(): TranslationInput {
    return { untranslated: 'Mock' };
  }

  public override get hasPanelInfo(): boolean {
    return true;
  }

  public override getPanelToolbar(): BaseCommand[] {
    return [
      new CopyToClipboardCommand(),
      new CycleLengthUnitsCommand(),
      new DeleteDomainObjectCommand(this)
    ];
  }

  public override getPanelInfo(): PanelInfo | undefined {
    const info = new PanelInfo();
    add({ key: 'LENGTH' }, 1, Quantity.Length);
    add({ key: 'AREA' }, 2, Quantity.Area);
    add({ key: 'VOLUME' }, 3, Quantity.Volume);
    add({ key: 'HORIZONTAL_ANGLE' }, 4, Quantity.Angle);
    add({ key: 'REVISIONS' }, 5, Quantity.Unitless);
    return info;

    function add(translationInput: TranslationInput, value: number, quantity: Quantity): void {
      info.add({ translationInput, value, quantity });
    }
  }
}

const EXPECTED_SUB_STRINGS: string[] = [
  'Length',
  '1.000',
  'm',

  'Area',
  'm²',
  '2.000',

  'Volume',
  'm³',
  '3.000',

  'Horizontal angle',
  '4.0',
  '°',

  'Revisions',
  '5.00'
];
