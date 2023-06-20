import { Body, Flex, InputExp, Title } from '@cognite/cogs.js';

export type UserInfo = {
  name?: string;
  email?: string;
};

export type PersonalInfoTabProps = {
  loading?: boolean;
  userInfo?: UserInfo;
  locale?: PersonalInfoTabLocale;
};

export type PersonalInfoTabLocale = {
  translations: {
    'personal-info-tab-title': string;
    'personal-info-tab-subtitle': string;
    'name-field-label': string;
    'email-field-label': string;
    'email-field-help-text': string;
  };
};

const DEFAULT_LOCALE: PersonalInfoTabLocale = {
  translations: {
    'personal-info-tab-title': 'Personal info',
    'personal-info-tab-subtitle':
      'Information about you across Cognite Data Fusion',
    'name-field-label': 'Name',
    'email-field-label': 'Email address',
    'email-field-help-text':
      'Your name and email address are managed by your organization',
  },
};

export const PersonalInfoTab = ({
  loading,
  userInfo,
  locale = DEFAULT_LOCALE,
}: PersonalInfoTabProps): JSX.Element => {
  const name = userInfo?.name ?? '';
  const email = userInfo?.email ?? '';

  return (
    <Flex direction="column" gap={24}>
      <Flex direction="column" gap={4}>
        <Title level={4}>
          {locale.translations['personal-info-tab-title']}
        </Title>
        <Body level={2}>
          {locale.translations['personal-info-tab-subtitle']}
        </Body>
      </Flex>
      <Flex direction="column" gap={24}>
        <InputExp
          disabled
          fullWidth
          icon={loading ? 'Loader' : undefined}
          label={{
            info: undefined,
            required: true,
            text: locale.translations['name-field-label'],
          }}
          size="large"
          value={name}
        />
        <InputExp
          disabled
          fullWidth
          helpText={locale.translations['email-field-help-text']}
          icon={loading ? 'Loader' : undefined}
          label={{
            info: undefined,
            required: true,
            text: locale.translations['email-field-label'],
          }}
          size="large"
          value={email}
        />
      </Flex>
    </Flex>
  );
};
