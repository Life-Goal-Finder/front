import { useTheme, Theme } from "../../providers/theme-provider";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Palette } from "lucide-react";

const THEME_OPTIONS: { value: Theme; label: string; swatch: string; gradient?: string }[] = [
  { value: "light", label: "navbar.themes.light", swatch: "#ffffff" },
  { value: "dark", label: "navbar.themes.dark", swatch: "#0a0a0a" },
  { value: "coral", label: "navbar.themes.coral", swatch: "#F25C54" },
  { value: "yellow", label: "navbar.themes.yellow", swatch: "#FCE44D" },
  { value: "pink", label: "navbar.themes.pink", swatch: "#FCD1E3" },
  {
    value: "lgbt",
    label: "navbar.themes.lgbt",
    swatch: "",
    gradient: "linear-gradient(90deg, #E53935, #FF9800, #FFEB3B, #4CAF50, #2196F3, #9C27B0)",
  },
];

export const ThemeChanger = () => {
  const { setTheme, theme } = useTheme();
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="text-primary gap-2">
          <Palette className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {THEME_OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            className={`flex items-center gap-3 cursor-pointer ${theme === opt.value ? "bg-accent/20 font-semibold" : ""}`}
          >
            <span
              className="w-4 h-4 rounded-full border border-border shrink-0"
              style={{
                backgroundColor: opt.swatch || undefined,
                background: opt.gradient || undefined,
              }}
            />
            <span className="text-sm">{t(opt.label)}</span>
            {theme === opt.value && (
              <span className="ml-auto text-primary text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
