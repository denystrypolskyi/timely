import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import App from "./app/App.tsx";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {I18nProvider} from "./i18n/I18nProvider";
import {ThemeProvider} from "./theme/ThemeProvider";

document.title = import.meta.env.VITE_APP_NAME || "Timely";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <I18nProvider>
                    <App/>
                </I18nProvider>
            </ThemeProvider>
        </QueryClientProvider>
    </StrictMode>
);
