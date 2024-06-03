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
import { type NumberPanelItem } from '../../architecture/base/domainObjectsHelpers/PanelInfo';
import { useTranslation } from '../i18n/I18n';
import { DeleteDomainObjectCommand } from '../../architecture/base/concreteCommands/DeleteDomainObjectCommand';
import { CopyToClipboardCommand } from '../../architecture/base/concreteCommands/CopyToClipboardCommand';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { CommandButtons } from './Toolbar';

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
  const icon = domainObject.icon as IconType;
  const header = info.header;

  const commands: BaseCommand[] = [
    new DeleteDomainObjectCommand(domainObject),
    new CopyToClipboardCommand(() => info.toString(t))
  ];

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
            {header !== undefined && header.key !== undefined && (
              <PaddedTh>
                <Body size={HEADER_SIZE}>{t(header.key, header.fallback)}</Body>
              </PaddedTh>
            )}
            <CommandButtons commands={commands} isHorizontal={true} reuse={false} />
          </tr>
        </tbody>
      </table>
      <table>
        <tbody>{info.items.map((item, _i) => addTextWithNumber(item))}</tbody>
      </table>
    </Container>
  );

  function addTextWithNumber(item: NumberPanelItem): ReactElement {
    const icon = item.icon as IconType;
    const { key, fallback, unit } = item;
    return (
      <tr key={JSON.stringify(item)}>
        <PaddedTh>
          {key !== undefined && <Body size={TEXT_SIZE}>{t(key, fallback)}</Body>}
          {icon !== undefined && (
            <span>
              <Icon type={icon} />
            </span>
          )}
        </PaddedTh>
        <></>
        <NumberTh>
          <Body size={TEXT_SIZE}>{item.valueAsString}</Body>
        </NumberTh>
        <PaddedTh>
          <Body size={TEXT_SIZE}>{unit}</Body>
        </PaddedTh>
      </tr>
    );
  }
};

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

const Container = styled.div`
  zindex: 1000px;
  position: absolute;
  display: block;
  border-radius: 10px;
  flex-direction: column;
  overflow: hidden;
  background-color: white;
  box-shadow: 0px 1px 8px #4f52681a;
`;
