// https://nuxt.com/docs/api/configuration/nuxt-config
// @ts-ignore
export default defineNuxtConfig({
  modules: ["@nuxt/fonts", "@nuxt/icon", "@nuxt/ui", "@nuxtjs/tailwindcss", "@formkit/nuxt"],
  formkit: {
    configFile: 'formkit.config.ts',
  },
  css: ['@formkit/themes/genesis'],
})