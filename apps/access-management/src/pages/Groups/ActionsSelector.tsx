import React, { useState, useEffect } from 'react';

import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';

import { getCapabilityActions, getActionLabel } from './utils';
import { useTranslation } from 'common/i18n';

interface ActionsSelectorProps {
  capabilityType: string;
  value?: string[];
  onChange(actions: CheckboxValueType[]): void;
}

const ActionsSelector = (props: ActionsSelectorProps) => {
  const { capabilityType, value = [], onChange } = props;
  const { t } = useTranslation();

  const [indeterminate, setIndeterminate] = useState<boolean>(false);
  const [checkAll, setCheckAll] = useState<boolean>(false);

  const actions = getCapabilityActions(capabilityType);

  const options = actions.map((action) => ({
    label: getActionLabel(capabilityType, action),
    value: action,
  }));

  const handleCheckAll = (values: CheckboxValueType[]) => {
    setIndeterminate(values.length !== 0 && values.length !== options.length);
    setCheckAll(values.length === options.length);
  };

  useEffect(() => {
    handleCheckAll(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const onCheckAllChange = (e: CheckboxChangeEvent) => {
    if (e.target.checked) {
      onChange(actions);
    } else {
      onChange([]);
    }
    setIndeterminate(false);
    setCheckAll(e.target.checked);
  };

  return (
    <>
      <Checkbox
        indeterminate={indeterminate}
        onChange={onCheckAllChange}
        checked={checkAll}
      >
        {t('check-all')}
      </Checkbox>
      <Checkbox.Group
        value={value}
        onChange={onChange}
        style={{ display: 'block', paddingLeft: 20 }}
      >
        {options.map((option) => (
          <div style={{ margin: '10px 0' }}>
            <Checkbox
              key={option.value}
              value={option.value}
              checked={actions.includes(option.value)}
            >
              {option.label}
            </Checkbox>
          </div>
        ))}
      </Checkbox.Group>
    </>
  );
};

export default ActionsSelector;
