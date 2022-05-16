import { Body, Button, Icon } from '@cognite/cogs.js';
import { OrnateAnnotation } from '@cognite/ornate';
import { CSSProperties } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import layers from 'utils/zindex';

import { CloseButton, Wrapper } from './elements';

type Props = {
  annotation: OrnateAnnotation;
  onClose?: () => void;
  style?: CSSProperties;
};

const SelectedAnnotationCard = ({ annotation, onClose, style = {} }: Props) => {
  const location = useLocation();

  const renderLink = (type: string, id = '') => {
    if (type === 'asset') {
      return <NavLink to={`/explore/${id}/detail`}>View asset</NavLink>;
    }
    if (type === 'file') {
      return (
        <NavLink to={`${location.pathname}?fullscreen&docid=${id}`}>
          View document
        </NavLink>
      );
    }
    return null;
  };

  const annotationType = annotation?.metadata?.type || '';
  const annotationName = annotation?.metadata?.name || '';
  const resourceId = annotation?.metadata?.resourceId;
  return (
    <Wrapper
      className="z-8"
      style={{ zIndex: layers.SELECTED_ANNOTATION, ...style }}
    >
      <Body level={3} style={{ textTransform: 'capitalize' }}>
        {annotationType}
      </Body>
      <Body strong level={2}>
        {annotationName}
      </Body>
      {renderLink(annotationType, resourceId)}
      <CloseButton>
        <Button unstyled type="ghost" onClick={onClose}>
          <Icon type="Close" />
        </Button>
      </CloseButton>
    </Wrapper>
  );
};

export default SelectedAnnotationCard;
