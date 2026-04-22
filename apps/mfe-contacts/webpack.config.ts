import { withModuleFederation } from '@nx/module-federation/angular';
import config from './module-federation.config';

// Port must match project.json serve.options.port
const DEV_HOST = 'http://localhost:4202/';

export default withModuleFederation(config, {
  dts: false,
  library: { type: 'var', name: 'mfe_contacts' },
  filename: 'remoteEntry.js',
}).then((mfConfigFn) => (cfg: object) => {
  const result = mfConfigFn(cfg);
  // 'publicPath: auto' emits `new URL('.', import.meta.url)` which is ESM-only
  // and breaks when styles.js is loaded as a regular <script>.
  // An explicit URL avoids import.meta entirely.
  result['output'] = {
    ...(result['output'] ?? {}),
    publicPath: process.env['NODE_ENV'] === 'production' ? '/' : DEV_HOST,
  };
  result['experiments'] = { ...(result['experiments'] ?? {}), outputModule: false };
  return result;
});
