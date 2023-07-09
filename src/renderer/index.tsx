import { createRoot } from 'react-dom/client';
import { skyline } from 'nx-request-api';
import App from './app';

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<App />);

// override B/X buttons closing the webpage on switch
skyline.setButtonAction('B', () => {});
skyline.setButtonAction('X', () => {});
