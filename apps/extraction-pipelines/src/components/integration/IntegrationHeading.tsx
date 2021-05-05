import React, { FunctionComponent } from 'react';
import { useIntegrationById } from 'hooks/useIntegration';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import { INTEGRATION_NAME_HEADING } from 'pages/create/NamePage';
import {
  descriptionSchema,
  nameSchema,
} from 'utils/validation/integrationSchemas';
import InlineEdit from 'components/integration/InlineEdit';
import { Icon, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { DESCRIPTION_LABEL } from 'pages/create/DocumentationPage';
import { useAppEnv } from 'hooks/useAppEnv';
import { rootUpdate } from 'hooks/details/useDetailsUpdate';
import { DivFlex } from 'styles/flex/StyledFlex';
import DetailsValueView from 'components/table/details/DetailsValueView';

const Wrapper = styled.div`
  margin: 1rem;
  #description,
  #name {
    flex: 1;
  }
`;
const ImportantWrapper = styled(DivFlex)`
  margin-left: 1rem;
  .cogs-icon {
    margin-right: 1rem;
  }
  .cogs-icon-Dot {
    margin-left: 0.5rem;
    margin-right: 1rem;
  }
`;
const StyledTitle = styled(Title)`
  &.cogs-title-1 {
    font-size: 1.5rem;
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
        label={INTEGRATION_NAME_HEADING}
        viewComp={<StyledTitle level={1}>{integration.name}</StyledTitle>}
      />
      <ImportantWrapper>
        <Icon type="Dot" />
        <Icon type="datasource" />
        <DetailsValueView fieldValue={integration?.source} fieldName="source" />
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
