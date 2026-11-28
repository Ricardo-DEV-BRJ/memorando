import { fileURLToPath, URL } from 'node:url'
import Vue from '@vitejs/plugin-vue'
import Fonts from 'unplugin-fonts/vite'
import { defineConfig } from 'vite'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Vue({
      template: { transformAssetUrls },
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
    Vuetify({
      autoImport: true,
      styles: {
        configFile: 'src/styles/settings.scss',
      },
    }),
    Fonts({
      // Sin <link rel="preload">: por defecto el plugin precarga TODOS los archivos de fuente del build
      // (incluidos los de iconos en .eot/.ttf), varios MB que retrasaban la primera carga.
      // El plugin lee esta opción desde "custom" aunque las fuentes vengan de fontsource.
      custom: { families: [], preload: false },
      fontsource: {
        families: [
          {
            name: 'Roboto',
            // Solo los pesos que usa Vuetify y el alfabeto latino (incluye tildes y ñ)
            weights: [300, 400, 500, 700],
            styles: ['normal'],
            subset: 'latin',
          },
        ],
      },
    }),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
      ],
      dirs: [
        'src/utils',
        'src/composables',
      ],
      vueTemplate: true,
      dts: 'src/auto-imports.d.ts',
    }),
    Components({
      dirs: ['src/components'],
      dts: 'src/components.d.ts',
    }),
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
  server: {
    port: 8080,
  },
})
