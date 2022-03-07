import { Body, Button, Flex } from '@cognite/cogs.js';
import { Page, PageContent, PageHeader } from 'src/components/page';
import React from 'react';
import styled from 'styled-components';
import Search from 'src/images/illustrations/search.svg';
import { noAccessConfig } from 'src/configs/global.config';
import { useNavigation } from 'src/hooks/useNavigation';

const Container = styled.div`
  background-color: rgb(237, 240, 255);
  border-radius: 8px;
  padding: 1rem;
  height: fit-content;
  margin-bottom: 2rem;

  li {
    color: rgb(66, 85, 187);
  }
`;

const Image = styled.img`
  width: 150px;
  margin-bottom: 5rem;
`;

const Content = styled.div`
  width: 35rem;
`;

const Text = styled(Body).attrs({ as: 'p', level: 2 })``;

interface Props {
  missingPermissions: string[];
}

export const NoAccessPage: React.FC<Props> = ({ missingPermissions }) => {
  const { toDashboard } = useNavigation();

  return (
    <Page
      Widget={
        <Button icon="ArrowLeft" onClick={toDashboard}>
          Back to dashboard
        </Button>
      }
    >
      <PageHeader
        title={noAccessConfig.TITLE}
        description={noAccessConfig.TITLE_DESCRIPTION}
      />

      <PageContent>
        <Flex gap={32}>
          <Content>
            <Container>
              <Text strong>{noAccessConfig.PERMISSION_TITLE}</Text>
              {missingPermissions.map((permission) => (
                <li key={permission}>{permission}</li>
              ))}
            </Container>

            <Text>{noAccessConfig.PERMISSION_SUBTITLE_1}</Text>

            <Text>
              {noAccessConfig.PERMISSION_SUBTITLE_2}
              <a href={noAccessConfig.documentation.URL}>
                {noAccessConfig.documentation.TITLE}
              </a>
            </Text>
          </Content>

          <Image src={Search} alt="Empty illustration" />
        </Flex>
      </PageContent>
    </Page>
  );
};
