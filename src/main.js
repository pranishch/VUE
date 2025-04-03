import { createApp } from 'vue'
import App from './App.vue'
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:8000';  // Django's default port
createApp(App).mount('#app')
