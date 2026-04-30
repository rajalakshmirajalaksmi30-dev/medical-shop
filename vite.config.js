
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Middleware to handle /api routes locally
const apiMiddleware = (env) => ({
  name: 'api-middleware',
  configureServer(server) {
    // Inject environment variables into process.env for the API functions
    Object.assign(process.env, env);
    server.middlewares.use(async (req, res, next) => {
      if (req.url.startsWith('/api/')) {
        const apiPath = req.url.split('?')[0];
        const filePath = path.join(process.cwd(), apiPath + '.js');

        if (fs.existsSync(filePath)) {
          try {
            // Read the file and handle it
            // We need to parse body for POST requests
            if (req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk.toString(); });
              req.on('end', async () => {
                try {
                  req.body = JSON.parse(body);
                  const module = await server.ssrLoadModule(filePath);
                  // Mock res object to match Vercel's API
                  const mockRes = {
                    status: (code) => {
                      res.statusCode = code;
                      return mockRes;
                    },
                    json: (data) => {
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify(data));
                      return mockRes;
                    }
                  };
                  await module.default(req, mockRes);
                } catch (err) {
                  console.error('API Error:', err);
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: 'Internal Server Error' }));
                }
              });
            } else {
              const module = await server.ssrLoadModule(filePath);
              const mockRes = {
                status: (code) => {
                  res.statusCode = code;
                  return mockRes;
                },
                json: (data) => {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                  return mockRes;
                }
              };
              await module.default(req, mockRes);
            }
            return;
          } catch (e) {
            console.error('Failed to load API module:', e);
          }
        }
      }
      next();
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), apiMiddleware(env)],
    server: {
      port: 5173,
      host: true,
    },
  };
});
