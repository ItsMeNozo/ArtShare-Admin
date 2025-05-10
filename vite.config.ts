import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import istanbul from "vite-plugin-istanbul";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(process.env.MODE || mode, process.cwd(), "");

  // Determine the backend API URL based on mode
  // For development, it's your local backend.
  // For production, this VITE_API_BASE_URL_PROD should point to your deployed backend.
  const backendApiUrl =
    mode === "production"
      ? env.VITE_API_BASE_URL_PROD // e.g., https://api.yourdomain.com
      : "http://localhost:3000"; // Your local NestJS backend

  return {
    server: {
      port: 1574,
      open: true,
    },
    plugins: [
      react(),
      tailwindcss(),
      istanbul({
        cypress: true,
        requireEnv: false,
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      // This makes VITE_API_BASE_URL available in your client-side code
      // This is what you'll use for API calls when NOT relying on the dev proxy
      // or when you need to construct full URLs (e.g., in production if not same-domain)
      "import.meta.env.VITE_BE_URL": JSON.stringify(backendApiUrl),

      // Firebase variables (your existing setup is fine here)
      "import.meta.env.VITE_FIREBASE_API_KEY": JSON.stringify(
        env.VITE_FIREBASE_API_KEY,
      ),
      "import.meta.env.VITE_FIREBASE_AUTH_DOMAIN": JSON.stringify(
        env.VITE_FIREBASE_AUTH_DOMAIN,
      ),
      "import.meta.env.VITE_FIREBASE_PROJECT_ID": JSON.stringify(
        env.VITE_FIREBASE_PROJECT_ID,
      ),
      "import.meta.env.VITE_FIREBASE_STORAGE_BUCKET": JSON.stringify(
        env.VITE_FIREBASE_STORAGE_BUCKET,
      ),
      "import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID": JSON.stringify(
        env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      ),
      "import.meta.env.VITE_FIREBASE_APP_ID": JSON.stringify(
        env.VITE_FIREBASE_APP_ID,
      ),
    },
  };
});
