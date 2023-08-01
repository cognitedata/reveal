import { Flex, InputExp, Title } from '@cognite/cogs.js';

import { UserInfo } from '../../common/types';
import { useIsScreenWideEnough } from '../../hooks/useIsScreenWideEnough';

export type PersonalInfoTabProps = {
  userInfo?: UserInfo;
  isUserInfoLoading?: boolean;
  title?: string;
  nameFieldLabel?: string;
  nameFieldHelpText?: string;
  emailFieldLabel?: string;
  emailFieldHelpText?: string;
};

export const PersonalInfoTab = ({
  userInfo,
  isUserInfoLoading,
  title = 'Personal info',
  nameFieldLabel = 'Name',
  nameFieldHelpText = 'Contact your administrator if you want to change your name',
  emailFieldLabel = 'Email address',
  emailFieldHelpText = 'Contact your administrator if you want to change your name or email address',
}: PersonalInfoTabProps): JSX.Element => {
  const name = userInfo?.name ?? '';
  const email = userInfo?.email ?? '';
  const isScreenWideEnough = useIsScreenWideEnough();

  return (
    <Flex direction="column" gap={24}>
      {isScreenWideEnough && (
        <Flex direction="column" gap={4}>
          <Title level={4}>{title}</Title>
        </Flex>
      )}
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
