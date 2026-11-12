import { createApp } from 'vue'

import './styles/tokens.css'
import './styles/base.css'
import './styles/markdown.css'

import App from './App.vue'
import { registerServiceWorker } from './services/registerServiceWorker'

createApp(App).mount('#app')

registerServiceWorker()
