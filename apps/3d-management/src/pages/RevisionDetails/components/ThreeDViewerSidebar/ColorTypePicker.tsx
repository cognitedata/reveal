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
        {(Object.values(PointColorType) as Array<PointColorType>)
          .filter((type) => options[type])
          .map((type) => (
            <Option key={type} value={type}>
              {options[type]}
            </Option>
          ))}
      </Select>
    </div>
  );
}
