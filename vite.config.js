import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import { createVuePlugin as vue } from 'vite-plugin-vue2'

// https://vitejs.dev/config/
export default ({ mode }) => {
  import.meta.env = { ...import.meta.env, ...loadEnv(mode, process.cwd()) }

  const port = import.meta.env.VITE_PORT || 3000

  return defineConfig({
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    server: {
      port,
      hmr: {
        clientPort: 443
      }
    },
    preview: {
      port
    }
  })
}