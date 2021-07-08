import { Region } from '@cognite/react-image-annotate/Types/ImageCanvas/region-tools';
import React, {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button, Col, Popconfirm, Row, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { convertToAnnotation } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/ConversionUtils';
import { PopupUIElementContainer } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/TitleContainer';
import { Input } from 'antd';
import { useDispatch } from 'react-redux';
import { deselectAnnotation } from '../../previewSlice';

export const AnnotationEditPopup = (props: {
  region: Region;
  editing: boolean;
  onDelete: (region: Region) => void;
  onClose: (region: Region) => void;
  onChange: (region: Region) => void;
  onCreateAnnotation: (annotation: any) => void;
  onUpdateAnnotation: (annotation: any) => void;
  onDeleteAnnotation: (annotation: any) => void;
}) => {
  const {
    region,
    editing,
    onDelete,
    onClose,
    onChange,
    onCreateAnnotation,
    onUpdateAnnotation,
    onDeleteAnnotation,
  } = props;

  const dispatch = useDispatch();

  const title = useMemo(() => {
    switch (region.type) {
      case 'box': {
        return 'Rectangle';
      }
      case 'point': {
        return 'Point';
      }
      case 'polygon': {
        return 'Polygon';
      }
      default:
        return 'Other';
    }
  }, [region]);

  const [labelValue, setLabelValue] = useState(
    (region.tags && region.tags[0]) || ''
  );
  const inputElement = useRef<any>();

  const alreadyCreated = !!(region as any).lastUpdatedTime;

  const handleOnDelete = () => {
    onDeleteAnnotation(convertToAnnotation(region));
    onDelete(region);
    onClose(region);
  };

  const handleOnCancel = () => {
    onClose(region);
    if (alreadyCreated) {
      dispatch(deselectAnnotation(region.id as number));
    } else {
      onDelete(region);
    }
  };

  const handleOnCreate = () => {
    onClose(region);
    onCreateAnnotation({ ...convertToAnnotation(region), text: labelValue });
  };

  const handleOnUpdate = () => {
    onClose(region);
    dispatch(deselectAnnotation(region.id as number));
    onUpdateAnnotation({ ...convertToAnnotation(region), text: labelValue });
  };

  const updateRegionLabel = (label: string) => {
    let updatedRegionTags = [];

    if (label) {
      if (region.tags?.length) {
        updatedRegionTags = region.tags.slice(1);
      } else {
        updatedRegionTags = [label];
      }
      const updatedRegion = { ...region, tags: updatedRegionTags };
      onChange(updatedRegion);
    }
  };

  const handleInput = (evt: ChangeEvent<HTMLInputElement>) => {
    setLabelValue(evt.target.value);
    updateRegionLabel(evt.target.value);
  };

  const handleInputClick = () => {
    if (inputElement.current) {
      inputElement.current.focus();
    }
  };

  useEffect(() => {
    if (editing) {
      return () => {
        if (editing && !alreadyCreated) {
          onDelete(region);
        }
      };
    }
    return () => {};
  }, [editing]);

  useEffect(() => {
    if (inputElement.current) {
      inputElement.current.focus();
    }
  });

  if (editing) {
    return (
      <Container>
        <OptionContainer>
          <Row
            cols={3}
            style={{ display: 'flex', justifyContent: 'space-between' }}
          >
            <Col span={3}>
              <Title level={4} style={{ paddingBottom: '4px' }}>
                {title}
              </Title>
            </Col>
          </Row>
          <Row cols={5} style={{ paddingTop: '10px', paddingBottom: '10px' }}>
            {/* <Col span={1}> */}
            {/*  <PopupUIElementContainer title="Color"> */}
            {/*    <ColorBadge color={region.color} /> */}
            {/*  </PopupUIElementContainer> */}
            {/* </Col> */}
            <Col span={4}>
              <PopupUIElementContainer title="Label">
                {/* <Select */}
                {/*  closeMenuOnSelect */}
                {/*  value={selectedTag} */}
                {/*  onChange={(val: { label: string; value: string }) => { */}
                {/*    setSelectTag(val); */}
                {/*  }} */}
                {/*  options={LABEL_OPTIONS} */}
                {/* /> */}
                <Input
                  placeholder="Add label"
                  ref={inputElement}
                  value={labelValue}
                  onInput={handleInput}
                  onClick={handleInputClick}
                />
              </PopupUIElementContainer>
            </Col>
          </Row>
          <Row style={{ paddingTop: '30px' }} cols={12} gutter={0}>
            <Col span={3}>
              <Popconfirm
                icon="WarningFilled"
                placement="bottom-end"
                onConfirm={handleOnDelete}
                content="Are you sure you want to permanently delete this annotation?"
              >
                <Button size="small" icon="Delete">
                  Delete
                </Button>
              </Popconfirm>
            </Col>
            <Col span={3}>
              <div />
            </Col>
            <Col span={3}>
              <Button size="small" onClick={handleOnCancel}>
                Cancel
              </Button>
            </Col>
            <Col span={3}>
              {!alreadyCreated && (
                <Button
                  type="primary"
                  icon="Plus"
                  size="small"
                  onClick={handleOnCreate}
                  disabled={!labelValue}
                >
                  Create
                </Button>
              )}
              {alreadyCreated && (
                <Button
                  type="primary"
                  icon="Upload"
                  size="small"
                  onClick={handleOnUpdate}
                  disabled={!labelValue}
                >
                  Update
                </Button>
              )}
            </Col>
          </Row>
        </OptionContainer>
      </Container>
    );
  }

  return null;
};

const OptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 360px;
  background: #ffffff;
  border: 1px solid #d9d9d9;
  box-sizing: border-box;
  border-radius: 4px;
  padding: 11px;
`;

const Container = styled.div`
  cursor: default;
`;
