import React from 'react';
import styled from 'styled-components';
import { Icon, Input } from '@cognite/cogs.js';

const Container = styled.article<{ showing: boolean }>`
  transform: translateX(${(props) => (props.showing ? 0 : '320px')});
  transition: transform 300ms ease-in-out;
  position: absolute;
  right: 0;
  top: 0;
  padding: 32px;
  width: 288px;
  height: 100%;
  box-sizing: border-box;
  overflow-y: hidden;

  background-color: var(--cogs-white);
  box-shadow: 0 8px 48px rgba(0, 0, 0, 0.1), 0 0 4px rgba(0, 0, 0, 0.1);
  border-radius: 16px 0 0 16px;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  margin-bottom: 32px;
  & h2 {
    font-size: 16px;
  }
`;

const CloseIcon = styled(Icon)`
  cursor: pointer;
`;

const Content = styled.div`
  height: calc(100% - 64px);
  overflow-y: scroll;
`;

const TextArea = styled.textarea``;

const Section = styled.section`
  margin-bottom: 24px;
  & details {
    & summary {
      font-size: 14px;
      font-style: normal;
      font-weight: 600;
      outline: none;
      cursor: pointer;
    }
    & > div {
      margin: 16px 0 0 16px;
      & > h3 {
        padding-left: 16px;
        margin-bottom: 4px;
        font-size: 14px;
        font-style: normal;
        font-weight: 600;
      }
      & > Input {
        width: 100%;
        margin-bottom: 16px;
        font-size: 14px;
      }
      & > TextArea {
        width: 100%;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        padding: 8px 16px;
        background-color: var(--cogs-greyscale-grey2);
        border: none;
        border-radius: 8px;
        box-sizing: border-box;
        resize: none;
        outline: none;
      }
    }
    & hr {
      border: none;
      border-bottom: 1px solid var(--cogs-greyscale-grey4);
      margin: 16px 0 16px 16px;
    }
  }
`;

type Props = {
  showing: boolean;
  onClose: () => void;
};

const DetailView = ({ showing, onClose }: Props) => {
  return (
    <Container showing={showing}>
      <Header>
        <h2>Detail View</h2>
        <CloseIcon type="LargeClose" onClick={onClose} />
      </Header>
      <Content>
        <Section>
          <details>
            <summary>Source</summary>
            <div>
              <h3>Name</h3>
              <Input type="text" value="perf_L15_L14" variant="noBorder" />
              <h3>External Id</h3>
              <Input
                type="text"
                value="BA1C49552C8E460585E32EC49D977E10"
                variant="noBorder"
              />
              <h3>CRS</h3>
              <TextArea
                value={
                  'GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433],AUTHORITY["EPSG",4326]]'
                }
                readOnly
                rows={5}
              />
              <h3>Data type</h3>
              <Input type="text" value="Polygon" variant="noBorder" />
              <h3>Created time</h3>
              <Input
                type="text"
                value="10/03/202, 17:25:35"
                variant="noBorder"
              />
              <h3>Repository/Project</h3>
              <Input
                type="text"
                value="Valhall 19992/Project_122341"
                variant="noBorder"
              />
              <h3>Business project tag</h3>
              <Input
                type="text"
                value="2/8 Valhall West Flank DG6-7"
                variant="noBorder"
              />
              <h3>Revision</h3>
              <Input
                type="text"
                value="17/12/2020, 09:32:43"
                variant="noBorder"
              />
            </div>
            <hr />
          </details>
        </Section>
        <Section>
          <details>
            <summary>Upload to CDF</summary>
            <div>
              <h3>Name</h3>
              <Input type="text" value="perf_L15_L14" variant="noBorder" />
            </div>
            <hr />
          </details>
        </Section>
        <Section>
          <details>
            <summary>Translation</summary>
            <div>
              <h3>Name</h3>
              <Input type="text" value="perf_L15_L14" variant="noBorder" />
              <h3>Openworks Id</h3>
              <Input
                type="text"
                value="BA1C49552C8E460585E32EC49D977E10"
                variant="noBorder"
              />
              <h3>CRS</h3>
              <TextArea
                value={
                  'GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433],AUTHORITY["EPSG",4326]]'
                }
                readOnly
                rows={5}
              />
              <h3>Data type</h3>
              <Input type="text" value="Polygon" variant="noBorder" />
              <h3>Created time</h3>
              <Input
                type="text"
                value="10/03/202, 17:25:35"
                variant="noBorder"
              />
              <h3>Repository/Project</h3>
              <Input
                type="text"
                value="Valhall 19992/Project_122341"
                variant="noBorder"
              />
              <h3>Configuration Tag</h3>
              <Input type="text" value="CWP Session 4" variant="noBorder" />
              <h3>Revision</h3>
              <Input
                type="text"
                value="17/12/2020, 09:32:43"
                variant="noBorder"
              />
              <h3>Interpreter</h3>
              <Input type="text" value="PET" variant="noBorder" />
            </div>
          </details>
        </Section>
      </Content>
    </Container>
  );
};

export default DetailView;
