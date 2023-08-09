import styled from 'styled-components';

import { Button } from '@cognite/cogs.js';

import { Widget } from '../../../../../components/widget/Widget';
import { useHorizontalScroll } from '../../../../../hooks/listeners/useHorizontalScroll';
import { useNavigation } from '../../../../../hooks/useNavigation';
import { useTranslation } from '../../../../../hooks/useTranslation';
import { useInstanceDirectRelationshipQuery } from '../../../../../services/instances/generic/queries/useInstanceDirectRelationshipQuery';
import { InstancePreview } from '../../../../preview/InstancePreview';
import { FDXFilePreview } from '../../../File/FilePreview';
import { RelationshipEdgesProps } from '../../RelationshipEdgesWidget';

export const FileRelationshipEdgesExpanded: React.FC<
  RelationshipEdgesProps
> = ({ type }) => {
  const { t } = useTranslation();
  const scrollRef = useHorizontalScroll();
  const navigate = useNavigation();

  const { data, isLoading, status } = useInstanceDirectRelationshipQuery<
    ({
      externalId: string;
    } | null)[]
  >(type);

  return (
    <Container ref={scrollRef}>
      {(data || [])?.map((item) => {
        if (!item) {
          return null;
        }

        return (
          <Widget expanded key={item.externalId}>
            <Widget.Header title={item.externalId}>
              <InstancePreview.File id={item.externalId}>
                <Button
                  onClick={() => {
                    navigate.toFilePage(item.externalId);
                  }}
                  disabled={isLoading}
                >
                  {t('GENERAL_OPEN')}
                </Button>
              </InstancePreview.File>
            </Widget.Header>
            <Widget.Body noPadding state={status}>
              <Content>
                <FDXFilePreview id="relationship" fileId={item.externalId} />
              </Content>
            </Widget.Body>
          </Widget>
        );
      })}
    </Container>
  );
};

const Content = styled.div`
  height: 50vh;
  width: 800px;
  padding-bottom: 8px;
`;

const Container = styled.div`
  display: flex;
  width: 100%;
  gap: 8px;
  overflow: auto;
`;
