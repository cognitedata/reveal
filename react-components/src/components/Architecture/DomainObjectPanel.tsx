/*!
 * Copyright 2024 Cognite AS
 */
import { Body, Flex } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useMemo, type ReactElement } from 'react';
import { DomainObjectPanelUpdater } from '../../architecture/base/reactUpdaters/DomainObjectPanelUpdater';
import {
  type PanelInfo,
  type NumberPanelItem
} from '../../architecture/base/domainObjectsHelpers/PanelInfo';
import { useTranslation } from '../i18n/I18n';
import { CopyToClipboardCommand } from '../../architecture/base/concreteCommands/CopyToClipboardCommand';
import { CommandButtons } from './Toolbar';
import { withSuppressRevealEvents } from '../../higher-order-components/withSuppressRevealEvents';
import { type TranslateDelegate } from '../../architecture/base/utilities/TranslateInput';
import { type UnitSystem } from '../../architecture/base/renderTarget/UnitSystem';
import { IconComponent } from './Factories/IconFactory';
import { type DomainObject } from '../../architecture';
import { useSignalValue } from '@cognite/signals/react';

const TEXT_SIZE = 'x-small';
const HEADER_SIZE = 'medium';

export const DomainObjectPanel = (): ReactElement => {
  useSignalValue(DomainObjectPanelUpdater.update);
  const domainObject = useSignalValue(DomainObjectPanelUpdater.domainObject);
  const commands = useMemo(() => domainObject?.getPanelToolbar(), [domainObject]);
  const { t } = useTranslation();

  if (domainObject === undefined || commands === undefined) {
    return <></>;
  }
  const info = domainObject.getPanelInfo();
  const style = domainObject.getPanelInfoStyle();
  const root = domainObject.rootDomainObject;

  if (root === undefined || info === undefined || style === undefined) {
    return <></>;
  }
  // Force the getString to be updated
  for (const command of commands) {
    if (command instanceof CopyToClipboardCommand)
      command.getString = () => toString(domainObject, info, t, unitSystem);
  }

  const unitSystem = root.unitSystem;
  const icon = domainObject.icon;
  const label = domainObject.getLabel(t);
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
      <Flex justifyContent={'space-between'} alignItems={'center'}>
        <Flex gap={8}>
          {icon !== undefined && <IconComponent iconName={icon} type={'ghost'} />}
          {label !== undefined && <Body size={HEADER_SIZE}>{label}</Body>}
        </Flex>
        <Flex>
          <CommandButtons commands={commands} placement={'bottom'} />
        </Flex>
      </Flex>
      <table>
        <tbody>{info.items.map((item, _i) => addTextWithNumber(item, unitSystem))}</tbody>
      </table>
    </Container>
  );

  function addTextWithNumber(item: NumberPanelItem, unitSystem: UnitSystem): ReactElement {
    const icon = item.icon;
    const { quantity, value } = item;
    const text = item?.getText(t);
    return (
      <tr key={JSON.stringify(item)}>
        <PaddedTh>
          {text !== undefined && <Body size={TEXT_SIZE}>{text}</Body>}
          {icon !== undefined && <IconComponent type={icon} iconName={icon} />}
        </PaddedTh>
        <></>
        <NumberTh>
          <Body size={TEXT_SIZE}>{unitSystem.toString(value, quantity)}</Body>
        </NumberTh>
        <PaddedTh>
          <Body size={TEXT_SIZE}>{unitSystem.getUnit(quantity)}</Body>
        </PaddedTh>
      </tr>
    );
  }
};

function toString(
  domainObject: DomainObject | undefined,
  info: PanelInfo,
  translate: TranslateDelegate,
  unitSystem: UnitSystem
): string {
  let result = '';

  {
    const text = domainObject?.getLabel(translate);
    if (text !== undefined) {
      result += `${text}\n`;
    }
  }
  for (const item of info.items) {
    const text = item?.getText(translate);
    if (text !== undefined) {
      result += `${text}: `;
    }
    result += `${unitSystem.toStringWithUnit(item.value, item.quantity)}\n`;
  }
  return result;
}

const NumberTh = styled.th`
  text-align: right;
  padding-right: 8px;
  min-width: 60px;
  size: small;
`;

const PaddedTh = styled.th`
  padding-right: 10px;
  size: small;
`;

const Container = withSuppressRevealEvents(styled.div`
  zindex: 1000px;
  position: absolute;
  display: block;
  border-radius: 10px;
  flex-direction: column;
  overflow: hidden;
  background-color: white;
  box-shadow: 0px 1px 8px #4f52681a;
`);
