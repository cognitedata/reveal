import { Body, Flex, InputExp, Title } from '@cognite/cogs.js';

import { UserInfo } from '../../common/types';

export type PersonalInfoTabProps = {
  userInfo?: UserInfo;
  isUserInfoLoading?: boolean;
  title?: string;
  subtitle?: string;
  nameFieldLabel?: string;
  nameFieldHelpText?: string;
  emailFieldLabel?: string;
  emailFieldHelpText?: string;
};

export const PersonalInfoTab = ({
  userInfo,
  isUserInfoLoading,
  title = 'Personal info',
  subtitle = 'Information about you across Cognite Data Fusion',
  nameFieldLabel = 'Name',
  nameFieldHelpText = 'Your display name is managed by your organisation',
  emailFieldLabel = 'Email address',
  emailFieldHelpText = 'Your name and email address are managed by your organization',
}: PersonalInfoTabProps): JSX.Element => {
  const name = userInfo?.name ?? '';
  const email = userInfo?.email ?? '';

  return (
    <Flex direction="column" gap={24}>
      <Flex direction="column" gap={4}>
        <Title level={4}>{title}</Title>
        <Body level={2}>{subtitle}</Body>
      </Flex>
      <Flex direction="column" gap={24}>
        <InputExp
          disabled
          fullWidth
          helpText={!email ? nameFieldHelpText : undefined}
          icon={isUserInfoLoading ? 'Loader' : undefined}
          label={{
            info: undefined,
            required: true,
            text: nameFieldLabel,
          }}
          size="large"
          value={name}
        />
        {!!email && (
          <InputExp
            disabled
            fullWidth
            helpText={emailFieldHelpText}
            icon={isUserInfoLoading ? 'Loader' : undefined}
            label={{
              info: undefined,
              required: true,
              text: emailFieldLabel,
            }}
            size="large"
            value={email}
          />
        )}
      </Flex>
    </Flex>
  );
};
