import { withModuleFederation } from '@nx/module-federation/angular';
import config from './module-federation.config';

export default withModuleFederation(
  { ...config },
  {
    dts: false,
    library: { type: 'var', name: 'mfe_contacts' },
    filename: 'remoteEntry.js',
  },
).then((mfConfigFn) => (cfg: object) => {
  const result = mfConfigFn(cfg);
  result['output'] = {
    ...(result['output'] ?? {}),
    publicPath: process.env['MFE_CONTACTS_HOST'] ?? '/',
  };
  result['experiments'] = { ...(result['experiments'] ?? {}), outputModule: false };
  return result;
});
