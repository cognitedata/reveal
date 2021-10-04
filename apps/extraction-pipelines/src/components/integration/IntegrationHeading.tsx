import React, { FunctionComponent } from 'react';
import { useIntegrationById } from 'hooks/useIntegration';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import { nameSchema } from 'utils/validation/integrationSchemas';
import InlineEdit from 'components/integration/InlineEdit';
import { Icon, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useAppEnv } from 'hooks/useAppEnv';
import { rootUpdate } from 'hooks/details/useDetailsUpdate';
import { DivFlex } from 'styles/flex/StyledFlex';
import {
  EXT_PIPE_NAME_HEADING,
  EXTRACTION_PIPELINES_LIST,
} from 'utils/constants';
import { useOneOfPermissions } from 'hooks/useOneOfPermissions';
import { EXTPIPES_WRITES } from 'model/AclAction';
import StatusMarker from 'components/integrations/cols/StatusMarker';
import { calculateStatus } from 'utils/integrationUtils';
import { StyledNavLink } from 'styles/StyledLinks';
import { createExtPipePath } from 'utils/baseURL';

const Wrapper = styled.div`
  #description,
  #name {
    flex: 1;
  }
  padding: 1em;
`;

const StyledTitle = styled(Title)`
  &.cogs-title-1 {
    font-size: 1.5rem;
    line-height: normal;
    margin: 0;
  }
`;

export const IntegrationHeading: FunctionComponent = () => {
  const { project } = useAppEnv();
  const { integration: selected } = useSelectedIntegration();
  const { data: integration } = useIntegrationById(selected?.id);
  const perm = useOneOfPermissions(EXTPIPES_WRITES);
  const canEdit = perm.data;
  if (!integration || !project) {
    return <></>;
  }

  // calculate this a more centralized place?
  const lastRun = calculateStatus({
    lastSuccess: integration?.lastSuccess,
    lastFailure: integration?.lastFailure,
  });

  return (
    <>
      <Wrapper className="heading">
        <DivFlex>
          <StyledNavLink
            to={{
              pathname: createExtPipePath(),
            }}
          >
            <Icon type="ArrowBack" />
          </StyledNavLink>
          <InlineEdit
            name="name"
            defaultValues={{ name: integration?.name }}
            schema={nameSchema}
            updateFn={rootUpdate({ integration, name: 'name', project })}
            label={EXT_PIPE_NAME_HEADING}
            viewComp={<StyledTitle level={1}>{integration.name}</StyledTitle>}
            canEdit={canEdit}
          />
          Last reported status: <StatusMarker status={lastRun.status} />
        </DivFlex>
      </Wrapper>
    </>
  );
};
