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
  const ALL_CLASSES = -Infinity;

  let userDefinedNameCounter = 0;
  const keyValueMapping: Record<
    string,
    number
  > = props.model.getClasses().reduce((acc, classValue) => {
    const key =
      WellKnownAsprsPointClassCodes[classValue] ||
      // eslint-disable-next-line no-plusplus
      `User defined (${userDefinedNameCounter++})`;

    if (key.startsWith('ReservedOr')) {
      const betterKey = key.slice('ReservedOr'.length);
      acc[`${betterKey} (legacy)`] = classValue;
    } else {
      acc[key] = classValue;
    }

    return acc;
  }, {});

  const [selectedValues, setSelectedValues] = React.useState(
    [ALL_CLASSES].concat(Object.values(keyValueMapping))
  );

  React.useEffect(() => {
    const classesToDisplayInModel: number[] = selectedValues.includes(
      ALL_CLASSES
    )
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
  }, [selectedValues, props.model, keyValueMapping, ALL_CLASSES]);

  const onChange = (values: number[]) => {
    const getValues = ({
      nextValues,
      prevValues,
    }: {
      nextValues: number[];
      prevValues: number[];
    }) => {
      if (prevValues.includes(ALL_CLASSES)) {
        // something else changed - remove ALL_CLASSES option
        if (nextValues.includes(ALL_CLASSES)) {
          return nextValues.filter((v) => v !== ALL_CLASSES);
        }

        // deselect all
        return [];
      }

      // select all
      if (nextValues.includes(ALL_CLASSES)) {
        return [ALL_CLASSES].concat(Object.values(keyValueMapping));
      }

      // add ALL_CLASSES when all is selected
      if (nextValues.length === Object.values(keyValueMapping).length) {
        return nextValues.concat(ALL_CLASSES);
      }

      return values;
    };

    setSelectedValues(
      getValues({ nextValues: values, prevValues: selectedValues })
    );
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
        // key is key+value to avoid duplicates after trimming of ReservedOr strings
        <Select.Option
          key={`${key} ${keyValueMapping[key]}`}
          value={keyValueMapping[key]}
        >
          {key}
        </Select.Option>
      ))}
    </Select>
  );
}
