import React from 'react';
import { Select } from 'antd';
import { PotreePointColorType } from '@cognite/reveal';

const { Option } = Select;

const options: Record<PotreePointColorType, string> = {
  [PotreePointColorType.Rgb]: 'RGB',
  [PotreePointColorType.Classification]: 'Classification',
  [PotreePointColorType.Depth]: 'Depth',
  [PotreePointColorType.Height]: 'Height',
  [PotreePointColorType.PointIndex]: 'Point index',
  [PotreePointColorType.Intensity]: 'Intensity',
};

type Props = {
  onChange: (colorType: PotreePointColorType) => void;
};

export function ColorTypePicker({ onChange }: Props) {
  return (
    <div title="Point color type">
      <Select
        defaultValue={PotreePointColorType.Rgb}
        style={{ width: 140 }}
        onChange={onChange}
      >
        {(Object.values(PotreePointColorType) as Array<PotreePointColorType>)
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
