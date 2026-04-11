// Jest stub for lucide-react (pure ESM package that CRA's Jest cannot parse).
// Exports a Proxy so any icon name imported in code resolves to a stub
// component that renders nothing.
const React = require('react');

const Stub = React.forwardRef((props, ref) => React.createElement('svg', { ...props, ref }));
Stub.displayName = 'LucideStub';

module.exports = new Proxy(
  { __esModule: true, default: Stub },
  {
    get: (target, prop) => {
      if (prop in target) return target[prop];
      if (typeof prop === 'symbol') return undefined;
      return Stub;
    },
  }
);
