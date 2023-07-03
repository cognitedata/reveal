import { useNavigate } from 'react-router-dom';

import { ThreeDButton } from '../components/Button/ThreeDButton';

export const AppliedThree3DData: React.FC = () => {
  const navigate = useNavigate();
  const handleApplyClick = () => {
    navigate('3d');
  };
  return <ThreeDButton onClick={handleApplyClick} />;
};
