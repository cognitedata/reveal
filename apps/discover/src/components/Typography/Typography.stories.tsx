// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck - PLEASE FIX NEXT TIME YOU CHANGE THIS FILE

import React from 'react';

import { Typography } from './Typography';

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  title: 'Components / typography',
  component: Typography,
};
export const full = () => <TypographyComponent />;

export const withWeight = ({ variant = 'h1' }) => (
  <div>
    <Typography variant={variant} weight="regular">
      {variant} / Hind regular
    </Typography>
    <br />
    <Typography variant={variant} weight="light">
      {variant} / Hind light
    </Typography>
    <br />
    <Typography variant={variant} weight="medium">
      {variant} / Hind medium
    </Typography>
    <br />
    <Typography variant={variant} weight="semibold">
      {variant} / Hind semibold
    </Typography>
  </div>
);

const Box = (props) => {
  const { children } = props;
  return <div style={{ padding: 8 }}>{children}</div>;
};

const TypographyComponent = () => {
  return (
    <div>
      <Box>
        <Typography variant="h1">h1 -&gt; Typography</Typography>
      </Box>
      <Box>
        <Typography variant="h2">h2 -&gt; Typography</Typography>
      </Box>
      <Box>
        <Typography variant="h3">h3 -&gt; Typography</Typography>
      </Box>
      <Box>
        <Typography variant="h4">h4 -&gt; Typography</Typography>
      </Box>
      <Box>
        <Typography variant="h5">h5 -&gt; Typography</Typography>
      </Box>
      <Box>
        <Typography variant="h6">h6 -&gt; Typography</Typography>
      </Box>
      <Box>
        <Typography variant="body1">body1 -&gt; Typography</Typography>
      </Box>
      <Box>
        <Typography variant="body2">body2 -&gt; Typography</Typography>
      </Box>
      <Box>
        <Typography variant="tinytext">tinytext -&gt; Typography</Typography>
      </Box>
      <Box>
        <Typography variant="label">label -&gt; Typography</Typography>
      </Box>
      <Box>
        <Typography variant="microheader">
          microheader -&gt; Typography
        </Typography>
      </Box>
      <Box>
        <Typography variant="longtext">longtext -&gt; Typography</Typography>
      </Box>
    </div>
  );
};
