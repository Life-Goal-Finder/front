import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { axiosConfig } from "@/config/axiosConfig";
import { LeaderboardUser } from "@/interfaces/Quest";
import { useAuthContext } from "@/contexts/authContext";
import { Trophy, Medal, Crown, Users, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const Leaderboard = () => {
  const { t } = useTranslation();
  const { authUser } = useAuthContext();
  const [activeTab, setActiveTab] = useState<"global" | "friends">("global");
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const endpoint = activeTab === "global" ? "/leaderboard/global" : "/leaderboard/friends";
        const res = await axiosConfig.get(endpoint);
        setUsers(res.data);
      } catch (err) {
        console.error("Leaderboard fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [activeTab]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-amber-700" />;
      default:
        return <span className="text-muted-foreground font-bold text-lg w-6 text-center">{index + 1}</span>;
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-extrabold tracking-tight">
          {t("pages.leaderboard.title", "Leaderboard")}
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === "global" ? "default" : "outline"}
          onClick={() => setActiveTab("global")}
          className="flex items-center gap-2"
        >
          <Globe className="h-4 w-4" />
          {t("pages.leaderboard.global", "Global")}
        </Button>
        <Button
          variant={activeTab === "friends" ? "default" : "outline"}
          onClick={() => setActiveTab("friends")}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          {t("pages.leaderboard.friends", "Friends")}
        </Button>
      </div>

      <Separator className="mb-6" />

      {/* Podium (Top 3) */}
      {users.length >= 3 && (
        <div className="flex items-end justify-center gap-4 mb-8">
          {/* 2nd Place */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-4 border-gray-400 overflow-hidden bg-muted">
              {users[1]?.avatar && (
                <img src={users[1].avatar} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <p className="font-bold text-sm mt-1">{users[1]?.username}</p>
            <p className="text-primary font-bold">{users[1]?.points} pts</p>
            <div className="w-20 h-20 bg-secondary rounded-t-lg flex items-center justify-center mt-2">
              <Medal className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full border-4 border-yellow-500 overflow-hidden bg-muted shadow-lg">
              {users[0]?.avatar && (
                <img src={users[0].avatar} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <p className="font-extrabold mt-1">{users[0]?.username}</p>
            <p className="text-primary font-bold text-lg">{users[0]?.points} pts</p>
            <div className="w-24 h-28 bg-primary/20 rounded-t-lg flex items-center justify-center mt-2 border-2 border-primary">
              <Crown className="h-10 w-10 text-yellow-500" />
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-4 border-amber-700 overflow-hidden bg-muted">
              {users[2]?.avatar && (
                <img src={users[2].avatar} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <p className="font-bold text-sm mt-1">{users[2]?.username}</p>
            <p className="text-primary font-bold">{users[2]?.points} pts</p>
            <div className="w-20 h-16 bg-secondary rounded-t-lg flex items-center justify-center mt-2">
              <Medal className="h-8 w-8 text-amber-700" />
            </div>
          </div>
        </div>
      )}

      {/* Full Ranking List */}
      <div className="bg-card border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            {t("common.loading", "Loading...")}
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {t("pages.leaderboard.empty", "No users found")}
          </div>
        ) : (
          users.map((user, index) => (
            <div
              key={user._id}
              className={`flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/50 ${
                user._id === authUser?._id ? "bg-primary/5 border-l-4 border-primary" : ""
              } ${index !== users.length - 1 ? "border-b" : ""}`}
            >
              <div className="flex items-center justify-center w-8">
                {getRankIcon(index)}
              </div>
              <div className="w-10 h-10 rounded-full overflow-hidden bg-muted shrink-0">
                {user.avatar && (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">
                  {user.username}
                  {user._id === authUser?._id && (
                    <span className="text-primary text-xs ml-2">({t("common.you", "You")})</span>
                  )}
                </p>
                <p className="text-muted-foreground text-sm truncate">
                  {user.name} {user.forename}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{user.points}</p>
                <p className="text-muted-foreground text-xs">{t("common.points", "pts")}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
