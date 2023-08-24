import { useEffect } from 'react';
import { Control, Controller } from 'react-hook-form';

import styled from 'styled-components';

import { getVisibility } from '@charts-app/domain/chart/internal/transformers/getVisibility';
import { useTranslations } from '@charts-app/hooks/translations';
import { useChartAtom } from '@charts-app/models/chart/atom';
import { makeDefaultTranslations } from '@charts-app/utils/translations';
import { SharedUsersList, UserSearchInput } from '@fusion/industry-canvas';

import { Flex, Infobox } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';

import { CreateMonitoringJobFormData } from './types';

const defaultTranslations = makeDefaultTranslations(
  'Add subscribers',
  'At least 1 subscriber is required',
  'This chart is private. Make it public to add more subscribers.'
);

type Props = {
  control: Control<CreateMonitoringJobFormData, any>;
  title: string;
};

export const SubscribeJob = ({ control, title }: Props) => {
  const t = {
    ...defaultTranslations,
    ...useTranslations(Object.keys(defaultTranslations), 'MonitoringSidebar').t,
  };
  const [chart] = useChartAtom();
  const isPublicChart = getVisibility(chart);

  const sdk = useSDK();

  useEffect(() => {
    sdk
      .get(`/api/v1/projects/${sdk.project}/profiles/me`)
      .then((res) => console.log('wow', res));
  }, []);

  return (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    <Controller
      control={control}
      name="subscribers"
      rules={{
        required: t['At least 1 subscriber is required'],
      }}
      render={({ field: { onChange, value } }) => {
        return (
          <StyledFlex direction="column" gap={4}>
            <div style={{ marginBottom: '4px' }}>{title}</div>
            {isPublicChart ? (
              <UserSearchInput
                onUserSelected={(user) => {
                  onChange([...value, user]);
                }}
                placeholder={t['Add subscribers']}
              />
            ) : null}

            <SharedUsersList
              size="x-small"
              ownerProfile={value[0]}
              sharedUsers={value.slice(1)}
              onUserRemoved={(userId) => {
                const indexToRemove = value.findIndex(
                  (user) => user.userIdentifier === userId
                );
                const newValues = [...value];
                newValues.splice(indexToRemove, 1);
                onChange(newValues);
              }}
            />
            {!isPublicChart ? (
              <Infobox type="neutral">
                {
                  t[
                    'This chart is private. Make it public to add more subscribers.'
                  ]
                }
              </Infobox>
            ) : null}
          </StyledFlex>
        );
      }}
    />
  );
};

const StyledFlex = styled(Flex)`
  margin-top: 8px;
`;
