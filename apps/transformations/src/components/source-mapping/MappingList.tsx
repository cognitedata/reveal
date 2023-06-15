import styled from 'styled-components';

import { Trans, useTranslation } from '@transformations/common';
import { useSchema, useUpdateTransformation } from '@transformations/hooks';
import { TransformationRead } from '@transformations/types';
import { shouldDisableUpdatesOnTransformation } from '@transformations/utils';
import { Progress } from 'antd';

import { Button, Colors, Flex, Icon } from '@cognite/cogs.js';

import CleanFieldErrorFeedback from './CleanFieldErrorFeedback';
import CleanFieldSelector from './CleanFieldSelector';
import DestinationErrorFeedback from './DestinationErrorFeedback';
import FDMFieldErrorFeedback from './FDMFieldErrorFeedback';
import FDMFieldSelector from './FDMFieldSelector';
import RawFieldErrorFeedback from './RawFieldErrorFeedback';
import RawFieldSelector from './RawFieldSelector';
import SuggestionButton from './SuggestionButton';
import { getTransformationMapping, getUpdateMapping } from './utils';

export default function MappingList({
  transformation,
}: {
  transformation: TransformationRead;
}) {
  const { t } = useTranslation();
  const { data: destinationSchema, isInitialLoading } = useSchema({
    destination: transformation.destination,
    action: transformation.conflictMode,
  });

  const mapping = getTransformationMapping(transformation.query);
  const { mutate, isLoading } = useUpdateTransformation();

  const clearFields = async () => {
    if (mapping) {
      return mutate(
        getUpdateMapping(transformation, {
          ...mapping,
          mappings: mapping.mappings.map((m) => ({ ...m, from: '' })),
        })
      );
    }
  };

  if (!mapping?.sourceLevel1 || !mapping?.sourceLevel1) {
    return null;
  }

  const fieldCount = mapping?.mappings.length || 0;
  const doneCount = mapping?.mappings.filter((m) => !!m.from).length || 0;
  const requiredCount = destinationSchema?.filter((r) => !r.nullable).length;

  const mapped = mapping?.mappings.filter((m) => !!m.from);
  const required = destinationSchema
    ?.filter((r) => !r.nullable)
    .map((r) => r.name);
  const requiredMappedCount = mapped?.filter(({ to }) =>
    required?.includes(to)
  ).length;

  if (isInitialLoading) {
    return (
      <Flex
        alignItems="center"
        justifyContent="space-around"
        style={{ flexGrow: 1 }}
      >
        <Icon type="Loader" size={24} />
      </Flex>
    );
  }

  return (
    <ListContainer>
      <CleanFieldErrorFeedback transformation={transformation} />
      <RawFieldErrorFeedback transformation={transformation} />
      <FDMFieldErrorFeedback transformation={transformation} />
      <DestinationErrorFeedback transformation={transformation} />
      {mapping &&
        mapping.mappings.map(
          (m, i) =>
            m && (
              <Flex alignItems="center" key={`${m.from}.${m.to}`}>
                <div style={{ flexGrow: 1 }}>
                  {mapping.sourceType === 'raw' && (
                    <RawFieldSelector
                      disabled={shouldDisableUpdatesOnTransformation(
                        transformation
                      )}
                      transformation={transformation}
                      from={m.from}
                      to={m.to}
                      update={(from) => {
                        mapping.mappings[i].from = from;
                        mapping.mappings[i].asType = destinationSchema?.find(
                          (s) => s.name === m.to
                        )?.sqlType;
                        mutate(getUpdateMapping(transformation, mapping));
                      }}
                    />
                  )}
                  {mapping.sourceType === 'clean' && (
                    <CleanFieldSelector
                      disabled={shouldDisableUpdatesOnTransformation(
                        transformation
                      )}
                      transformation={transformation}
                      from={m.from}
                      to={m.to}
                      update={(from) => {
                        mapping.mappings[i].from = from;
                        mapping.mappings[i].asType = destinationSchema?.find(
                          (s) => s.name === m.to
                        )?.sqlType;
                        mutate(getUpdateMapping(transformation, mapping));
                      }}
                    />
                  )}
                  {mapping.sourceType === 'fdm' && (
                    <FDMFieldSelector
                      disabled={shouldDisableUpdatesOnTransformation(
                        transformation
                      )}
                      transformation={transformation}
                      from={m.from}
                      to={m.to}
                      update={(from) => {
                        mapping.mappings[i].from = from;
                        mapping.mappings[i].asType = destinationSchema?.find(
                          (s) => s.name === m.to
                        )?.sqlType;
                        mutate(getUpdateMapping(transformation, mapping));
                      }}
                    />
                  )}
                </div>
              </Flex>
            )
        )}

      <FieldBottomRow>
        <Flex direction="column">
          <Flex justifyContent="space-between" alignItems="center">
            <Trans
              components={{
                span: <Span />,
                strong: <StrongText />,
                i: <MutedText />,
              }}
              i18nKey="source-mapped-field-count"
              values={{
                doneCount,
                totalCount: fieldCount,
                requiredDoneCount: requiredMappedCount,
                requiredTotalCount: requiredCount,
              }}
            />
          </Flex>
          <Progress
            percent={(doneCount / fieldCount) * 100}
            showInfo={false}
            strokeColor={`${Colors['text-icon--interactive--pressed']}`}
          />
        </Flex>
        <Flex gap={10}>
          <SuggestionButton transformation={transformation} />
          {doneCount > 0 && (
            <Button onClick={clearFields} disabled={isLoading}>
              {t('clear-all')}
            </Button>
          )}
        </Flex>
      </FieldBottomRow>
    </ListContainer>
  );
}

const Span = styled.span`
  max-width: 300px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const StrongText = styled.strong`
  color: ${Colors['text-icon--strong']};
  font-weight: 500;
`;

const MutedText = styled.span`
  color: ${Colors['text-icon--muted']};
`;

const FieldBottomRow = styled(Flex).attrs({
  justifyContent: 'space-between',
  alignItems: 'center',
})`
  background-color: white;
  position: absolute;
  bottom: 0;
  left: 0;
  border-radius: 0 0 6px 6px;
  border-top: 1px solid ${Colors['border--muted']};
  padding: 8px 12px;
  width: 100%;
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 60px;
  overflow: auto;
  width: 100%;
`;
