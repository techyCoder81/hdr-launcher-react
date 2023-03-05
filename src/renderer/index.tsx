import { createRoot } from 'react-dom/client';
import App from './app';
import { skyline } from 'nx-request-api';

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<App />);

// override B/X buttons closing the webpage on switch
skyline.setButtonAction('B', () => {});
skyline.setButtonAction('X', () => {});
