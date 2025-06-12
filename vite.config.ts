import * as path from 'path';
import react from '@vitejs/plugin-react';

import { defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/__tests__/setup',
    },
    resolve: {
      alias: [
        {
          find: '~',
          replacement: path.resolve(__dirname, 'src'),
        },
      ],
    },

    // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
    //
    // 1. prevent vite from obscuring rust errors
    clearScreen: false,
    // 2. tauri expects a fixed port, fail if that port is not available
    server: {
      port: parseInt(env.VITE_PORT) || 1414,
      strictPort: true,
      watch: {
        // 3. tell vite to ignore watching `src-tauri`
        ignored: ['**/src-tauri/**'],
      },
    },
  };
});
