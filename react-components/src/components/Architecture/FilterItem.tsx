/*!
 * Copyright 2024 Cognite AS
 */

import { useCallback, useEffect, useState, type ReactElement } from 'react';
import { SelectPanel } from '@cognite/cogs-lab';
import { useTranslation } from '../i18n/I18n';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import styled from 'styled-components';
import { type Color } from 'three';
import { type BaseFilterItemCommand } from '../../architecture/base/commands/BaseFilterCommand';

export const FilterItem = ({ command }: { command: BaseFilterItemCommand }): ReactElement => {
  const { t } = useTranslation();

  // @update-ui-component-pattern
  const [isChecked, setChecked] = useState<boolean>(false);
  const [isEnabled, setEnabled] = useState<boolean>(true);
  const [isVisible, setVisible] = useState<boolean>(true);
  const [uniqueId, setUniqueId] = useState<number>(0);

  const update = useCallback((command: BaseCommand) => {
    setChecked(command.isChecked);
    setEnabled(command.isEnabled);
    setVisible(command.isVisible);
    setUniqueId(command.uniqueId);
  }, []);

  useEffect(() => {
    update(command);
    command.addEventListener(update);
    return () => {
      command.removeEventListener(update);
    };
  }, [command]);
  // @end

  if (!isVisible) {
    return <></>;
  }
  return (
    <SelectPanel.Item
      key={uniqueId}
      disabled={!isEnabled}
      checked={isChecked}
      variant="checkbox"
      trailingContent={
        <CenteredContainer>
          {command.color !== undefined && <ColorBox backgroundColor={command.color} />}
        </CenteredContainer>
      }
      onClick={() => {
        command.invoke();
      }}
      label={command.getLabel(t)}
    />
  );
};

const ColorBox = styled.div<{ backgroundColor: Color }>`
  width: 16px;
  height: 16px;
  display: inline-block;
  border-radius: 4px;
  background-color: ${(props) => props.backgroundColor.getStyle()};
`;

const CenteredContainer = styled.div`
  padding: 0px 1px;
  display: flex;
  row-gap: 3px;
  gap: 4px;
  align-items: center;
`;
