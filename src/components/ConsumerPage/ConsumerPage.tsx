import { useState, useEffect } from 'react';
import Col from 'antd/lib/col';
import { Button, Colors, Title } from '@cognite/cogs.js';
import { Consumer, DataSet } from 'utils/types';
import Drawer from 'components/Drawer';
import { IconWrapper, InputField } from 'utils/styledComponents';
import dataConsumerIcon from 'assets/DataConsumer.svg';
import styled from 'styled-components';
import LinksList from '../LinksList';
import {
  removeConsumerLink,
  updateConsumerName,
  updateConsumerContactEmail,
  updateConsumerExternalLink,
} from './consumerPageUtils';
import { useTranslation } from 'common/i18n';

const Label = styled.label`
  margin-top: 0.7rem;
  font-weight: bold;
`;
const LocalCol = styled(Col)`
  display: flex;
  flex-direction: column;
`;
const ImgCol = styled(LocalCol)`
  align-items: center;
`;

const LinksCol = styled(LocalCol)`
  margin-top: 0.7rem;
  margin-bottom: 1rem;
  button {
    margin-top: 0.5rem;
    width: fit-content;
  }
  .ant-input-group-wrapper {
    top: 0;
  }
`;
const StyledTitle2 = styled((props) => (
  <Title level={2} {...props}>
    {props.children}
  </Title>
))`
  font-size: 1.4rem;
`;
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  border-bottom: 2px solid ${Colors['greyscale-grey6'].hex()};
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  &:last-child {
    border-bottom: none;
  }
`;
const Hint = styled.span`
  font-style: italic;
  font-size: small;
  margin-bottom: 0.2rem;
`;

interface ConsumerProps {
  dataSet?: DataSet;
  updateDataSet(dataSet: DataSet): void;
  closeModal(): void;
  changesSaved: boolean;
  setChangesSaved(value: boolean): void;
  visible: boolean;
  saveSection: boolean;
}

const ConsumerPage = (props: ConsumerProps): JSX.Element => {
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (props.saveSection) {
      handleSaveChanges();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.saveSection]);

  // set values for consumers
  useEffect(() => {
    if (props.dataSet?.metadata?.consumers) {
      setConsumers(props.dataSet.metadata.consumers);
    }
  }, [props.dataSet]);

  const handleSaveChanges = () => {
    if (props.dataSet) {
      const newDataSet: DataSet = { ...props.dataSet };
      newDataSet.metadata.consumers = consumers;
      props.updateDataSet(newDataSet);
      props.setChangesSaved(true);
      props.closeModal();
    }
  };

  const addLink = (consumerIndex: number) => {
    setConsumers((prev) => {
      return prev.map((p, i) => {
        if (i === consumerIndex) {
          return {
            ...p,
            externalLinks: [...p.externalLinks, { rel: '', href: '' }],
          };
        }
        return p;
      });
    });
    props.setChangesSaved(false);
  };
  const updateLink = (
    updatedLink: { name: string; id: string },
    index: number,
    consumerIndex: number
  ) => {
    setConsumers((prev) => {
      return updateConsumerExternalLink(
        prev,
        updatedLink,
        index,
        consumerIndex
      );
    });
    props.setChangesSaved(false);
  };

  const removeLink = (linkIndex: number, consumerIndex: number) => {
    setConsumers((prev) => {
      return removeConsumerLink(prev, linkIndex, consumerIndex);
    });
    props.setChangesSaved(false);
  };
  const removeConsumer = (consumerIndex: number) => {
    setConsumers((prev) => {
      return prev.filter((_, i) => i !== consumerIndex);
    });
    props.setChangesSaved(false);
  };

  const addConsumer = () => {
    setConsumers((prev) => {
      return [
        ...prev,
        { name: '', contact: { name: '', email: '' }, externalLinks: [] },
      ];
    });
    props.setChangesSaved(false);
  };

  const setConsumerName = (value: string, consumersIndex: number) => {
    setConsumers((prev) => {
      return updateConsumerName(prev, value, consumersIndex);
    });
    props.setChangesSaved(false);
  };

  const setConsumerContactEmail = (value: string, consumersIndex: number) => {
    setConsumers((prev) => {
      return updateConsumerContactEmail(prev, value, consumersIndex);
    });
    props.setChangesSaved(false);
  };

  return (
    <Drawer
      title={<StyledTitle2>{t('document-consumers')}</StyledTitle2>}
      width="50%"
      onClose={() => props.closeModal()}
      visible={props.visible}
      okText={props.changesSaved ? t('done') : t('save')}
      onOk={props.changesSaved ? props.closeModal : handleSaveChanges}
      cancelHidden
    >
      <form>
        {Array.isArray(consumers) &&
          consumers.map(({ name, contact, externalLinks }, consumersIndex) => {
            const consumerKey = `consumer-${consumersIndex}`;
            return (
              <Wrapper key={consumerKey} role="group">
                <Col span={24}>
                  <LocalCol span={18}>
                    <Label htmlFor={`consumer-name-${consumersIndex}`}>
                      {t('consumer-name')}
                    </Label>
                    <Hint>{t('consumer-name-hint')}</Hint>
                    <InputField
                      id={`consumer-name-${consumersIndex}`}
                      style={{ width: '400px' }}
                      value={name}
                      type="text"
                      placeholder={t('name')}
                      onChange={(e) => {
                        setConsumerName(e.target.value, consumersIndex);
                      }}
                    />
                    <Label htmlFor={`consumer-contact-email-${consumersIndex}`}>
                      {t('contact-email')}
                    </Label>
                    <InputField
                      style={{ width: '400px' }}
                      value={contact?.email}
                      type="email"
                      id={`consumer-contact-email-${consumersIndex}`}
                      placeholder={t('contact-email')}
                      onChange={(e) => {
                        setConsumerContactEmail(e.target.value, consumersIndex);
                      }}
                    />
                  </LocalCol>
                  <ImgCol span={6}>
                    <IconWrapper>
                      <img
                        style={{ width: '7rem' }}
                        src={dataConsumerIcon}
                        alt="Document icon"
                      />
                    </IconWrapper>
                    <Button
                      type="secondary"
                      onClick={() => removeConsumer(consumersIndex)}
                    >
                      {t('remove-consumer')}
                    </Button>
                  </ImgCol>
                </Col>
                <LinksCol span={24}>
                  <Label>{t('add-external-links')}</Label>
                  <Hint>{t('add-external-links-hint')}</Hint>
                  {externalLinks.map(({ rel, href }, i) => {
                    const listKey = `external-link-${i}`;
                    return (
                      <LinksList
                        key={listKey}
                        value={{ name: rel, id: href }}
                        remove={(idx) => removeLink(idx, consumersIndex)}
                        update={(value, idx) =>
                          updateLink(value, idx, consumersIndex)
                        }
                        index={i}
                        add={() => addLink(consumersIndex)}
                      />
                    );
                  })}
                  <Button
                    type="secondary"
                    onClick={() => addLink(consumersIndex)}
                  >
                    {t('add-new-external-link')}
                  </Button>
                </LinksCol>
              </Wrapper>
            );
          })}
        <Button type="primary" variant="outline" onClick={addConsumer}>
          {t('add-consumer')}
        </Button>
      </form>
    </Drawer>
  );
};

export default ConsumerPage;
