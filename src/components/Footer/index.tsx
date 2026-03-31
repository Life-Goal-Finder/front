import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Target, Github, Heart } from "lucide-react";

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t bg-card/50 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              <span className="text-lg font-extrabold tracking-tight">Life Goal Finder</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t("footer.tagline", "Spin the wheel, accept the challenge, and prove yourself in real life.")}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t("footer.navigation", "Navigation")}
            </h3>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                {t("navbar.home", "Home")}
              </Link>
              <Link to="/leaderboard" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                {t("navbar.leaderboard", "Leaderboard")}
              </Link>
              <Link to="/profile" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                {t("navbar.profile", "Profile")}
              </Link>
              <Link to="/friends" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                {t("navbar.friends", "Friends")}
              </Link>
            </nav>
          </div>

          {/* Project */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t("footer.project", "Project")}
            </h3>
            <p className="text-sm text-foreground/70 leading-relaxed">
              {t("footer.built_with", "Built with React, Express, MongoDB and a lot of ☕")}
            </p>
            <a
              href="https://github.com/Life-Goal-Finder/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-primary transition-colors"
            >
              <Github className="h-4 w-4" />
              {t("footer.source", "Life Goal Finder source code")}
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Life Goal Finder. {t("footer.rights", "All rights reserved.")}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {t("footer.made_with", "Made with")} <Heart className="h-3 w-3 text-red-500 fill-red-500" /> {t("footer.by", "by the team")}
          </p>
        </div>
      </div>
    </footer>
  );
};
