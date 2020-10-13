import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import theme from 'styles/theme';

const Title = styled.h1`
  font-weight: bold;
  font-size: 36px;
  color: #101010;
  margin-bottom: 0;
`;

const TitleOrnament = styled.div`
  width: 40px;
  height: 4px;
`;

const Subtitle = styled.h2`
  margin-top: 8px;
  margin-bottom: 0;
  font-size: 20px;
  color: #585858;
`;

const propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  ornamentColor: PropTypes.string,
  ornamentVisible: PropTypes.bool,
};

const defaultProps = {
  subtitle: null,
  ornamentColor: null,
  ornamentVisible: true,
};

const PageTitle = ({ title, subtitle, ornamentColor, ornamentVisible }) => (
  <div>
    <Title>{title}</Title>
    {ornamentVisible && (
      <TitleOrnament
        style={{ backgroundColor: ornamentColor || theme.primaryBackground }}
      />
    )}
    {subtitle && <Subtitle>{subtitle}</Subtitle>}
  </div>
);

PageTitle.propTypes = propTypes;
PageTitle.defaultProps = defaultProps;

export default PageTitle;
