import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { RouletteWheel } from "@/components/Roulette/RouletteWheel";
import { axiosConfig } from "@/config/axiosConfig";
import { CategoryInterface, GoalInterface, UserGoalInterface } from "@/interfaces/Quest";
import { useAuthContext } from "@/contexts/authContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Clock,
  Users,
  User,
  MapPin,
  Home as HomeIcon,
  Sparkles,
  Trophy,
  Zap,
  CheckCircle,
  XCircle,
  Loader2,
  Camera,
  Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const Home = () => {
  const { t, i18n } = useTranslation();
  const { authUser } = useAuthContext();
  const navigate = useNavigate();
  const resultModalRef = useRef<HTMLDivElement>(null);

  // State
  const [categories, setCategories] = useState<CategoryInterface[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxDuration, setMaxDuration] = useState<number>(120);
  const [isGroup, setIsGroup] = useState<boolean | undefined>(undefined);
  const [isIndoor, setIsIndoor] = useState<boolean | undefined>(undefined);

  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<GoalInterface | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [activeQuest, setActiveQuest] = useState<UserGoalInterface | null>(null);
  const [loadingQuest, setLoadingQuest] = useState(true);

  // Completion form state
  const [isCompleting, setIsCompleting] = useState(false);
  const [proofNote, setProofNote] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);

  // Fetch categories and active quest
  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await axiosConfig.get("/categories");
        setCategories(catRes.data);

        if (authUser) {
          const questRes = await axiosConfig.get("/user-goals", { params: { status: "in_progress" } });
          if (questRes.data && questRes.data.length > 0) {
            setActiveQuest(questRes.data[0]);
          }
        } else {
          const localQuest = localStorage.getItem("guest_active_quest");
          if (localQuest) {
            try { setActiveQuest(JSON.parse(localQuest)); } catch (e) {}
          }
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoadingQuest(false);
      }
    };
    fetchData();
  }, []);

  // Active wheel categories calculation
  const activeWheelCategories = selectedCategories.length > 0
    ? categories.filter((c) => selectedCategories.includes(c._id))
    : categories;

  // Spin handler
  const handleSpin = async () => {
    if (isSpinning) return;
    setShowResult(false);
    setSpinResult(null);

    try {
      const body: any = {};
      if (selectedCategories.length > 0) body.categories = selectedCategories;
      if (maxDuration) body.max_duree = maxDuration;
      if (isGroup !== undefined) body.is_group = isGroup;
      if (isIndoor !== undefined) body.is_indoor = isIndoor;

      const res = await axiosConfig.post("/roulette/spin", body);
      const goal: GoalInterface = res.data.goal;

      // Find category index for wheel among the active ones
      const catIndex = activeWheelCategories.findIndex(
        (c) => c._id === (typeof goal.category_id === "string" ? goal.category_id : goal.category_id._id)
      );
      setSelectedIndex(catIndex >= 0 ? catIndex : 0);
      setSpinResult(goal);
      setIsSpinning(true);
    } catch (err: any) {
      console.error("Spin failed:", err);
      toast.error("Failed to spin the wheel.");
    }
  };

  const handleSpinEnd = useCallback(() => {
    setIsSpinning(false);
    setShowResult(true);
    // Smoothly scroll to the result box so the user doesn't miss it on large displays
    setTimeout(() => {
      resultModalRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }, []);

  // Accept quest
  const handleAccept = async () => {
    if (!spinResult) return;
    if (!authUser) {
      const fakeGuestQuest: any = {
        _id: "guest-quest-" + Date.now(),
        user_id: "guest",
        goal_id: spinResult,
        status: "in_progress",
        started_at: new Date().toISOString()
      };
      setActiveQuest(fakeGuestQuest);
      localStorage.setItem("guest_active_quest", JSON.stringify(fakeGuestQuest));
      setShowResult(false);
      setSpinResult(null);
      return;
    }
    try {
      await axiosConfig.post("/roulette/accept", { goal_id: spinResult._id });
      setShowResult(false);
      setSpinResult(null);
      // Re-fetch active quest to update UI
      const questRes = await axiosConfig.get("/user-goals", { params: { status: "in_progress" } });
      if (questRes.data && questRes.data.length > 0) {
        setActiveQuest(questRes.data[0]);
      }
    } catch (err) {
      console.error("Accept failed:", err);
      toast.error("Failed to accept quest.");
    }
  };

  // Skip quest
  const handleSkip = () => {
    setShowResult(false);
    setSpinResult(null);
  };

  // Complete active quest
  const handleSubmitCompletion = async () => {
    if (!activeQuest) return;
    if (!proofNote.trim()) {
      toast.error(t("pages.home.proof_note") + " is missing!");
      return;
    }

    setIsSubmitting(true);
    try {
      if (proofFile) {
        const formData = new FormData();
        formData.append("note", proofNote);
        formData.append("image", proofFile);
        await axiosConfig.post(`/user-goals/${activeQuest._id}/complete`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await axiosConfig.post(`/user-goals/${activeQuest._id}/complete`, {
          note: proofNote,
        });
      }
      toast.success(t("pages.home.success_completion"));
      setActiveQuest(null);
      setIsCompleting(false);
      setProofNote("");
      setProofFile(null);
      // Force reload authUser points by triggering auth context refresh if possible, or just let it update on next fetch
      window.location.reload(); // Quick way to refresh points in header
    } catch (err) {
      console.error("Completion failed:", err);
      toast.error("Failed to complete quest.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Abandon active quest
  const handleAbandonClick = () => {
    if (!activeQuest) return;
    setShowAbandonConfirm(true);
  };

  const handleConfirmAbandon = async () => {
    if (!activeQuest) return;
    setShowAbandonConfirm(false);

    if (!authUser) {
      localStorage.removeItem("guest_active_quest");
      setActiveQuest(null);
      setIsCompleting(false);
      toast.success(t("pages.home.success_abandon"));
      return;
    }

    setIsSubmitting(true);
    try {
      await axiosConfig.post(`/user-goals/${activeQuest._id}/fail`);
      toast.success(t("pages.home.success_abandon"));
      setActiveQuest(null);
      setIsCompleting(false);
    } catch (err) {
      console.error("Abandon failed:", err);
      toast.error("Failed to abandon quest.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle category filter
  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {t("pages.home.title", "La Roulette")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("pages.home.subtitle", "Spin the wheel. Accept the challenge. Prove yourself.")}
            </p>
          </div>
          {authUser && (
            <div className="hidden md:flex items-center gap-3 bg-card border rounded-xl px-4 py-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="font-bold text-lg">{authUser.points || 0}</span>
              <span className="text-muted-foreground text-sm">{t("common.points", "pts")}</span>
            </div>
          )}
        </div>
      </div>

      <Separator className="my-4" />

      {/* Main Content */}
      <div className="px-6 pb-12 flex-1">
        {loadingQuest ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : activeQuest ? (
          /* ACTIVE QUEST VIEW */
          <div className="max-w-3xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-card border-2 border-primary rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              {/* Background accent */}
              <div
                className="absolute top-0 left-0 right-0 h-2"
                style={{ backgroundColor: typeof activeQuest.goal_id !== "string" && typeof activeQuest.goal_id.category_id !== "string" ? activeQuest.goal_id.category_id.color : "var(--primary)" }}
              />

              <div className="text-center mb-8">
                <Badge variant="outline" className="mb-4 px-4 py-1 text-sm border-primary text-primary">
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t("pages.home.active_quest_title", "Active Quest")}
                </Badge>
                <h2 className="text-4xl font-extrabold mb-3">
                  {typeof activeQuest.goal_id !== "string" ? (activeQuest.goal_id.libelle as any)[i18n.language] || (activeQuest.goal_id.libelle as any).en : "Quest"}
                </h2>
                <p className="text-xl text-muted-foreground max-w-xl mx-auto">
                  {typeof activeQuest.goal_id !== "string" ? (activeQuest.goal_id.description as any)[i18n.language] || (activeQuest.goal_id.description as any).en : ""}
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-3 mb-10">
                {typeof activeQuest.goal_id !== "string" && activeQuest.goal_id.category_id && (
                  <Badge
                    style={{ backgroundColor: typeof activeQuest.goal_id.category_id !== "string" ? activeQuest.goal_id.category_id.color : undefined }}
                    className="text-black font-semibold text-sm py-1.5 px-3"
                  >
                    {typeof activeQuest.goal_id.category_id !== "string" ? (activeQuest.goal_id.category_id.libelle as any)[i18n.language] || (activeQuest.goal_id.category_id.libelle as any).en : ""}
                  </Badge>
                )}
                <Badge variant="secondary" className="flex items-center gap-1.5 text-sm py-1.5 px-3">
                  <Clock className="h-4 w-4" />
                  {typeof activeQuest.goal_id !== "string" ? activeQuest.goal_id.duree : 0} min
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1.5 text-sm py-1.5 px-3">
                  {typeof activeQuest.goal_id !== "string" && activeQuest.goal_id.is_group ? <Users className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  {typeof activeQuest.goal_id !== "string" && activeQuest.goal_id.is_group ? t("common.group", "Group") : t("common.solo", "Solo")}
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1.5 text-sm py-1.5 px-3">
                  {typeof activeQuest.goal_id !== "string" && activeQuest.goal_id.is_indoor ? <HomeIcon className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                  {typeof activeQuest.goal_id !== "string" && activeQuest.goal_id.is_indoor ? t("common.indoor", "Indoor") : t("common.outdoor", "Outdoor")}
                </Badge>
              </div>

              {isCompleting ? (
                <div className="space-y-6 bg-muted/50 p-6 rounded-2xl border animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <Label htmlFor="proof-note" className="font-bold">
                      {t("pages.home.proof_note", "How did it go? (Required)")}
                    </Label>
                    <textarea
                      id="proof-note"
                      placeholder={t("pages.home.proof_note_placeholder", "Share your experience...") as string}
                      value={proofNote}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProofNote(e.target.value)}
                      className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      {t("pages.home.proof_image", "Upload a proof image (Optional)")}
                    </Label>
                    <div
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer relative ${proofFile ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:bg-muted/50 bg-background'}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          setProofFile(e.dataTransfer.files[0]);
                        }
                      }}
                    >
                      <Input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setProofFile(e.target.files[0]);
                          }
                        }}
                      />
                      {proofFile ? (
                        <div className="flex flex-col items-center gap-2">
                          <CheckCircle className="h-8 w-8 text-primary mb-1" />
                          <p className="font-bold text-sm text-primary">{proofFile.name}</p>
                          <p className="text-xs text-muted-foreground">Click or drag a new image to replace</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Camera className="h-8 w-8 text-muted-foreground mb-1" />
                          <p className="text-sm text-muted-foreground">Click or drag image here</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button onClick={handleSubmitCompletion} disabled={isSubmitting || !proofNote.trim()} className="flex-1 font-bold py-6 font-bold">
                      {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle className="h-5 w-5 mr-2" />}
                      {t("pages.home.complete_quest", "Complete Quest")}
                    </Button>
                    <Button onClick={() => setIsCompleting(false)} variant="outline" disabled={isSubmitting} className="py-6 font-bold">
                      {t("global.buttons.cancel", "Cancel")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {authUser ? (
                    <Button onClick={() => setIsCompleting(true)} size="lg" className="w-full sm:w-auto font-bold py-6 px-8 text-lg shadow-lg hover:shadow-xl transition-all">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      {t("pages.home.complete_quest", "Complete Quest")}
                    </Button>
                  ) : (
                    <Button onClick={() => navigate("/login")} size="lg" className="w-full sm:w-auto font-bold py-6 px-8 text-lg shadow-lg hover:shadow-xl transition-all border border-primary">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      {t("pages.home.login_to_complete", "Se connecter pour terminer")}
                    </Button>
                  )}
                  <Button onClick={handleAbandonClick} disabled={isSubmitting} variant="destructive" size="lg" className="w-full sm:w-auto font-bold py-6 px-8 text-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/20 shadow-none">
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <XCircle className="h-5 w-5 mr-2" />}
                    {t("pages.home.abandon_quest", "Abandon Quest")}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ROULETTE VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left: Roulette Wheel (3 cols) */}
            <div className="lg:col-span-3 flex flex-col items-center gap-6 w-full">
              <div className="relative w-full flex justify-center">
                <RouletteWheel
                  categories={activeWheelCategories}
                  isSpinning={isSpinning}
                  onSpinEnd={handleSpinEnd}
                  selectedIndex={selectedIndex}
                />
              </div>

              {/* Spin Button */}
              <Button
                onClick={handleSpin}
                disabled={isSpinning || categories.length === 0}
                size="lg"
                className="text-lg px-12 py-6 rounded-full font-bold tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {isSpinning ? (
                  <span className="flex items-center gap-2">
                    <Zap className="h-5 w-5 animate-spin" />
                    {t("pages.home.spinning", "Spinning...")}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    {t("pages.home.spin", "Spin the Wheel!")}
                  </span>
                )}
              </Button>

              {/* Result Modal */}
              {showResult && spinResult && (
                <div ref={resultModalRef} className="w-full max-w-md mx-auto animate-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-card border-2 border-primary rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <h3 className="font-bold text-lg">{t("pages.home.your_quest", "Your Quest!")}</h3>
                    </div>
                    <h2 className="text-2xl font-extrabold mb-2">{(spinResult.libelle as any)[i18n.language] || (spinResult.libelle as any).en}</h2>
                    <p className="text-muted-foreground mb-4">{(spinResult.description as any)[i18n.language] || (spinResult.description as any).en}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {typeof spinResult.category_id !== "string" && (
                        <Badge
                          style={{ backgroundColor: spinResult.category_id.color }}
                          className="text-black font-semibold"
                        >
                          {(spinResult.category_id.libelle as any)[i18n.language] || (spinResult.category_id.libelle as any).en}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {spinResult.duree} min
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {spinResult.is_group ? <Users className="h-3 w-3" /> : <User className="h-3 w-3" />}
                        {spinResult.is_group ? t("common.group", "Group") : t("common.solo", "Solo")}
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {spinResult.is_indoor ? <HomeIcon className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                        {spinResult.is_indoor ? t("common.indoor", "Indoor") : t("common.outdoor", "Outdoor")}
                      </Badge>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={handleAccept}
                        className="flex-1 font-bold py-5"
                        size="lg"
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        {t("pages.home.accept", "Accept Quest")}
                      </Button>
                      <Button
                        onClick={handleSkip}
                        variant="outline"
                        className="flex-1 font-bold py-5"
                        size="lg"
                      >
                        <XCircle className="h-5 w-5 mr-2" />
                        {t("pages.home.skip", "Skip")}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Filters Panel (2 cols) */}
            <div className="lg:col-span-2">
              <div className="bg-card border rounded-2xl p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  {t("pages.home.customize", "Customize Roulette")}
                </h2>

                {/* Category Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
                    {t("pages.home.categories", "Categories")}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() => toggleCategory(cat._id)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${selectedCategories.includes(cat._id)
                            ? "scale-105 shadow-md"
                            : "opacity-60 hover:opacity-100"
                          }`}
                        style={{
                          backgroundColor: selectedCategories.includes(cat._id) ? cat.color : "transparent",
                          borderColor: cat.color,
                          color: selectedCategories.includes(cat._id) ? "#000" : "var(--foreground)",
                        }}
                      >
                        {(cat.libelle as any)[i18n.language] || (cat.libelle as any).en}
                      </button>
                    ))}
                    {categories.length === 0 && (
                      <p className="text-muted-foreground text-sm italic">
                        {t("pages.home.no_categories", "No categories available")}
                      </p>
                    )}
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Duration Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {t("pages.home.time_available", "Time Available")}
                  </h3>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={5}
                      max={240}
                      step={5}
                      value={maxDuration}
                      onChange={(e) => setMaxDuration(Number(e.target.value))}
                      className="w-full accent-[var(--primary)]"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>5 min</span>
                      <span className="font-bold text-foreground">{maxDuration} min</span>
                      <span>4h</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Group/Solo Toggle */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
                    {t("pages.home.mode", "Mode")}
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setIsGroup(undefined)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${isGroup === undefined ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-muted"
                        }`}
                    >
                      {t("common.all", "All")}
                    </button>
                    <button
                      onClick={() => setIsGroup(false)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all flex items-center justify-center gap-1 ${isGroup === false ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-muted"
                        }`}
                    >
                      <User className="h-3.5 w-3.5" />
                      {t("common.solo", "Solo")}
                    </button>
                    <button
                      onClick={() => setIsGroup(true)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all flex items-center justify-center gap-1 ${isGroup === true ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-muted"
                        }`}
                    >
                      <Users className="h-3.5 w-3.5" />
                      {t("common.group", "Group")}
                    </button>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Indoor/Outdoor Toggle */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
                    {t("pages.home.location", "Location")}
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setIsIndoor(undefined)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${isIndoor === undefined ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-muted"
                        }`}
                    >
                      {t("common.all", "All")}
                    </button>
                    <button
                      onClick={() => setIsIndoor(true)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all flex items-center justify-center gap-1 ${isIndoor === true ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-muted"
                        }`}
                    >
                      <HomeIcon className="h-3.5 w-3.5" />
                      {t("common.indoor", "Indoor")}
                    </button>
                    <button
                      onClick={() => setIsIndoor(false)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all flex items-center justify-center gap-1 ${isIndoor === false ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-muted"
                        }`}
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      {t("common.outdoor", "Outdoor")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showAbandonConfirm} onOpenChange={setShowAbandonConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("pages.home.abandon_quest", "Abandon Quest")}</DialogTitle>
            <DialogDescription>
              {t("pages.home.confirm_abandon", "Are you sure you want to abandon this quest? It will be marked as a failure.")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setShowAbandonConfirm(false)}>
              {t("global.buttons.cancel", "Cancel")}
            </Button>
            <Button variant="destructive" onClick={handleConfirmAbandon}>
              {t("pages.home.abandon_quest", "Abandon")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
