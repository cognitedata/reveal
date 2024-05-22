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
  console.log('Rendering DomainObjectPanel!');

  const domainObject = domainObjectInfo.domainObject;
  const infos = domainObject.getNumberInfos();
  if (infos === undefined) {
    return <></>;
  }

  return (
    <DomainObjectPanelContainer>
      <CardContainer>
        <tr>
          <Th>
            <Icon type="RulerAlternative" />
          </Th>
          <Th>
            <span>{domainObject.name}</span>
          </Th>
          <th>
            <Button
              onClick={() => {
                domainObject.removeInteractive();
              }}>
              <Icon type="Delete" />
            </Button>
          </th>
        </tr>
        <table>{infos.map((x, _i) => add(x))}</table>
      </CardContainer>
    </DomainObjectPanelContainer>
  );
};

function add(info: NumberInfo): ReactElement {
  return (
    <tr>
      <Th>
        <span>{info[1]}</span>
      </Th>
      <Th>
        <span>{info[2].toFixed(info[3]) + ' m'}</span>
      </Th>
    </tr>
  );
}

const Th = styled.th`
  padding-right: 10px;
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
