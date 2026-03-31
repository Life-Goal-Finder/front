import { useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosConfig } from "@/config/axiosConfig";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, Check, Clock, Loader2 } from "lucide-react";

interface SearchResult {
  _id: string;
  username: string;
  name: string;
  forename: string;
  avatar: string;
  points: number;
}

export const FriendSearch = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await axiosConfig.get(`/friends/search?q=${encodeURIComponent(query)}`);
      setResults(res.data);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (userId: string) => {
    try {
      await axiosConfig.post("/friends/request", { friend_id: userId });
      setSentRequests((prev) => new Set(Array.from(prev).concat(userId)));
    } catch (err) {
      console.error("Friend request failed:", err);
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
        <Search className="h-8 w-8 text-primary" />
        {t("pages.friend_search.title", "Find Friends")}
      </h1>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder={t("pages.friend_search.placeholder", "Search by username or name...")}
            className="w-full pl-10 pr-4 py-3 bg-card border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary truncate"
          />
        </div>
        <Button onClick={handleSearch} disabled={loading} size="lg" className="rounded-xl">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("common.search", "Search")}
        </Button>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {results.map((user) => (
          <div
            key={user._id}
            className="bg-card border rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-full overflow-hidden bg-muted shrink-0">
              {user.avatar && (
                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate">{user.username}</p>
              <p className="text-muted-foreground text-sm truncate">
                {user.name} {user.forename}
              </p>
              <p className="text-primary text-sm font-medium">{user.points} pts</p>
            </div>
            {sentRequests.has(user._id) ? (
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <Clock className="h-4 w-4" />
                {t("pages.friend_search.pending", "Pending")}
              </div>
            ) : (
              <Button
                onClick={() => handleAddFriend(user._id)}
                size="sm"
                className="flex items-center gap-1"
              >
                <UserPlus className="h-4 w-4" />
                {t("pages.friend_search.add", "Add")}
              </Button>
            )}
          </div>
        ))}
        {results.length === 0 && query && !loading && (
          <div className="text-center p-12 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{t("pages.friend_search.no_results", "No users found")}</p>
          </div>
        )}
      </div>
    </div>
  );
};
