import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  plugins: [react(), tailwindcss()],
  root: "src",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  define: {
    ODOSHI: process.env.ODOSHI === "true" ? "true" : "false",
    MODE: JSON.stringify(process.env.MODE),
  }
});
