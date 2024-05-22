/*!
 * Copyright 2024 Cognite AS
 */
import { Button, Icon } from '@cognite/cogs.js';
import { type MeasurementObjectInfo } from '../../src/architecture/concrete/boxDomainObject/addEventListenerToBoxDomainObject';
import styled from 'styled-components';

export const MeasurementPanel = ({
  measurementInfo
}: {
  measurementInfo: MeasurementObjectInfo | undefined;
}) => {
  if (measurementInfo === undefined) {
    return <></>;
  }
  console.log('Rendering measurement panel!');

  return (
    <MeasurementPanelContainer>
      <CardContainer>
        <table>
          <tr>
            <Th>
              <Icon type="RulerAlternative" />
            </Th>
            <Th>
              <span>{'Length'}</span>
            </Th>
            <Th>
              <span>{measurementInfo.domainObject.size.length() + ' m'}</span>
            </Th>
            <th>
              <Button
                onClick={() => {
                  measurementInfo.domainObject.removeInteractive();
                }}>
                <Icon type="Delete" />
              </Button>
            </th>
          </tr>
          <tr>
            <Th>
              <Icon type="RulerAlternative" />
            </Th>
            <Th>
              <span>{'Lengthssss'}</span>
            </Th>
            <Th>
              <span>{measurementInfo.domainObject.size.length() + ' m'}</span>
            </Th>
            <th>
              <Button
                onClick={() => {
                  measurementInfo.domainObject.removeInteractive();
                }}>
                <Icon type="Delete" />
              </Button>
            </th>
          </tr>
        </table>
      </CardContainer>
    </MeasurementPanelContainer>
  );
};

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

const MeasurementPanelContainer = styled.div`
  zindex: 1000px;
  bottom: 10px;
  left: 60px;
  position: absolute;
  display: block;
`;
