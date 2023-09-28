/* eslint-disable @cognite/no-number-z-index */
import { useNavigate } from 'react-location';

import { BASIC_CAPABILITIES_REQUIRED } from '@simint-app/components/app/constants';
import { useCheckAcl } from '@simint-app/hooks/useCheckAcl';
import { createCdfLink } from '@simint-app/utils/createCdfLink';
import styled from 'styled-components/macro';

import { Button, Collapse, Icon, Illustrations, Title } from '@cognite/cogs.js';
import { CapabilityItemModel } from '@cognite/simconfig-api-sdk/rtk';

function PermissionsRequired() {
  const { Panel } = Collapse;

  const { capabilityMap } = useCheckAcl(BASIC_CAPABILITIES_REQUIRED);

  const navigate = useNavigate();

  const onBackClick = () => {
    navigate({
      to: createCdfLink('../../../'), // takes the user three levels up to the cdf root
    });
  };

  return (
    <Wrapper>
      <Card>
        <Container>
          <div>
            <TitleWrapper level={3}>
              You need the following capabilities to access the Simulator
              Configurator
            </TitleWrapper>
            <CardPlainText>
              Contact your IT admin or CDF admin to get access
            </CardPlainText>
            <CollapseWrapperFull>
              <Panel header="Full access" key="full">
                <div>
                  <ul>
                    <li>events: read, events: write</li>
                    <li>files: read, files: write</li>
                    <li>sequences: read, sequences: write</li>
                    <li>timeseries: read, timeseries: write</li>
                    <li>dataset: read</li>
                    <li>projects: read, projects: list</li>
                    <li>groups: read, groups: list</li>
                    <li>labels: read, labels: write</li>
                    <li>dataset: read, projects: read</li>
                    <li>raw: read, raw: write, raw:list</li>
                  </ul>
                </div>
              </Panel>

              {Object.entries(capabilityMap).filter(
                ([, capability]) => capability.found === false
              )?.length > 0 && (
                <Panel header="Missing access" key="miss">
                  <div>
                    <ul>
                      {Object.entries(capabilityMap)
                        .filter(([, capability]) => capability.found === false)
                        .map(([key, capability]) => {
                          return (
                            <li key={key}>
                              <div>ACL : {capability.capabilityName}</div>
                              <div>
                                {capability.missing.map(
                                  (missing: CapabilityItemModel) => {
                                    return (
                                      <>
                                        <div>
                                          {`Actions: ${missing.actions?.join(
                                            ', '
                                          )}`}
                                        </div>
                                      </>
                                    );
                                  }
                                )}
                              </div>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                </Panel>
              )}
            </CollapseWrapperFull>
          </div>
          <div>
            <IllustrationContainer type="PersonMan" />
          </div>
        </Container>
        <Button type="primary" onClick={onBackClick}>
          <IconBackWrapper type="ArrowLeft" /> Back
        </Button>
        <CardFooter>
          Learn more about{' '}
          <a href="https://docs.cognite.com/cdf/access/">Access Management</a>
        </CardFooter>
      </Card>
    </Wrapper>
  );
}

const Container = styled.div`
  display: flex;
`;

const Wrapper = styled.div`
  display: flex;
  position: absolute;
  top: -10px;
  background-color: var(--cogs-greyscale-grey2);
  height: 100%;
  width: 100%;
  z-index: 10;
`;

const Card = styled.div`
  background-color: white;
  width: 50vw;
  height: fit-content;
  position: relative;
  top: 15vh;
  left: calc(25vw + 2em);
  border-radius: 10px;
  padding: 2em;
  overflow-y: scroll;
`;

const TitleWrapper = styled(Title)`
  margin-top: 10px;
`;

const IconBackWrapper = styled(Icon)`
  margin-right: 5px;
`;

const CardFooter = styled.div`
  margin: 10px 0px;
`;

const CardPlainText = styled.div`
  margin: 10px 0px;
`;

const CollapseWrapperFull = styled(Collapse)`
  border-radius: 5px;
  margin-bottom: 15px;
`;

const IllustrationContainer = styled(Illustrations.Solo)`
  margin: 1em;
`;

export { PermissionsRequired };
