import {useLayoutEffect, useMemo, useState} from "react";
import {Theme, ThemeContext, themes} from "./ThemeContext";

const STORAGE_KEY = "timely-theme";

const getInitialTheme = (): Theme => {
    const storedTheme = localStorage.getItem(STORAGE_KEY);
    return themes.includes(storedTheme as Theme) ? storedTheme as Theme : "dark";
};

export const ThemeProvider = ({children}: {children: React.ReactNode}) => {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    useLayoutEffect(() => {
        localStorage.setItem(STORAGE_KEY, theme);
        document.documentElement.dataset.theme = theme;
        document.documentElement.style.colorScheme = theme;
    }, [theme]);

    const value = useMemo(() => ({theme, setTheme}), [theme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
