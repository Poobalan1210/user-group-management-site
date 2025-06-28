import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from 'pinia';
import uiPlugin from "@nuxt/ui/vue-plugin";

import App from "./App.vue";
import router from "./router";
import { configureAmplify } from './auth/auth';
import { plugin, defaultConfig } from '@formkit/vue'


// Configure AWS Amplify
configureAmplify();

// Create app instance
const app = createApp(App);

// Create and use Pinia store
const pinia = createPinia();
app.use(pinia);

// Use plugins
app.use(uiPlugin);
app.use(router);
app.use(plugin, defaultConfig)


app.mount("#app");
