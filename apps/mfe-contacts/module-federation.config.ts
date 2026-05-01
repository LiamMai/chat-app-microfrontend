import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'mfe_contacts',
  exposes: {
    './Routes': 'apps/mfe-contacts/src/app/remote-entry/entry.routes.ts',
    './Mount': 'apps/mfe-contacts/src/remote-mount.ts',
  },
};

/**
 * Nx requires a default export of the config to allow correct resolution of the module federation graph.
 **/
export default config;
