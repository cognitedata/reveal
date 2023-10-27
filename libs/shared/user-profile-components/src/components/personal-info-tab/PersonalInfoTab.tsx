import { InputExp } from '@cognite/cogs.js';

import { UserInfo } from '../../common/types';
import { TabContent } from '../tab-content/TabContent';

export type PersonalInfoTabProps = {
  userInfo?: UserInfo;
  isUserInfoLoading?: boolean;
  nameFieldLabel?: string;
  nameFieldHelpText?: string;
  emailFieldLabel?: string;
  emailFieldHelpText?: string;
};

export const PersonalInfoTab = ({
  userInfo,
  isUserInfoLoading,
  nameFieldLabel = 'Name',
  nameFieldHelpText = 'Contact your administrator if you want to change your name',
  emailFieldLabel = 'Email address',
  emailFieldHelpText = 'Contact your administrator if you want to change your name or email address',
}: PersonalInfoTabProps): JSX.Element => {
  const name = userInfo?.name ?? '';
  const email = userInfo?.email ?? '';

  return (
    <TabContent.Container>
      <TabContent.Body>
        <InputExp
          disabled
          fullWidth
          helpText={!email ? nameFieldHelpText : undefined}
          icon={isUserInfoLoading ? 'Loader' : undefined}
          label={{
            info: undefined,
            required: false,
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
              required: false,
              text: emailFieldLabel,
            }}
            size="large"
            value={email}
          />
        )}
      </TabContent.Body>
    </TabContent.Container>
  );
};
