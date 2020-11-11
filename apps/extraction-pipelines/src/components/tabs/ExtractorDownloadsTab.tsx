import { Icon } from '@cognite/cogs.js';
import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { useAppEnv } from '../../hooks/useAppEnv';

const Wrapper = styled.div`
  margin: 1rem;
`;

interface OwnProps {}

type Props = OwnProps;

const ExtractorDownloadsTab: FunctionComponent<Props> = () => {
  const { project } = useAppEnv();
  return (
    <Wrapper>
      <a
        href={`/${project}/extractors`}
        className="cogs-btn cogs-btn-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        Go to Extractors download
        <Icon type="OpenExternal" />
      </a>
    </Wrapper>
  );
};

export default ExtractorDownloadsTab;
