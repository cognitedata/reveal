import { Wrapper } from '../../../../../components/Styles/storybook';

import { PowerBIModal } from './PowerBIModal';

export default {
  title: 'Basic Components/PowerBIModal',
  component: PowerBIModal,
};

export const Base = () => (
  <Wrapper>
    <PowerBIModal
      dataModel={{ space: 'myspace', externalId: 'model', version: '1' }}
      onRequestClose={() => {
        return;
      }}
    />
  </Wrapper>
);
