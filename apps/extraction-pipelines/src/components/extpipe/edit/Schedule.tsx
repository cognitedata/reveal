import React, { FunctionComponent, PropsWithChildren } from 'react';
import { A, Colors, Detail, Flex, Input } from '@cognite/cogs.js';
import { SupportedScheduleStrings } from 'components/extpipes/cols/Schedule';
import styled from 'styled-components';
import { parseCron as parseCronUtil } from 'utils/cronUtils';
import { CRON_LINK } from 'utils/constants';
import { ScheduleSelector } from 'components/inputs/ScheduleSelector';
import { useTranslation } from 'common';
import Field from '../fields/Field';
import { FormikErrors } from 'formik';
import { BasicInformationFormFields } from '../BasicInformationModal';

export interface ScheduleFormInput {
  schedule: string;
  cron: string;
}

interface ScheduleProps {
  errors: FormikErrors<BasicInformationFormFields>;
  setFieldValue: <T extends keyof BasicInformationFormFields>(
    field: T,
    value: BasicInformationFormFields[T],
    shouldValidate?: boolean
  ) => void;
  values: BasicInformationFormFields;
}

export const convertScheduleValue = (
  schedule: string
): SupportedScheduleStrings => {
  if (
    schedule !== SupportedScheduleStrings.CONTINUOUS &&
    schedule !== SupportedScheduleStrings.NOT_DEFINED &&
    schedule !== SupportedScheduleStrings.ON_TRIGGER
  ) {
    return SupportedScheduleStrings.SCHEDULED;
  }
  return schedule;
};

const parseCron = (exp: string) => {
  try {
    const parsed = parseCronUtil(exp);
    return parsed;
  } catch (_) {
    return undefined;
  }
};

export const Schedule: FunctionComponent<ScheduleProps> = ({
  errors,
  setFieldValue,
  values,
}: PropsWithChildren<ScheduleProps>) => {
  const { t } = useTranslation();

  const shouldShowCron = values.schedule === SupportedScheduleStrings.SCHEDULED;

  const parsedCron = values.cron && parseCron(values.cron);

  return (
    <Flex direction="column">
      <ScheduleSelector
        schedule={values.schedule}
        onSelectChange={(option) => setFieldValue('schedule', option.value)}
      />
      {shouldShowCron && (
        <StyledCronWrapper id="cron-expression">
          <Field isRequired title={t('cron-title')}>
            <StyledCronDescription>{t('cron-info')}</StyledCronDescription>
            <Detail>
              <A href={CRON_LINK}>{t('cron-learn-more')}</A>
            </Detail>
            <Input
              error={errors.cron}
              fullWidth
              name="cron"
              onChange={(e) => setFieldValue('cron', e.target.value)}
              placeholder={t('description-placeholder')}
              value={values.cron}
            />
            {parsedCron && (
              <StyledCronDescription>{parsedCron}</StyledCronDescription>
            )}
          </Field>
        </StyledCronWrapper>
      )}
    </Flex>
  );
};

const StyledCronWrapper = styled.div`
  border-top: 0.0625rem solid ${Colors['greyscale-grey3'].hex()};
  display: flex;
  margin: 1rem 0 0 2rem;
  padding-top: 0.5rem;

  > * {
    width: 100%;
  }
`;

const StyledCronDescription = styled(Detail)`
  color: ${Colors['text-icon--muted']};
`;
