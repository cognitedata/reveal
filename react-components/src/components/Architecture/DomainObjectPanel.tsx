/*!
 * Copyright 2024 Cognite AS
 */
import { Body } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useEffect, useMemo, useState, type ReactElement } from 'react';
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
import { type DomainObject } from '../../architecture/base/domainObjects/DomainObject';
import { getIconComponent, IconName } from './getIconComponent';

const TEXT_SIZE = 'x-small';
const HEADER_SIZE = 'small';

export const DomainObjectPanel = (): ReactElement => {
  const [currentDomainObjectInfo, setCurrentDomainObjectInfo] = useState<
    DomainObjectInfo | undefined
  >();

  const domainObject = currentDomainObjectInfo?.domainObject;
  const commands = useMemo(() => domainObject?.getPanelToolbar(), [domainObject]);
  const info = domainObject?.getPanelInfo();
  const style = domainObject?.getPanelInfoStyle();
  const root = domainObject?.rootDomainObject;

  useEffect(() => {
    DomainObjectPanelUpdater.setDomainObjectDelegate(setCurrentDomainObjectInfo);

    if (commands === undefined || info === undefined) {
      return;
    }

    // Set in the get string on the copy command if any
    for (const command of commands) {
      if (command instanceof CopyToClipboardCommand)
        command.getString = () => toString(info, t, unitSystem);
    }
  }, [setCurrentDomainObjectInfo, commands]);

  const { t } = useTranslation();

  if (
    domainObject === undefined ||
    root === undefined ||
    info === undefined ||
    commands === undefined ||
    style === undefined
  ) {
    return <></>;
  }
  const unitSystem = root.unitSystem;
  const iconName = getIcon(domainObject);
  const Icon = iconName !== undefined ? getIconComponent(iconName) : () => <></>;
  const header = info.header;
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
            {Icon !== undefined && (
              <PaddedTh>
                <Icon />
              </PaddedTh>
            )}
            {text !== undefined && (
              <PaddedTh>
                <Body size={HEADER_SIZE}>{text}</Body>
              </PaddedTh>
            )}
            <th>
              <CommandButtons commands={commands} isHorizontal={true} />
            </th>
          </tr>
        </tbody>
      </table>
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

export function getIcon(domainObject: DomainObject): IconName | undefined {
  if (domainObject.icon === undefined) {
    return undefined;
  }
  return domainObject.icon;
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
