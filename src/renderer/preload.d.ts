import { api } from '../main/preload';

declare global {
  // eslint-disable-next-line
  interface Window {
    Main: typeof api;
  }
}
