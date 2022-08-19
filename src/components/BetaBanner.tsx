import { useLocalStorage } from '@cognite/cogs.js';
import Alert from 'antd/lib/alert';
import React from 'react';
import { LS_KEY_BETA_BANNER } from 'stringConstants';
import { trackUsage, PNID_METRICS } from 'utils/Metrics';

const BetaBanner = () => {
  const [hideBanner, setHideBanner] = useLocalStorage(
    LS_KEY_BETA_BANNER,
    false
  );

  if (!hideBanner) {
    return (
      <Alert
        style={{ margin: '12px' }}
        message={
          <p>
            We’re excited to give you a sneak peek of the latest redesign and
            enhancements to the interactive diagrams before it’s released
            publicly. We encourage all customers to try out the new features and
            <a
              onClick={() => trackUsage(PNID_METRICS.betaBanner.feedback)}
              href="https://hub.cognite.com/contextualizition-beta-features-162/beta-interactive-engineering-diagram-flow-feedback-channel-490"
              target="_blank"
              rel="noopener noreferrer"
            >
              {' '}
              give us feedback{' '}
            </a>
            to help us make them better!
          </p>
        }
        type="info"
        closable
        onClose={() => {
          trackUsage(PNID_METRICS.betaBanner.close);
          setHideBanner(true);
        }}
      />
    );
  }
  return <span />;
};

export default BetaBanner;
