//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {},
  webpack(config, { isServer }) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };

    if (!isServer) {
      config.plugins.push(
        new ModuleFederationPlugin({
          name: 'shell',
          remotes: {
            mfe_chat: 'mfe_chat@http://localhost:4201/remoteEntry.js',
            mfe_contacts: 'mfe_contacts@http://localhost:4202/remoteEntry.js',
          },
          shared: {
            react: { singleton: true, eager: true, requiredVersion: false },
            'react-dom': { singleton: true, eager: true, requiredVersion: false },
          },
        })
      );
    }
    return config;
  },
};

const plugins = [withNx];

module.exports = composePlugins(...plugins)(nextConfig);
