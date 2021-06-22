import React, { FunctionComponent } from 'react';
import { useIntegrationById } from 'hooks/useIntegration';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import {
  descriptionSchema,
  nameSchema,
  sourceSchema,
} from 'utils/validation/integrationSchemas';
import InlineEdit from 'components/integration/InlineEdit';
import { Icon, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useAppEnv } from 'hooks/useAppEnv';
import { rootUpdate } from 'hooks/details/useDetailsUpdate';
import { DivFlex } from 'styles/flex/StyledFlex';
import DetailsValueView from 'components/table/details/DetailsValueView';
import { bottomSpacing } from 'styles/StyledVariables';
import {
  DESCRIPTION_LABEL,
  EXT_PIPE_NAME_HEADING,
  SOURCE_LABEL,
} from 'utils/constants';

const Wrapper = styled.div`
  margin: 0.5rem 1rem 1rem 1rem;
  #description,
  #name {
    flex: 1;
  }
`;
const ImportantWrapper = styled(DivFlex)`
  margin-left: 1rem;
  margin-bottom: ${bottomSpacing};
  .cogs-icon {
    margin-right: 1rem;
    &.icon-no-margin {
      margin: 0;
    }
  }
  .cogs-icon-Dot {
    margin-left: 0.5rem;
    margin-right: 1rem;
  }
`;
const StyledTitle = styled(Title)`
  &.cogs-title-1 {
    font-size: 1.5rem;
    line-height: normal;
    margin: 0;
  }
`;
interface IntegrationHeadingProps {}

export const IntegrationHeading: FunctionComponent<IntegrationHeadingProps> = () => {
  const { project } = useAppEnv();
  const { integration: selected } = useSelectedIntegration();
  const { data: integration } = useIntegrationById(selected?.id);
  if (!integration || !project) {
    return <></>;
  }
  return (
    <Wrapper className="heading">
      <InlineEdit
        name="name"
        defaultValues={{ name: integration?.name }}
        schema={nameSchema}
        updateFn={rootUpdate({ integration, name: 'name', project })}
        label={EXT_PIPE_NAME_HEADING}
        viewComp={<StyledTitle level={1}>{integration.name}</StyledTitle>}
      />
      <ImportantWrapper>
        {integration?.dataSet && (
          <>
            <Icon type="Grid" />
            <DetailsValueView
              fieldName="dataSet"
              fieldValue={integration.dataSet}
            />
          </>
        )}
        <Icon type="Dot" />
        <Icon type="datasource" />
        <InlineEdit
          name="source"
          updateFn={rootUpdate({ integration, name: 'source', project })}
          defaultValues={{ source: integration?.source }}
          schema={sourceSchema}
          label={SOURCE_LABEL}
        />
      </ImportantWrapper>
      <InlineEdit
        name="description"
        updateFn={rootUpdate({ integration, name: 'description', project })}
        defaultValues={{ description: integration?.description }}
        schema={descriptionSchema}
        label={DESCRIPTION_LABEL}
      />
    </Wrapper>
  );
};
