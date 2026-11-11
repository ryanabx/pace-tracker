import { mount } from 'svelte';
import './app.css';
import App from './ui/App.svelte';

const container = document.getElementById('root');
if (container) {
    mount(App, { target: container });
}
