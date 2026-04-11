// Jest stub for @vercel/analytics and @vercel/speed-insights React subpaths.
// Their package exports map isn't resolvable by CRA's Jest runner.
const React = require('react');

const NoopComponent = () => null;

module.exports = {
  __esModule: true,
  Analytics: NoopComponent,
  SpeedInsights: NoopComponent,
  default: NoopComponent,
};
