import React from 'react';

import { Select } from 'antd';

import { PointColorType } from '@cognite/reveal';

const { Option } = Select;

const options: Record<number, string> = {
  [PointColorType.Rgb]: 'Color (RGB)',
  [PointColorType.Classification]: 'Classification',
  [PointColorType.Depth]: 'Depth',
  [PointColorType.Height]: 'Height',
  [PointColorType.Intensity]: 'Intensity',
};

type Props = {
  onChange: (colorType: PointColorType) => void;
};

export function ColorTypePicker({ onChange }: Props) {
  return (
    <div title="Point color type">
      <Select
        defaultValue={PointColorType.Rgb}
        style={{ width: '100%' }}
        onChange={onChange}
      >
        {Object.keys(options)
          .map((x) => +x as PointColorType) // Convert keys from string to PointColorType
          .map((key) => (
            <Option key={key} value={key}>
              {options[key]}
            </Option>
          ))}
      </Select>
    </div>
  );
}
