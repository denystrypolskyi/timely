import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import App from "./app/App.tsx";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

document.title = import.meta.env.VITE_APP_NAME || "Timely";

// Remove tokens left by versions that stored JWTs in browser-accessible storage.
localStorage.removeItem("jwtToken");

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <App/>
        </QueryClientProvider>
    </StrictMode>
);
