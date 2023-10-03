import styled from 'styled-components';

import { Body, Flex, Title } from '@cognite/cogs.js';

import { useTranslation } from '../../../i18n';
import { getLearningResources } from '../../utils/helpResources';
import { trackUsage } from '../../utils/metrics';

const LearningResources = (): JSX.Element => {
  const { t } = useTranslation();
  const { learningResources } = getLearningResources(t);
  return (
    <Flex
      direction="column"
      alignItems="flex-start"
      gap={24}
      data-testid="learning-resources-section"
    >
      <Title level={5}>{t('title-learning-resources')}</Title>
      <Flex
        direction="column"
        alignItems="flex-start"
        gap={16}
        data-testid="learning-resource-links"
      >
        {Object.keys(learningResources).map((resource) => {
          const learningResource =
            learningResources[resource as keyof typeof learningResources];

          return (
            <Body
              muted
              level={3}
              key={`learning-resource-${learningResource?.title}`}
              onClick={() =>
                trackUsage({
                  e: 'Navigation.View.Resource.Click',
                  resource: learningResource?.title,
                  link: learningResource?.link,
                })
              }
            >
              {learningResource?.subtitle}{' '}
              <StyledResourceLink
                className="resource-link"
                href={learningResource?.link}
                target="_blank"
              >
                {learningResource?.title}
              </StyledResourceLink>
            </Body>
          );
        })}
      </Flex>
    </Flex>
  );
};

const StyledResourceLink = styled.a`
  &:hover {
    text-decoration: underline;
  }
`;

export default LearningResources;
