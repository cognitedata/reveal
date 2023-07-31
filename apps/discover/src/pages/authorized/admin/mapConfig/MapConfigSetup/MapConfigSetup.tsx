import * as React from 'react';

import styled from 'styled-components/macro';

import { BaseButton } from 'components/Buttons';

// import { useMapConfigSetupStatus } from '../hooks/useMapConfigSetupStatus';
// import { useMissingOrFoundThings } from '../hooks/useMissingOrFoundThings';
import { createMapConfigModels } from '../service/createMapConfigModels';
import { createMapConfigSchema } from '../service/createMapConfigSchema';
import { createMapConfigSpace } from '../service/createMapConfigSpace';

import { MapConfigSetupStatus } from './MapConfigSetupStatus';

const Header = styled.header`
  font-size: 22px;
  padding: 10px;
  margin: 10px;
`;
const ErrorHeader = styled(Header)`
  color: #ba3939;
  background: #ffe0e0;
  border: 1px solid #a33a3a;
`;
// const GoodHeader = styled(Header)`
//   border: 1px solid #18af8e;
// `;
const Wrapper = styled.div`
  color: #eee;
  background: #777;
  flex-direction: column;
  flex: 1;
`;
const ReportBody = styled.div`
  flex-direction: column;
  margin: 10px;
  min-width: 400px;
  max-width: 30vw;
`;

interface Props {
  missing: string[];
  found: string[];
}
export const MapConfigSetup: React.FC<Props> = ({ found, missing }) => {
  const handleClick = async () => {
    await createMapConfigSpace();
    await createMapConfigModels();
    await createMapConfigSchema();
  };

  // console.log('✅ Found', found);
  // console.log('❌ Missing', missing);

  const hasMissingThings = missing.length > 0;

  return (
    <Wrapper>
      {hasMissingThings && (
        <>
          <ErrorHeader>
            Setup incomplete! It seems like the first time using Map Config with
            this project.
          </ErrorHeader>
          <ReportBody>
            <MapConfigSetupStatus missing={missing} found={found}>
              <BaseButton
                icon="Add"
                type="tertiary"
                text="Click here to run the automatic setup."
                onClick={handleClick}
              />
            </MapConfigSetupStatus>
          </ReportBody>
        </>
      )}
    </Wrapper>
  );
};
