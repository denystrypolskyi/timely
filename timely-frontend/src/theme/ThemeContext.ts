import {createContext, useContext} from "react";

export const themes = ["dark", "light"] as const;
export type Theme = typeof themes[number];

interface ThemeValue {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeValue | null>(null);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme must be used within ThemeProvider");
    return context;
};
