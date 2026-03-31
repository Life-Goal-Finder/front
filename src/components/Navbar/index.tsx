import { Link, useNavigate } from "react-router-dom";
import { ThemeChanger } from "./themeChanger";
import { LanguageChanger } from "./languageChanger";
import { useTranslation } from "react-i18next";
import { Separator } from "../ui/separator";
import { Home, Trophy, User, Users, LogOut, Menu, X, LogIn, UserPlus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useAuthContext } from "@/contexts/authContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useLogout } from "@/hooks/useLogout";
import { AvatarWithStatusCell } from "@/components/customs/avatarStatusCell";
import { useConfigContext } from "../../contexts/configContext";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const menuRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { logout, loading } = useLogout();
  const { authUser } = useAuthContext();
  const { getConfigValue } = useConfigContext();

  useEffect(() => {
    const fetchConfigValues = async () => {
      const values = await getConfigValue(["APP_NAME"]);
      setConfigValues(values);
    };
    fetchConfigValues();
  }, [getConfigValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const closeDialogAndNavigate = (link: string) => {
    setIsOpen(false);
    navigate(link);
  };

  const navLinks = [
    {
      label: t("navbar.home"),
      path: "/",
      icon: Home,
      auth: true,
    },
    {
      label: t("navbar.profile", "Profile"),
      path: "/profile",
      icon: User,
      auth: true,
    },
    {
      label: t("navbar.leaderboard", "Leaderboard"),
      path: "/leaderboard",
      icon: Trophy,
      auth: true,
    },
    {
      label: t("navbar.friends", "Friends"),
      path: "/friends",
      icon: Users,
      auth: true,
    },
  ];

  const mobileLinks = [
    {
      label: t("navbar.home"),
      path: "/",
      icon: Home,
    },
    {
      label: t("navbar.profile", "Profile"),
      path: "/profile",
      icon: User,
      auth: !!authUser,
    },
    {
      label: t("navbar.leaderboard", "Leaderboard"),
      path: "/leaderboard",
      icon: Trophy,
      auth: !!authUser,
    },
    {
      label: t("navbar.friends", "Friends"),
      path: "/friends",
      icon: Users,
      auth: !!authUser,
    },
    {
      label: t("navbar.login"),
      path: "/login",
      icon: LogIn,
      auth: !authUser,
    },
    {
      label: t("navbar.register", "Register"),
      path: "/register",
      icon: UserPlus,
      auth: !authUser,
    },
  ];

  return (
    <>
      <div className="sticky top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        {/* Desktop */}
        <div className="hidden select-none md:flex items-center justify-between p-4 px-8 text-accent">
          <div className="text-2xl font-extrabold tracking-tight">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-primary">🎯</span>
              {configValues["APP_NAME"] || "Life Goal Finder"}
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {authUser ? (
                <>
                  {navLinks
                    .filter((link) => link.auth)
                    .map((link) => (
                      <Button key={link.path} onClick={() => navigate(link.path)} variant="ghost" size="sm" className="flex items-center gap-1.5">
                        <link.icon className="w-4 h-4" />
                        {link.label}
                      </Button>
                    ))}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild className="hover:cursor-pointer">
                      <span>
                        <AvatarWithStatusCell user={authUser} />
                      </span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-44">
                      <DropdownMenuLabel>
                        {authUser.name} {authUser.forename}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        {navLinks
                          .filter((link) => link.auth)
                          .map((link) => (
                            <DropdownMenuItem
                              key={link.path}
                              className="flex items-center gap-2 hover:cursor-pointer"
                              onClick={() => navigate(link.path)}
                            >
                              {link.label}
                              <DropdownMenuShortcut>
                                <link.icon className="w-4 h-4" />
                              </DropdownMenuShortcut>
                            </DropdownMenuItem>
                          ))}
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem className="hover:cursor-pointer" onClick={() => logout()} disabled={loading}>
                          {t("navbar.logout")}
                          <DropdownMenuShortcut>
                            <LogOut className="w-4 h-4" />
                          </DropdownMenuShortcut>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={() => navigate("/login")} variant="ghost">
                    {t("navbar.login")}
                  </Button>
                  <Button onClick={() => navigate("/register")} variant="default">
                    {t("navbar.register", "Register")}
                  </Button>
                </div>
              )}
            </div>
            <Separator orientation="vertical" className="h-8" />
            <div className="flex items-center justify-between gap-2">
              <LanguageChanger />
              <ThemeChanger />
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="flex items-center justify-between p-4 md:hidden">
          <div className="text-xl font-extrabold text-accent flex items-center gap-2">
            <Link to="/">
              <span className="text-primary">🎯</span> {configValues["APP_NAME"] || "LGF"}
            </Link>
          </div>
          <Menu onClick={() => setIsOpen(!isOpen)} className="cursor-pointer" />
        </div>

        <div
          ref={menuRef}
          className={cn(
            "fixed top-0 right-0 w-4/5 h-screen overflow-hidden bg-background transition-transform duration-300 ease-in-out z-20 border-l",
            isOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex justify-end">
            <X onClick={() => setIsOpen(!isOpen)} className="m-4 cursor-pointer" />
          </div>
          <div className="flex flex-col gap-4 p-8 pt-2">
            {mobileLinks
              .filter((link) => link.auth === undefined || link.auth)
              .map((link) => (
                <Button
                  key={link.path}
                  onClick={() => closeDialogAndNavigate(link.path)}
                  variant="ghost"
                  className="flex items-center justify-start gap-4"
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Button>
              ))}
            {authUser && (
              <>
                <Separator />
                <Button onClick={() => logout()} variant="ghost" disabled={loading} className="flex items-center justify-start gap-4">
                  <LogOut className="w-4 h-4" />
                  {t("navbar.logout")}
                </Button>
              </>
            )}
            <Separator />
            <div className="flex items-center justify-center gap-4">
              <LanguageChanger />
              <ThemeChanger />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
