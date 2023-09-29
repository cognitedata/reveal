import { useState, useEffect } from 'react';

import { Button, Input } from '@cognite/cogs.js';

import { useTranslation } from '../../common/i18n';
import useDebounce from '../../hooks/useDebounce';
import { Col, Row } from '../../utils';

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
    <Row css={{ marginBottom: '10px' }}>
      <Col span={8}>
        <Input
          placeholder={t('link-name')}
          value={name}
          fullWidth
          onChange={(e) => {
            e.preventDefault();
            setName(e.currentTarget.value);
          }}
        />
      </Col>
      <Col span={16}>
        <Input
          placeholder="e.g., docs.cognite.com"
          required
          type="text"
          value={link}
          fullWidth
          onChange={(e) => {
            e.preventDefault();
            setLink(e.currentTarget.value);
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              props.add();
            }
          }}
          postfix={
            <Button
              size="small"
              type="secondary"
              icon="Close"
              aria-label="Close"
              onClick={() => props.remove(props.index)}
            />
          }
        />
      </Col>
    </Row>
  );
};

export default LinksList;
