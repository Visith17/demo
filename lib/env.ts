import { cleanEnv, str, url, port } from 'envalid';

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production'] }),
  API_URL: url(),
  NEXT_PUBLIC_URL: url(), // ⚠️ this will be exposed to client
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: str(), 
  API_TOKEN: str(),
}); 
