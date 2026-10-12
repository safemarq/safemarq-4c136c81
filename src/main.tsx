import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { initI18n } from './i18n/I18nProvider';
import './index.css';

// Load the visitor's language before the first paint (French is already bundled,
// so French visitors do not wait at all).
initI18n().then((locale) => {
  createRoot(document.getElementById('root')!).render(<App initialLocale={locale} />);
});
