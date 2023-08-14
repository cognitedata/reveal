import styled from 'styled-components';

import { Body, Button, Colors, Flex, Select, Title } from '@cognite/cogs.js';

import { RESPONSIVE_BREAKPOINT } from '../../common/constants';
import { VerticalTab } from '../../common/types';
import { useIsScreenWideEnough } from '../../hooks/useIsScreenWideEnough';
import { OnTrackEvent, tabChangeEvent } from '../../metrics';

export type VerticalTabsProps = {
  activeKey: string;
  onChange: (key: string) => void;
  builtinTabs: VerticalTab[];
  additionalTabs?: VerticalTab[];
  additionalTabsCategoryLabel?: string;
  onTrackEvent?: OnTrackEvent;
};

export const VerticalTabs = ({
  activeKey,
  onChange,
  builtinTabs,
  additionalTabs = [],
  additionalTabsCategoryLabel,
  onTrackEvent,
}: VerticalTabsProps): JSX.Element => {
  const handleChange = (key: string): void => {
    onChange(key);
  };
  const isScreenWideEnough = useIsScreenWideEnough();
  const builtinTabsOptions = builtinTabs.map(({ key, title }) => ({
    label: `${title}${key === 'language' ? ' (Beta)' : ''}`,
    value: key,
  }));
  const additionalTabsOptions = additionalTabs.map(({ key, title }) => ({
    label: title,
    value: key,
  }));

  if (!isScreenWideEnough) {
    return (
      <Container direction="column">
        <StyledSelect
          onChange={(option: { label: string; value: string }) => {
            onTrackEvent?.(tabChangeEvent, { tabKey: option.value });
            handleChange(option.value);
          }}
          options={[
            { options: builtinTabsOptions },
            {
              label: additionalTabsCategoryLabel,
              options: additionalTabsOptions,
            },
          ]}
          value={[...builtinTabsOptions, ...additionalTabsOptions].find(
            ({ value }) => value === activeKey
          )}
        />
      </Container>
    );
  }

  return (
    <Container direction="column" gap={4}>
      {builtinTabs.map(({ key, icon, title }) => (
        <TabButton
          key={key}
          icon={icon}
          onClick={() => {
            onTrackEvent?.(tabChangeEvent, { tabKey: key });
            handleChange(key);
          }}
          toggled={activeKey === key}
          type="ghost"
        >
          {title} {key === 'language' && <BetaLabel />}
        </TabButton>
      ))}
      {additionalTabsCategoryLabel && (
        <Title level={6} muted style={{ margin: '32px 0 12px 0' }}>
          {additionalTabsCategoryLabel}
        </Title>
      )}
      {additionalTabs.map(({ key, icon, title }) => (
        <TabButton
          key={key}
          icon={icon}
          onClick={() => {
            onTrackEvent?.(tabChangeEvent, { tabKey: key });
            handleChange(key);
          }}
          toggled={activeKey === key}
          type="ghost"
        >
          {title}
        </TabButton>
      ))}
    </Container>
  );
};

const Container = styled(Flex)`
  padding: 0 0 16px 16px;

  @media (max-width: ${RESPONSIVE_BREAKPOINT}px) {
    background-color: ${Colors['surface--strong']};
    padding: 0 16px 16px 16px;
  }
`;

const TabButton = styled(Button)`
  justify-content: flex-start !important;
`;

const StyledSelect = styled(Select)`
  background-color: ${Colors['surface--muted']};
`;

const BetaLabel = () => (
  <StyledBetaLabel size="x-small" strong inverted>
    Beta
  </StyledBetaLabel>
);

const StyledBetaLabel = styled(Body)`
  background-color: ${Colors['surface--muted--inverted']};
  padding: 2px 8px;
  border-radius: 10000px;
  margin-left: 8px;
`;
