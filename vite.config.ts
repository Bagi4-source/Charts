import react from "@vitejs/plugin-react-swc";
import {defineConfig} from "vite";

import {fileURLToPath, URL} from "url";

export default defineConfig({
    plugins: [react()],
    exclude: ['xlsx'],
    resolve: {
        alias: [
            {
                find: "src",
                replacement: fileURLToPath(new URL("./src", import.meta.url)),
            },
        ],
    },
});
