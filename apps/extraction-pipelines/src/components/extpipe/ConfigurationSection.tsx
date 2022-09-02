import React from 'react';
import { useTranslation } from 'common';
import { useExtpipeConfig } from 'hooks/config';
import { Section } from './Section';
import { StyledTooltip } from 'components/styled';
import ConfigurationEditor from './ConfigurationEditor';

type Props = {
  externalId: string;
};
export default function ConfigurationSection({ externalId }: Props) {
  const { t } = useTranslation();

  const { data: configuration, isLoading } = useExtpipeConfig({
    externalId,
  });

  const created = configuration?.createdTime
    ? new Date(configuration?.createdTime)
    : undefined;

  return (
    <Section
      title={t('configuration')}
      icon={isLoading ? 'Loader' : 'Document'}
      dataTestId="configuration"
      rightTitle={
        created && (
          <StyledTooltip content={new Date(created).toUTCString()}>
            <>
              {new Intl.DateTimeFormat(undefined, {
                day: '2-digit',
                month: 'short',
                year: '2-digit',
              }).format(new Date(created))}
            </>
          </StyledTooltip>
        )
      }
    >
      <ConfigurationEditor externalId={externalId} />
    </Section>
  );
}
