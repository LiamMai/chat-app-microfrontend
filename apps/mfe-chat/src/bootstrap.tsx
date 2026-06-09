import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';

// MantineProvider + styles.scss live inside ./app/app so they also apply when
// this remote is federated into the shell host. Bootstrap only mounts standalone.
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
