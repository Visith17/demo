import { env } from "./env";
export function getServerConfig() {
    return {
    API_TOKEN: env.API_TOKEN!,
    API_URL: env.API_URL!,
    NODE_ENV: env.NODE_ENV!,
  };
}

  