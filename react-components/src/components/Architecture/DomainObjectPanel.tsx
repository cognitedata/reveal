import { Body, Flex, Input } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useMemo, useState, type ReactElement, useEffect } from 'react';
import {
  type PanelInfo,
  type NumberPanelItem
} from '../../architecture/base/domainObjectsHelpers/PanelInfo';
import { CopyToClipboardCommand } from '../../architecture/base/concreteCommands/general/CopyToClipboardCommand';
import { CommandButtons } from './Toolbar';
import { withSuppressRevealEvents } from '../../higher-order-components/withSuppressRevealEvents';
import {
  type LengthUnit,
  UNDEFINED_UNIT_SYSTEM,
  type UnitSystem
} from '../../architecture/base/renderTarget/UnitSystem';
import { IconComponent } from './Factories/IconFactory';
import { type DomainObject } from '../../architecture';
import { useSignalValue } from '@cognite/signals/react';
import { useRenderTarget } from '../RevealCanvas';
import { getRoot } from '../../architecture/base/domainObjects/getRoot';

const INPUT_SIZE = 'small';
const HEADER_SIZE = 'medium';

export const DomainObjectPanel = (): ReactElement => {
  const renderTarget = useRenderTarget();
  const panelUpdater = renderTarget.panelUpdater;
  const domainObject = useSignalValue(panelUpdater.selectedDomainObject);
  useSignalValue(panelUpdater.domainObjectChanged);
  const commands = useMemo(() => domainObject?.getPanelToolbar(), [domainObject]);
  const root = domainObject === undefined ? undefined : getRoot(domainObject);
  const unitSystem = root === undefined ? UNDEFINED_UNIT_SYSTEM : root.unitSystem;

  if (domainObject === undefined || commands === undefined || root === undefined) {
    return <></>;
  }
  const info = domainObject.getPanelInfo();
  const style = domainObject.getPanelInfoStyle();
  if (style === undefined || info === undefined) {
    return <></>;
  }

  // Force the getString to be updated
  for (const command of commands) {
    if (command instanceof CopyToClipboardCommand)
      command.getString = () => toString(domainObject, info, unitSystem);
  }

  const icon = domainObject.icon;
  const label = domainObject.label;
  return (
    <Container
      style={{
        left: style.leftPx,
        right: style.rightPx,
        top: style.topPx,
        bottom: style.bottomPx,
        margin: style.marginPx,
        padding: style.paddingPx
      }}>
      <Flex gap={4} justifyContent={'space-between'} alignItems={'center'}>
        <Flex gap={4}>
          {icon !== undefined && <IconComponent iconName={icon} type={'ghost'} />}
          {label !== undefined && (
            <Body strong size={HEADER_SIZE}>
              {label}
            </Body>
          )}
        </Flex>
        <Flex gap={0}>
          <CommandButtons commands={commands} placement={'bottom'} />
        </Flex>
      </Flex>
      <table style={{ gap: 8 }}>
        <tbody>{info.items.map((item, _i) => addTextWithNumber(item, unitSystem))}</tbody>
      </table>
    </Container>
  );

  function addTextWithNumber(item: NumberPanelItem, unitSystem: UnitSystem): ReactElement {
    return (
      <tr key={JSON.stringify(item)}>
        <NumberInput item={item} unitSystem={unitSystem} />
      </tr>
    );
  }
};

function toString(
  domainObject: DomainObject | undefined,
  info: PanelInfo,
  unitSystem: UnitSystem
): string {
  let result = '';
  {
    const text = domainObject?.label;
    if (text !== undefined) {
      result += `${text}\n`;
    }
  }
  for (const item of info.items) {
    const text = item?.getText();
    if (text !== undefined) {
      result += `${text}: `;
    }
    result += `${unitSystem.toStringWithUnit(item.value, item.quantity)}\n`;
  }
  return result;
}

const Container = withSuppressRevealEvents(styled.div`
  z-index: 1000;
  position: absolute;
  display: block;
  border-radius: 6px;
  flex-direction: column;
  overflow: hidden;
  background-color: white;
  box-shadow: 0px 1px 8px #4f52681a;
`);

type NumberInputProps = {
  item: NumberPanelItem;
  unitSystem: UnitSystem;
};

export function NumberInput({ item, unitSystem }: NumberInputProps): ReactElement {
  function getOriginalValue(): string {
    return unitSystem.toString(item.value, item.quantity, false);
  }
  const [value, setValue] = useState(getOriginalValue());
  const lengthUnit = useSignalValue<LengthUnit>(unitSystem.lengthUnit);
  useEffect(() => {
    setValue(getOriginalValue());
  }, [lengthUnit]);

  function onChange(newStringValue: string): void {
    if (item.setValue === undefined) {
      return;
    }
    const newValue = parseFloat(newStringValue);
    if (Number.isNaN(newValue)) {
      setValue('');
      return;
    }
    setValue(newStringValue);
  }

  function onApply(): void {
    if (item.setValue === undefined) {
      return;
    }
    const newValue = parseFloat(value);
    const newMetricValue = unitSystem.convertFromUnit(newValue, item.quantity);
    if (item.verifyValue !== undefined && !item.verifyValue(newMetricValue)) {
      setValue(getOriginalValue());
      return;
    }
    item.setValue(newMetricValue);
  }

  return (
    <Input
      style={{ marginTop: 2, marginBottom: 2 }}
      onChange={(e) => {
        onChange(e.target.value);
      }}
      onBlur={() => {
        onApply();
      }}
      onKeyDownCapture={(event) => {
        if (event.key === 'Enter') onApply();
      }}
      hideSpinButtons
      type="number"
      size={INPUT_SIZE}
      value={value}
      fullWidth={true}
      prefix={item.getText()}
      textAlign="right"
      disabled={item.setValue === undefined}
      suffix={unitSystem.getUnit(item.quantity)}
    />
  );
}
