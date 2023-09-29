import styled from 'styled-components';

import { ActionList, ActionListItemProps } from '@cognite/cogs-lab';
import { Colors, Flex, Select } from '@cognite/cogs.js';

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
    <Container direction="column">
      <ActionList>
        <ActionList.Section>
          {builtinTabs.map(({ key, icon, title }) => (
            <ActionList.Item
              key={key}
              icon={(icon as ActionListItemProps['icon']) || undefined}
              onClick={() => {
                onTrackEvent?.(tabChangeEvent, { tabKey: key });
                handleChange(key);
              }}
              toggled={activeKey === key}
              promoChipOptions={
                key === 'language' ? { label: 'Beta' } : undefined
              }
            >
              {title}
            </ActionList.Item>
          ))}
        </ActionList.Section>
        {additionalTabs && additionalTabs.length ? (
          <ActionList.Section label={additionalTabsCategoryLabel}>
            {additionalTabs.map(({ key, icon, title }) => (
              <ActionList.Item
                key={key}
                icon={(icon as ActionListItemProps['icon']) || undefined}
                onClick={() => {
                  onTrackEvent?.(tabChangeEvent, { tabKey: key });
                  handleChange(key);
                }}
                toggled={activeKey === key}
              >
                {title}
              </ActionList.Item>
            ))}
          </ActionList.Section>
        ) : null}
      </ActionList>
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

const StyledSelect = styled(Select)`
  background-color: ${Colors['surface--muted']};
`;
