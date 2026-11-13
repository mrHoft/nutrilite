import { createApp } from 'vue'

import './styles/tokens.css'
import './styles/base.css'
import './styles/markdown.css'

import App from './App.vue'
import { router } from './router/router'
import { registerServiceWorker } from './services/registerServiceWorker'

router.start()
createApp(App).mount('#app')

registerServiceWorker()
