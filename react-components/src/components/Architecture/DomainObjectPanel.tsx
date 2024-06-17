/*!
 * Copyright 2024 Cognite AS
 */
import { Icon, type IconType, Body } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useState, type ReactElement } from 'react';
import {
  DomainObjectPanelUpdater,
  type DomainObjectInfo
} from '../../architecture/base/reactUpdaters/DomainObjectPanelUpdater';
import {
  type PanelInfo,
  type NumberPanelItem
} from '../../architecture/base/domainObjectsHelpers/PanelInfo';
import { useTranslation } from '../i18n/I18n';
import { CopyToClipboardCommand } from '../../architecture/base/concreteCommands/CopyToClipboardCommand';
import { CommandButtons } from './Toolbar';
import { withSuppressRevealEvents } from '../../higher-order-components/withSuppressRevealEvents';
import { type TranslateDelegate } from '../../architecture/base/utilities/TranslateKey';
import { type UnitSystem } from '../../architecture/base/renderTarget/UnitSystem';

const TEXT_SIZE = 'x-small';
const HEADER_SIZE = 'small';

export const DomainObjectPanel = (): ReactElement => {
  const [currentDomainObjectInfo, setCurrentDomainObjectInfo] = useState<
    DomainObjectInfo | undefined
  >();

  DomainObjectPanelUpdater.setDomainObjectDelegate(setCurrentDomainObjectInfo);

  const { t } = useTranslation();
  if (currentDomainObjectInfo === undefined) {
    return <></>;
  }
  const domainObject = currentDomainObjectInfo.domainObject;
  if (domainObject === undefined) {
    return <></>;
  }
  const info = domainObject.getPanelInfo();
  if (info === undefined) {
    return <></>;
  }
  const style = domainObject.getPanelInfoStyle();
  const root = domainObject.rootDomainObject;
  if (root === undefined) {
    return <></>;
  }
  const unitSystem = root.unitSystem;

  const icon = domainObject.icon as IconType;
  const header = info.header;

  const commands = domainObject.getPanelToolbar();

  // Set in the get string on the copy command if any
  for (const command of commands) {
    if (command instanceof CopyToClipboardCommand)
      command.getString = () => toString(info, t, unitSystem);
  }

  const text = header?.getText(t);
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
      <table>
        <tbody>
          <tr>
            <PaddedTh>
              <Icon type={icon} />
            </PaddedTh>
            {text !== undefined && (
              <PaddedTh>
                <Body size={HEADER_SIZE}>{text}</Body>
              </PaddedTh>
            )}
            <CommandButtons commands={commands} isHorizontal={true} />
          </tr>
        </tbody>
      </table>
      <table>
        <tbody>{info.items.map((item, _i) => addTextWithNumber(item, unitSystem))}</tbody>
      </table>
    </Container>
  );

  function addTextWithNumber(item: NumberPanelItem, unitSystem: UnitSystem): ReactElement {
    const icon = item.icon as IconType;
    const { quantity, value } = item;
    const text = item?.getText(t);
    return (
      <tr key={JSON.stringify(item)}>
        <PaddedTh>
          {text !== undefined && <Body size={TEXT_SIZE}>{text}</Body>}
          {icon !== undefined && <Icon type={icon} />}
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

function toString(info: PanelInfo, translate: TranslateDelegate, unitSystem: UnitSystem): string {
  let result = '';
  {
    const { header } = info;
    const text = header?.getText(translate);
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
