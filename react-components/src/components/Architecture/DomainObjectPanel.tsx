/*!
 * Copyright 2024 Cognite AS
 */
import { Button, Icon, type IconType, Tooltip as CogsTooltip } from '@cognite/cogs.js';
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
                <span>{t(header.key, header.fallback)}</span>
              </PaddedTh>
            )}
            {domainObject.canBeRemoved && (
              <th>
                <CogsTooltip
                  content={t('DELETE', 'Delete')}
                  placement="right"
                  appendTo={document.body}>
                  <Button
                    onClick={() => {
                      domainObject.removeInteractive();
                    }}>
                    <Icon type="Delete" />
                  </Button>
                </CogsTooltip>
              </th>
            )}
            <th>
              <CogsTooltip
                content={t('COPY_TO_CLIPBOARD', 'Copy to clipboard')}
                placement="right"
                appendTo={document.body}>
                <Button
                  onClick={async () => {
                    await copyTextToClipboard(info);
                  }}>
                  <Icon type="Copy" />
                </Button>
              </CogsTooltip>
            </th>
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
          {key !== undefined && <span>{t(key, fallback)}</span>}
          {icon !== undefined && (
            <span>
              <Icon type={icon} />
            </span>
          )}
        </PaddedTh>
        <></>
        <NumberTh>
          <span>{item.valueAsString}</span>
        </NumberTh>
        <PaddedTh>
          <span>{unit}</span>
        </PaddedTh>
      </tr>
    );
  }

  async function copyTextToClipboard(info: PanelInfo): Promise<void> {
    let text = '';
    {
      const { header } = info;
      if (header !== undefined) {
        const { key, fallback } = header;
        if (key !== undefined) {
          text += `${t(key, fallback)}\n`;
        }
      }
    }
    for (const item of info.items) {
      const { key, fallback, unit } = item;
      if (key !== undefined) {
        text += `${t(key, fallback)}: `;
      }
      text += `${item.valueAsString} ${unit}\n`;
    }
    await navigator.clipboard.writeText(text);
  }
};

const NumberTh = styled.th`
  text-align: right;
  padding-right: 8px;
  min-width: 60px;
`;

const PaddedTh = styled.th`
  padding-right: 10px;
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
