import {
  CognitePointCloudModel,
  WellKnownAsprsPointClassCodes,
} from '@cognite/reveal';
import React from 'react';
import Select from 'antd/lib/select';

type Props = {
  model: CognitePointCloudModel;
};

export function ClassPicker(props: Props) {
  const ALL_CLASSES = 'ALL_CLASSES';

  let userDefinedNameCounter = 0;
  const keyValueMapping = props.model.getClasses().reduce((acc, classValue) => {
    const key =
      WellKnownAsprsPointClassCodes[classValue] ||
      // eslint-disable-next-line no-plusplus
      `User defined (${userDefinedNameCounter++})`;

    acc[key] = classValue;
    return acc;
  }, {});

  const [selectedValues, setSelectedValues] = React.useState([ALL_CLASSES]);

  React.useEffect(() => {
    const classesToDisplayInModel = selectedValues.includes(ALL_CLASSES)
      ? Object.values(keyValueMapping)
      : selectedValues;

    (Object.values(keyValueMapping) as Array<
      number | WellKnownAsprsPointClassCodes
    >).forEach((classValue) => {
      props.model.setClassVisible(
        classValue,
        classesToDisplayInModel.includes(classValue)
      );
    });
  }, [selectedValues, props.model, keyValueMapping]);

  const onChange = (values) => {
    setSelectedValues(values);
  };

  return (
    <Select
      mode="multiple"
      style={{ width: 250, minHeight: 32, maxHeight: 32 }}
      value={selectedValues}
      maxTagCount={0}
      maxTagPlaceholder={
        selectedValues.includes(ALL_CLASSES)
          ? 'All classes'
          : `${selectedValues.length} selected`
      }
      onChange={onChange}
    >
      <Select.Option key="all" value={ALL_CLASSES}>
        All classes
      </Select.Option>

      {Object.keys(keyValueMapping).map((key) => (
        <Select.Option key={key as string} value={keyValueMapping[key]}>
          {key}
        </Select.Option>
      ))}
    </Select>
  );
}
