import { useState, useEffect } from 'react';
import Input from 'antd/lib/input';
import { Icon } from '@cognite/cogs.js';
import useDebounce from 'hooks/useDebounce';
import { useTranslation } from 'common/i18n';

interface UrlInputProps {
  value: { name: string; id: string };
  remove(index: number): void;
  update(value: { name: string; id: string }, index: number): void;
  index: number;
  add(): void;
}

const LinksList = (props: UrlInputProps) => {
  const { t } = useTranslation();
  const [name, setName] = useState<string>('');
  const [link, setLink] = useState<string>('');
  const debounceTime = 400;

  const debouncedName = useDebounce(name, debounceTime);
  const debouncedLink = useDebounce(link, debounceTime);

  useEffect(() => {
    setName((props.value && props.value.name) || '');
    setLink((props.value && props.value.id) || '');

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.value]);

  useEffect(() => {
    if (
      (name || link) &&
      (name !== props.value.name || link !== props.value.id)
    )
      props.update({ name, id: link }, props.index);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedName, debouncedLink, props.value]);

  return (
    <Input.Group compact>
      <Input
        style={{ width: '35%' }}
        placeholder={t('link-name')}
        value={name}
        onChange={(e) => {
          e.preventDefault();
          setName(e.currentTarget.value);
        }}
      />
      <Input
        placeholder="e.g., docs.cognite.com"
        required
        type="text"
        value={link}
        onChange={(e) => {
          e.preventDefault();
          setLink(e.currentTarget.value);
        }}
        style={{ width: '65%', marginBottom: '10px' }}
        onPressEnter={() => props.add()}
        addonAfter={
          <Icon type="Close" onClick={() => props.remove(props.index)} />
        }
      />
    </Input.Group>
  );
};

export default LinksList;
