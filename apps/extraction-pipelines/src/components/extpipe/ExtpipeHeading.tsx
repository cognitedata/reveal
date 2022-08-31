import React, { FunctionComponent } from 'react';
import { useExtpipeById } from 'hooks/useExtpipe';
import { useSelectedExtpipe } from 'hooks/useSelectedExtpipe';
import { nameSchema } from 'utils/validation/extpipeSchemas';
import InlineEdit from 'components/extpipe/InlineEdit';
import { Icon, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { rootUpdate } from 'hooks/details/useDetailsUpdate';
import { DivFlex, StyledNavLink } from 'components/styled';
import { useOneOfPermissions } from 'hooks/useOneOfPermissions';
import { EXTPIPES_WRITES } from 'model/AclAction';
import StatusMarker from 'components/extpipes/cols/StatusMarker';
import { calculateStatus } from 'utils/extpipeUtils';
import { createExtPipePath } from 'utils/baseURL';
import { useTranslation } from 'common';

export const ExtpipeHeading: FunctionComponent = () => {
  const { t } = useTranslation();
  const { extpipe: selected } = useSelectedExtpipe();
  const { data: extpipe } = useExtpipeById(selected?.id);
  const perm = useOneOfPermissions(EXTPIPES_WRITES);
  const canEdit = perm.data;
  if (!extpipe) {
    return <></>;
  }

  // calculate this a more centralized place?
  const lastRun = calculateStatus({
    lastSuccess: extpipe?.lastSuccess,
    lastFailure: extpipe?.lastFailure,
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
            <div css="display: flex; align-items: center;">
              <Icon type="ArrowLeft" />
            </div>
          </StyledNavLink>
          <InlineEdit
            name="name"
            defaultValues={{ name: extpipe?.name }}
            schema={nameSchema}
            updateFn={rootUpdate({ extpipe, name: 'name' })}
            label={t('ext-pipeline-name')}
            viewComp={<StyledTitle level={1}>{extpipe.name}</StyledTitle>}
            canEdit={canEdit}
          />
          <span style={{ marginRight: '1rem' }}>{t('last-status')}:</span>{' '}
          <StatusMarker status={lastRun.status} />
        </DivFlex>
      </Wrapper>
    </>
  );
};

const Wrapper = styled.div`
  #description,
  #name {
    flex: 1;
  }
  padding: 1rem;
  margin-left: 1rem;
`;

const StyledTitle = styled(Title)`
  &.cogs-title-1 {
    font-size: 1.5rem;
    line-height: normal;
    margin: 0;
  }
`;
