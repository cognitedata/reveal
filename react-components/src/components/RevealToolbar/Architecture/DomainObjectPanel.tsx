/*!
 * Copyright 2024 Cognite AS
 */
import { Button, Icon, type IconType, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import styled from 'styled-components';
import { type ReactElement } from 'react';
import { type DomainObjectInfo } from '../../../architecture/base/domainObjectsHelpers/DomainObjectPanelUpdater';
import {
  type PanelInfo,
  type NumberPanelItem
} from '../../../architecture/base/domainObjectsHelpers/PanelInfo';
import { useTranslation } from '../../i18n/I18n';

export const DomainObjectPanel = ({
  domainObjectInfo
}: {
  domainObjectInfo: DomainObjectInfo | undefined;
}): ReactElement => {
  const { t } = useTranslation();
  if (domainObjectInfo === undefined) {
    return <></>;
  }
  const domainObject = domainObjectInfo.domainObject;
  if (domainObject === undefined) {
    return <></>;
  }
  const info = domainObject.getPanelInfo();
  if (info === undefined) {
    return <></>;
  }

  const icon = domainObject.icon as IconType;
  const header = info.header;

  return (
    <PanelContainer>
      <CardContainer>
        <table>
          <tbody>
            <tr>
              <PaddedTh>
                <Icon type={icon} />
              </PaddedTh>
              {header !== undefined && (
                <PaddedTh>
                  <span>{t(header.key, header.fallback)}</span>
                </PaddedTh>
              )}
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
          <tbody>{info.items.map((item, _i) => addNumber(item))}</tbody>
        </table>
      </CardContainer>
    </PanelContainer>
  );

  function addNumber(item: NumberPanelItem): ReactElement {
    return (
      <tr key={JSON.stringify(item)}>
        <PaddedTh>
          <span>{t(item.key, item.fallback)}</span>
        </PaddedTh>
        <></>
        <NumberTh>
          <span>{item.valueToString()}</span>
        </NumberTh>
        <PaddedTh>
          <span>{item.getUnit()}</span>
        </PaddedTh>
      </tr>
    );
  }

  async function copyTextToClipboard(info: PanelInfo): Promise<void> {
    let text = '';
    const { header } = info;
    if (header !== undefined) {
      text += `${t(header.key, header.fallback)}\n`;
    }
    for (const item of info.items) {
      text += `${t(item.key, item.fallback)}:  ${item.valueToString()} ${item.getUnit()}\n`;
    }
    await navigator.clipboard.writeText(text);
  }
};

const NumberTh = styled.th`
  text-align: right;
  padding-right: 8px;
`;

const PaddedTh = styled.th`
  padding-right: 20px;
`;

const CardContainer = styled.div`
  margin: 24px;
  padding: 20px;
  border-radius: 10px;
  bottom: 10px;
  flex-direction: column;
  min-width: 220px;
  overflow: hidden;
  background-color: white;
  box-shadow: 0px 1px 8px #4f52681a;
`;

const PanelContainer = styled.div`
  zindex: 1000px;
  bottom: 10px;
  left: 60px;
  position: absolute;
  display: block;
`;
