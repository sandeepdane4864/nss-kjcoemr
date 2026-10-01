import { createContext, useContext } from 'react';
import { useFetch } from './useFetch.js';

const SiteCtx = createContext({ settings: {} });
export const useSite = () => useContext(SiteCtx);

export function SiteProvider({ children }) {
  const { data } = useFetch('/settings');
  return <SiteCtx.Provider value={{ settings: data || {} }}>{children}</SiteCtx.Provider>;
}
