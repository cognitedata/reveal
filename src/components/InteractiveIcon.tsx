import interactiveDiagramIcon from 'assets/InteractiveIcon.svg';

import React from 'react';

const InteractiveIcon = () => {
  return (
    <span style={{ maxWidth: '20px', marginRight: '10px' }}>
      <img src={interactiveDiagramIcon} alt="Interactive diagram icon" />
    </span>
  );
};

export default InteractiveIcon;
