import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import dts from 'vite-plugin-dts'

export default defineConfig(({ mode }) => {
  const isDemo = mode === 'demo'
  const isLib = mode === 'production' && !isDemo

  return {
    plugins: [
      vue(),
      ...(isLib
        ? [
            dts({
              tsconfigPath: './tsconfig.lib.json',
              outDir: 'dist',
              entryRoot: 'src/lib',
              insertTypesEntry: true,
              cleanVueFileName: false,
            }),
          ]
        : []),
    ],
    build: isLib
      ? {
          lib: {
            entry: resolve(__dirname, 'src/lib/index.ts'),
            name: 'VueDnd',
            fileName: (format) =>
              format === 'es' ? 'vue-dnd.js' : 'vue-dnd.umd.cjs',
            formats: ['es', 'umd'],
          },
          cssCodeSplit: false,
          rollupOptions: {
            external: ['vue'],
            output: {
              globals: { vue: 'Vue' },
              exports: 'named',
              assetFileNames: (asset) =>
                asset.names?.[0]?.endsWith('.css') ? 'vue-dnd.css' : asset.names?.[0] ?? '[name][extname]',
            },
          },
          sourcemap: true,
          emptyOutDir: true,
        }
      : {
          outDir: 'demo-dist',
        },
  }
})
