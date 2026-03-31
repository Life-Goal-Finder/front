import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { axiosConfig } from "@/config/axiosConfig";
import { useAuthContext } from "@/contexts/authContext";
import { UserGoalInterface } from "@/interfaces/Quest";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  User,
  Star,
  MapPin,
  Home as HomeIcon,
  Users,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Profile = () => {
  const { t, i18n } = useTranslation();
  const { authUser } = useAuthContext();
  const [quests, setQuests] = useState<UserGoalInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuest, setSelectedQuest] = useState<UserGoalInterface | null>(null);

  useEffect(() => {
    const fetchQuests = async () => {
      setLoading(true);
      try {
        const res = await axiosConfig.get("/user-goals");
        setQuests(res.data);
      } catch (err) {
        console.error("Failed to fetch quests:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuests();
  }, []);

  const historyQuests = quests.filter((q) => q.status !== "in_progress");
  const activeCount = quests.filter((q) => q.status === "in_progress").length;
  const completedCount = quests.filter((q) => q.status === "completed").length;

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-card border rounded-2xl p-8 mb-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-muted border-4 border-primary shadow-lg shrink-0">
            {authUser?.avatar ? (
              <img src={authUser.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold">{authUser?.username}</h1>
            <p className="text-muted-foreground">{authUser?.name} {authUser?.forename}</p>
            <p className="text-muted-foreground text-sm">{authUser?.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-muted rounded-xl p-4 text-center">
            <Trophy className="h-6 w-6 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{authUser?.points || 0}</p>
            <p className="text-muted-foreground text-sm">{t("profile.points", "Points")}</p>
          </div>
          <div className="bg-muted rounded-xl p-4 text-center">
            <Target className="h-6 w-6 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{activeCount}</p>
            <p className="text-muted-foreground text-sm">{t("profile.active_quests", "Active")}</p>
          </div>
          <div className="bg-muted rounded-xl p-4 text-center">
            <Star className="h-6 w-6 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{completedCount}</p>
            <p className="text-muted-foreground text-sm">{t("profile.completed", "Completed")}</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-extrabold mb-4">{t("profile.tab_history", "History")}</h2>
      <Separator className="mb-4" />

      {/* Quest List */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : historyQuests.length === 0 ? (
        <div className="text-center p-12 text-muted-foreground bg-card border rounded-2xl">
          <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">
            {t("profile.no_history", "No completed quests yet.")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {historyQuests
            .map((quest) => (
              <div 
                key={quest._id} 
                className="bg-card border rounded-xl p-4 flex items-center gap-4 hover:border-primary hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedQuest(quest)}
              >
                <div className="shrink-0">
                  {quest.status === "completed" ? (
                    <CheckCircle className="h-8 w-8 text-success" />
                  ) : quest.status === "failed" ? (
                    <XCircle className="h-8 w-8 text-destructive" />
                  ) : (
                    <Clock className="h-8 w-8 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate">
                    {typeof quest.goal_id === "object" && quest.goal_id !== null ? (quest.goal_id.libelle as any)[i18n.language] || (quest.goal_id.libelle as any).en : t("common.deleted_quest", "Deleted Quest")}
                  </h3>
                  <p className="text-muted-foreground text-sm truncate">
                    {typeof quest.goal_id === "object" && quest.goal_id !== null ? (quest.goal_id.description as any)[i18n.language] || (quest.goal_id.description as any).en : "-"}
                  </p>
                  <div className="flex gap-2 mt-1">
                    {typeof quest.goal_id === "object" && quest.goal_id !== null && quest.goal_id.category_id && (
                      <Badge
                        style={{
                          backgroundColor:
                            typeof quest.goal_id.category_id === "object" && quest.goal_id.category_id !== null
                              ? quest.goal_id.category_id.color
                              : undefined,
                        }}
                        className="text-black text-xs"
                      >
                        {typeof quest.goal_id.category_id === "object" && quest.goal_id.category_id !== null
                          ? (quest.goal_id.category_id.libelle as any)[i18n.language] || (quest.goal_id.category_id.libelle as any).en
                          : ""}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {typeof quest.goal_id === "object" && quest.goal_id !== null ? `${quest.goal_id.duree} min` : ""}
                    </Badge>
                  </div>
                </div>
                <Badge
                  variant={
                    quest.status === "completed"
                      ? "default"
                      : quest.status === "failed"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {quest.status}
                </Badge>
              </div>
            ))}
        </div>
      )}

      {/* Quest Details Modal */}
      {selectedQuest && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedQuest(null)}
        >
          <div 
            className="bg-card border rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">
                {typeof selectedQuest.goal_id === "object" && selectedQuest.goal_id !== null ? (selectedQuest.goal_id.libelle as any)[i18n.language] || (selectedQuest.goal_id.libelle as any).en : t("common.deleted_quest", "Deleted Quest")}
              </h2>
              <Badge variant={selectedQuest.status === "completed" ? "default" : selectedQuest.status === "failed" ? "destructive" : "secondary"}>
                {selectedQuest.status}
              </Badge>
            </div>
            
            {typeof selectedQuest.goal_id === "object" && selectedQuest.goal_id !== null && (
              <p className="text-muted-foreground mb-4">
                {(selectedQuest.goal_id.description as any)[i18n.language] || (selectedQuest.goal_id.description as any).en}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mb-6">
              {typeof selectedQuest.goal_id === "object" && selectedQuest.goal_id !== null && selectedQuest.goal_id.category_id && (
                <Badge
                  style={{ backgroundColor: typeof selectedQuest.goal_id.category_id === "object" && selectedQuest.goal_id.category_id !== null ? selectedQuest.goal_id.category_id.color : undefined }}
                  className="text-black text-xs px-2 py-1"
                >
                  {typeof selectedQuest.goal_id.category_id === "object" && selectedQuest.goal_id.category_id !== null ? (selectedQuest.goal_id.category_id.libelle as any)[i18n.language] || (selectedQuest.goal_id.category_id.libelle as any).en : ""}
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs px-2 py-1 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {typeof selectedQuest.goal_id === "object" && selectedQuest.goal_id !== null ? selectedQuest.goal_id.duree : 0} min
              </Badge>
              <Badge variant="secondary" className="text-xs px-2 py-1 flex items-center gap-1">
                {typeof selectedQuest.goal_id === "object" && selectedQuest.goal_id !== null && selectedQuest.goal_id.is_group ? <Users className="h-3 w-3" /> : <User className="h-3 w-3" />}
                {typeof selectedQuest.goal_id === "object" && selectedQuest.goal_id !== null && selectedQuest.goal_id.is_group ? "Group" : "Solo"}
              </Badge>
              <Badge variant="secondary" className="text-xs px-2 py-1 flex items-center gap-1">
                {typeof selectedQuest.goal_id === "object" && selectedQuest.goal_id !== null && selectedQuest.goal_id.is_indoor ? <HomeIcon className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                {typeof selectedQuest.goal_id === "object" && selectedQuest.goal_id !== null && selectedQuest.goal_id.is_indoor ? "Indoor" : "Outdoor"}
              </Badge>
            </div>

            {selectedQuest.status === "completed" && selectedQuest.progress_id && (
              <div className="bg-muted rounded-xl p-4 mb-6">
                <h4 className="font-bold mb-2 flex items-center justify-between text-sm text-muted-foreground uppercase tracking-wide">
                  <span>Proof Note</span>
                  <span className="text-primary font-bold">+{selectedQuest.progress_id.value} pts</span>
                </h4>
                <p className="text-base italic">"{selectedQuest.progress_id.note}"</p>
                
                {selectedQuest.progress_id.image_url && (
                  <div className="mt-4 rounded-lg overflow-hidden border">
                    <img 
                      src={`http://localhost:5000${selectedQuest.progress_id.image_url}`} 
                      alt="Proof" 
                      className="w-full h-auto object-cover max-h-64"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t flex justify-end">
              <Button onClick={() => setSelectedQuest(null)} variant="outline">
                {t("global.buttons.cancel", "Close")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
