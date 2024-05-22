/*!
 * Copyright 2024 Cognite AS
 */
import { Button, Icon } from '@cognite/cogs.js';
import { type DomainObjectInfo } from '../../src/architecture/concrete/boxDomainObject/addEventListenerToDomainObject';
import styled from 'styled-components';
import { type ReactElement } from 'react';
import { type NumberInfo } from '../../src/architecture/base/domainObjects/DomainObject';

export const DomainObjectPanel = ({
  domainObjectInfo
}: {
  domainObjectInfo: DomainObjectInfo | undefined;
}): ReactElement => {
  if (domainObjectInfo === undefined) {
    return <></>;
  }
  const domainObject = domainObjectInfo.domainObject;
  if (domainObject === undefined) {
    return <></>;
  }

  const infos = domainObject.getNumberInfos();
  if (infos === undefined) {
    return <></>;
  }

  return (
    <DomainObjectPanelContainer>
      <CardContainer>
        <table>
          <tbody>
            <tr>
              <PaddedTh>
                <Icon type="RulerAlternative" />
              </PaddedTh>
              <PaddedTh>
                <span>{domainObject.name}</span>
              </PaddedTh>
              <th>
                <Button
                  onClick={() => {
                    domainObject.removeInteractive();
                  }}>
                  <Icon type="Delete" />
                </Button>
              </th>
            </tr>
          </tbody>
        </table>
        <table>
          <tbody>{infos.map((x, _i) => add(x))}</tbody>
        </table>
      </CardContainer>
    </DomainObjectPanelContainer>
  );
};

function add(info: NumberInfo): ReactElement {
  return (
    <tr key={JSON.stringify(info)}>
      <PaddedTh>
        <span>{info[1]}</span>
      </PaddedTh>
      <></>
      <RightTh>
        <span>{info[2].toFixed(info[3]) + ' m'}</span>
      </RightTh>
    </tr>
  );
}

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
