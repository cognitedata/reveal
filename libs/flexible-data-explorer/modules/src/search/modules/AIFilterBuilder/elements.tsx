import {
  Styles,
  SelectComponentsConfig,
  components as ReactSelectComponents,
} from 'react-select';

import {
  ButtonProps,
  ConjsProps,
  FieldItems,
  FieldProps,
  TextWidgetProps,
} from '@react-awesome-query-builder/ui';
import Creatable from 'react-select/creatable';

import {
  Body,
  Button,
  Checkbox,
  Flex,
  Icon,
  IconType,
  Input,
  OptionType,
  SegmentedControl,
  Select,
} from '@cognite/cogs.js';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const selectStyles: Partial<Styles> = {
  container: (style: CSSRuleList) => ({
    ...style,
    width: '100%',
  }),
  valueContainer: (style: CSSRuleList) => ({
    ...style,
    flexWrap: 'nowrap',
    height: 32,
  }),
  control: (style: CSSRuleList) => ({
    ...style,
    border: '2px solid var(--cogs-border-default)',
    height: 36,
    minHeight: 36,
  }),
  indicatorsContainer: (style: CSSRuleList) => ({
    ...style,
    height: 32,
  }),
  option: (style: CSSRuleList) => ({
    ...style,
    background: 'white',
    color: 'black',
    textAlign: 'left',
  }),
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const components: SelectComponentsConfig<{
  label: string;
  value: string | number;
  title?: string;
}> = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  SingleValue: (newProps) => (
    <ReactSelectComponents.SingleValue {...newProps}>
      {newProps.data.title || newProps.data.label}
    </ReactSelectComponents.SingleValue>
  ),
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  Option: (newProps) => (
    <Flex
      {...newProps.innerProps}
      alignItems="center"
      style={{
        cursor: 'pointer',
        padding: '4px 8px',
        color: newProps.data.__isNew__
          ? 'var(--cogs-border--status-neutral--strong)'
          : 'var(--cogs-text-icon--strong)',
      }}
    >
      <Body level={2} style={{ flex: 1, textAlign: 'start' }}>
        {newProps.label}
      </Body>
      <Icon type={newProps.data.__isNew__ ? 'Add' : 'Checkmark'} />
    </Flex>
  ),
};

export const ConjunctionButtons = (props: ConjsProps) => {
  const {
    readonly,
    disabled,
    not,
    conjunctionOptions = {},
    config = { settings: { forceShowConj: true } },
    setConjunction,
    notLabel,
    showNot,
    setNot,
  } = props;
  const lessThenTwo = disabled;
  const { forceShowConj } = config.settings;
  const items = Object.values(conjunctionOptions);
  const conjsCount = items.length;
  const showConj = forceShowConj || (conjsCount > 1 && !lessThenTwo);

  return (
    <>
      {showNot && (readonly ? not : true) && (
        <Checkbox
          key="group-not"
          style={{ marginLeft: 4 }}
          onChange={() => setNot(!not)}
          checked={not}
          disabled={readonly}
        >
          {notLabel}
        </Checkbox>
      )}
      <SegmentedControl
        style={{ marginLeft: 16 }}
        disabled={showConj}
        onButtonClicked={(key) => setConjunction(key)}
        currentKey={
          Object.values(conjunctionOptions).find((el) => el.checked)!.key
        }
      >
        <SegmentedControl.Button key={items[0].key} disabled={disabled}>
          {items[0].label}
        </SegmentedControl.Button>
        <SegmentedControl.Button key={items[1].key} disabled={disabled}>
          {items[1].label}
        </SegmentedControl.Button>
      </SegmentedControl>
    </>
  );
};
export const FilterBuilderButton = (props: ButtonProps) => {
  const typeToIcon: { [key in string]: IconType } = {
    addRule: 'Add',
    addGroup: 'ListAdd',
    delRule: 'Delete',
    delGroup: 'Delete',
    delRuleGroup: 'Delete',
    addRuleGroup: 'ListAdd',
  };
  return (
    <Button
      aria-label={props.label || props.type}
      icon={typeToIcon[props.type]}
      style={{ marginLeft: 4 }}
      type={props.type.startsWith('del') ? 'ghost-destructive' : 'secondary'}
      onClick={props.onClick}
    >
      {props.label}
    </Button>
  );
};

const getSelectItems = (
  fields: FieldItems = [],
  level = 0
): OptionType<string>[] => {
  return fields.map((field) => {
    const { items, key, path, label, disabled, fullLabel } = field;
    // because of limitation of react select, we just repeat a set of white
    // spaces in front of the text to give the feeling of indentation
    const groupPrefix = level > 0 ? '\u00A0\u00A0'.repeat(level) : '';
    const prefix = level > 1 ? '\u00A0\u00A0'.repeat(level - 1) : '';
    const pathKey = path || key;
    if (items) {
      const simpleItems = items.filter((it) => !it.items);
      return {
        key: pathKey,
        label: groupPrefix + label,
        title: pathKey,
        options: getSelectItems(simpleItems, level + 1),
      } as OptionType<string>;
    }
    return {
      key: pathKey,
      value: pathKey,
      // use path if it is a field
      title: fullLabel || label,
      label: prefix + label,
      disabled: disabled,
    } as OptionType<string>;
  });
};

const flattenOptions = (option: OptionType<string>): OptionType<string>[] =>
  option.options
    ? option.options.reduce(
        (prev, el) => prev.concat(flattenOptions(el)),
        [] as OptionType<string>[]
      )
    : [option];

export const FilterBuilderFunctionSelect = (props: FieldProps) => {
  const options = getSelectItems(props.items);

  const flattenedOptions = options.reduce(
    (curr, el) => curr.concat(flattenOptions(el)),
    [] as OptionType<string>[]
  );
  const selected = flattenedOptions.find(
    (el) => el.value === props.selectedKey
  );
  return (
    <Select
      menuPortalTarget={document.body}
      onChange={({ value }: { value: string }) => {
        props.setField(value);
      }}
      value={selected ? { ...selected, label: selected.title } : undefined}
      options={options}
    />
  );
};

type InputType = 'number' | 'datetime-local' | 'date' | 'boolean' | undefined;

export const InputWidget = (
  props: TextWidgetProps & {
    step?: number;
    inputType?: InputType;
  }
) => {
  const {
    placeholder,
    customProps,
    value,
    readonly,
    operator,
    step,
    inputType,
  } = props;

  if (['in', 'containsAny', 'containsAll'].includes(operator)) {
    const options = (
      value
        ? typeof value === 'object' && 'length' in value
          ? (value as any[])
          : [value]
        : []
    ).map((el: any) => ({
      label: `${el}`,
      value: el,
    }));
    return (
      <Creatable
        key="widget-number"
        formatCreateLabel={(input) => `Add "${input}"`}
        value={options || null}
        styles={selectStyles}
        components={{ Option: components['Option'] }}
        isValidNewOption={(el) => {
          switch (inputType) {
            case 'number':
              return (
                !Number.isNaN(Number(el)) ||
                (step === 1 ? Number.isInteger(Number(el)) : true)
              );
            case 'date':
            case 'datetime-local':
              return !isNaN(Date.parse(el));
            case 'boolean':
              return ['true', 'false'].includes(el.toLowerCase());
          }
          return !!el && !options.some((opt) => opt.value === el);
        }}
        isDisabled={props.readonly}
        options={options}
        isMulti
        hideSelectedOptions={false}
        onChange={(newValue) => {
          props.setValue(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            newValue
              ? (newValue as unknown as { value: string }[])
                  .map((el) => formatValue(inputType, el.value))
                  .filter((el: any) => el !== null && el !== undefined)
              : undefined
          );
        }}
      />
    );
  }
  // intense check because of boolean values!
  const currValue =
    value !== null && value !== undefined
      ? typeof value === 'object' && 'length' in value
        ? value[0]
        : value
      : null;

  if (inputType === 'boolean') {
    return (
      <SegmentedControl
        currentKey={
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          currValue === true
            ? 'true'
            : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            currValue === false
            ? 'false'
            : 'gibberish'
        }
        onButtonClicked={(key) => props.setValue(formatValue(inputType, key))}
      >
        <SegmentedControl.Button key="true">True</SegmentedControl.Button>
        <SegmentedControl.Button key="false">False</SegmentedControl.Button>
      </SegmentedControl>
    );
  }

  return (
    <Input
      key="widget"
      disabled={readonly}
      fullWidth
      value={
        // If the input type is 'datetime-local' and currValue is truthy, format the date value
        inputType === 'datetime-local' && currValue
          ? new Date(currValue).toISOString().substring(0, 16)
          : // If currValue is undefined, null, or falsey, set an empty string
          currValue === undefined || currValue === null
          ? ''
          : // Otherwise, set the current value as a string
            `${currValue}`
      }
      placeholder={placeholder}
      type={inputType}
      step={step}
      onChange={(e) => {
        props.setValue(formatValue(inputType, e.target.value));
      }}
      {...customProps}
    />
  );
};

const formatValue = (type: InputType, value: any) => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  } else if (type === 'number') {
    return Number(value);
  } else if (type === 'date') {
    return new Date(value).toISOString().split('T')[0];
  } else if (type === 'datetime-local') {
    return new Date(value).toISOString();
  } else if (type === 'boolean') {
    return `${value}`.toLowerCase() === 'true';
  } else {
    return value;
  }
};
