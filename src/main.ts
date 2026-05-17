import { createApp } from 'vue'
import { router } from './router'
import App from './App.vue'
import './assets/style.css'
import './assets/theme.css'

import '@fortawesome/fontawesome-svg-core/styles.css'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCircleCheck, faCircleExclamation } from '@fortawesome/free-solid-svg-icons'

import Container from './components/common/Container.vue'
import Button from './components/ui/button.vue'
import Input from './components/ui/Input.vue'
import Select from './components/ui/Select.vue'
import AnimatedContent from './components/common/AnimatedContent.vue'

library.add(faCircleCheck, faCircleExclamation)
const app = createApp(App)

app.component('FontAwesomeIcon', FontAwesomeIcon)
app.component('common-container', Container)
app.component('ui-button', Button)
app.component('ui-input', Input)
app.component('ui-select', Select)
app.component('common-animated-content', AnimatedContent)

app.use(router)
app.mount('#app')