/*!
 * Copyright 2024 Cognite AS
 */
import { Button, Icon, type IconType, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import styled from 'styled-components';
import { type ReactElement } from 'react';
import { type DomainObjectInfo } from '../../src/architecture/base/domainObjectsHelpers/DomainObjectPanelUpdater';
import {
  type PanelInfo,
  type NumberPanelItem
} from '../../src/architecture/base/domainObjectsHelpers/PanelInfo';
import { useTranslation } from '../../src/components/i18n/I18n';

export const DomainObjectPanel = ({
  domainObjectInfo
}: {
  domainObjectInfo: DomainObjectInfo | undefined;
}): ReactElement => {
  if (domainObjectInfo === undefined) {
    return <></>;
  }
  const { t } = useTranslation();
  const domainObject = domainObjectInfo.domainObject;
  if (domainObject === undefined) {
    return <></>;
  }

  const info = domainObject.getPanelInfo();
  if (info === undefined) {
    return <></>;
  }

  if (info.header === undefined) {
    return <></>;
  }
  const icon = domainObject.icon as IconType;

  return (
    <DomainObjectPanelContainer>
      <CardContainer>
        <table>
          <tbody>
            <tr>
              <PaddedTh>
                <Icon type={icon} />
              </PaddedTh>
              <PaddedTh>
                <span>{t(info.header.key, info.header.fallback)}</span>
              </PaddedTh>
              <th>
                <Button
                  onClick={() => {
                    domainObject.removeInteractive();
                  }}>
                  <Icon type="Delete" />
                </Button>
              </th>
              <th>
                <CogsTooltip
                  content={t('COPY_TO_CLIPBOARD', 'Copy to clipboard')}
                  placement="right"
                  appendTo={document.body}>
                  <Button
                    onClick={async () => {
                      await copyStringToClipboard(info);
                    }}>
                    <Icon type="Copy" />
                  </Button>
                </CogsTooltip>
              </th>
            </tr>
          </tbody>
        </table>
        <table>
          <tbody>{info.items.map((x, _i) => addNumber(x))}</tbody>
        </table>
      </CardContainer>
    </DomainObjectPanelContainer>
  );

  function addNumber(item: NumberPanelItem): ReactElement {
    return (
      <tr key={JSON.stringify(item)}>
        <PaddedTh>
          <span>{t(item.key, item.fallback)}</span>
        </PaddedTh>
        <></>
        <RightTh>
          <span>{item.valueToString()}</span>
        </RightTh>
      </tr>
    );
  }

  async function copyStringToClipboard(info: PanelInfo): Promise<void> {
    let text = '';
    if (info.header !== undefined) {
      text += t(info.header.key, info.header.fallback);
      text += `\n`;
    }
    for (const item of info.items) {
      text += t(item.key, item.fallback);
      text += `:  `;
      text += item.valueToString();
      text += `\n`;
    }
    await navigator.clipboard.writeText(text);
  }
};

const RightTh = styled.th`
  text-align: right;
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

const DomainObjectPanelContainer = styled.div`
  zindex: 1000px;
  bottom: 10px;
  left: 60px;
  position: absolute;
  display: block;
`;
