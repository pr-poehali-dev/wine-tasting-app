import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Friend } from "@/types";
import { friendsApi, SearchResult } from "@/lib/api";

interface FriendsProps {
  friends: Friend[];
  onAddFriend: (friendId: string) => void;
  onViewProfile: (friend: Friend) => void;
  onRemoveFriend: (id: string) => void;
}

export default function Friends({ friends, onAddFriend, onViewProfile, onRemoveFriend }: FriendsProps) {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    setSearchError("");
    setSearched(false);
    try {
      const results = await friendsApi.search(search.trim());
      setSearchResults(results);
      setSearched(true);
    } catch (e: unknown) {
      setSearchResults([]);
      setSearchError(e instanceof Error ? e.message : "Ошибка поиска");
      setSearched(true);
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = (result: SearchResult) => {
    onAddFriend(result.id);
    setSearchResults(prev => prev.map(r => r.id === result.id ? { ...r, is_friend: true } : r));
  };

  return (
    <div className="min-h-screen parchment-bg pb-6" style={{ paddingTop: "56px" }}>
      {/* Header */}
      <div className="wine-gradient pt-5 pb-8 px-6 relative overflow-hidden">
        <div className="relative z-10 animate-slide-up">
          <p className="font-body text-xs tracking-[0.2em] uppercase mb-0.5" style={{ color: "hsl(42,90%,70%)" }}>
            Сообщество
          </p>
          <h1 className="font-display text-3xl font-light" style={{ color: "hsl(36,60%,94%)" }}>
            Друзья
          </h1>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-5 max-w-lg mx-auto">
        {/* Search */}
        <div className="card-wine rounded-2xl p-5 animate-slide-up">
          <p className="font-body text-xs font-medium tracking-wide text-muted-foreground uppercase mb-3">
            Найти по никнейму
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="@nickname"
                className="w-full h-11 px-4 pl-10 bg-muted border border-border rounded-xl font-body text-sm"
              />
              <Icon name="Search" size={15} className="absolute left-3 top-3.5 text-muted-foreground" />
            </div>
            <button
              onClick={handleSearch}
              className="h-11 px-5 rounded-xl font-body text-sm font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: "hsl(345,55%,28%)", color: "hsl(36,60%,94%)" }}
            >
              Найти
            </button>
          </div>

          {searching && (
            <p className="mt-3 text-center font-body text-xs text-muted-foreground">Ищем...</p>
          )}
          {searchResults.length > 0 && (
            <div className="mt-3 space-y-2 animate-fade-in">
              {searchResults.map(r => (
                <div key={r.id} className="p-3 rounded-xl flex items-center justify-between"
                  style={{ backgroundColor: "hsl(36,40%,95%)", border: "1px solid hsl(36,20%,85%)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "hsl(36,40%,88%)" }}>
                      <Icon name="User" size={18} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-body text-sm font-medium" style={{ color: "hsl(345,65%,18%)" }}>@{r.nickname}</p>
                      <p className="font-body text-xs text-muted-foreground">{r.tastingsCount} дегустаций</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAdd(r)}
                    disabled={r.is_friend}
                    className="px-3 py-1.5 rounded-lg font-body text-xs font-medium transition-all disabled:opacity-50"
                    style={{ backgroundColor: r.is_friend ? "hsl(36,40%,88%)" : "hsl(345,55%,28%)", color: r.is_friend ? "hsl(345,55%,28%)" : "hsl(36,60%,94%)" }}
                  >
                    {r.is_friend ? "Уже друг" : "Добавить"}
                  </button>
                </div>
              ))}
            </div>
          )}
          {!searching && searched && searchResults.length === 0 && !searchError && (
            <p className="mt-3 text-center font-body text-xs text-muted-foreground">Никого не найдено</p>
          )}
          {searchError && (
            <p className="mt-3 text-center font-body text-xs" style={{ color: "hsl(0,60%,50%)" }}>{searchError}</p>
          )}
        </div>

        {/* Friends list */}
        <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="font-display text-lg font-semibold" style={{ color: "hsl(345,65%,18%)" }}>
              Список друзей
            </p>
            <span className="font-body text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "hsl(36,40%,90%)", color: "hsl(345,55%,28%)" }}>
              {friends.length}
            </span>
          </div>

          {friends.length === 0 ? (
            <div className="text-center py-12 card-wine rounded-2xl">
              <span className="text-4xl block mb-3">🍾</span>
              <p className="font-display text-lg text-muted-foreground mb-1">Пока нет друзей</p>
              <p className="font-body text-sm text-muted-foreground">Найдите других ценителей вина</p>
            </div>
          ) : (
            <div className="space-y-3">
              {friends.map((f) => (
                <div key={f.id} className="card-wine rounded-2xl p-4 flex items-center gap-3 hover-lift">
                  <div
                    className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center cursor-pointer"
                    style={{ backgroundColor: "hsl(36,40%,90%)" }}
                    onClick={() => onViewProfile(f)}
                  >
                    {f.avatar ? (
                      <img src={f.avatar} alt={f.nickname} className="w-full h-full object-cover" />
                    ) : (
                      <Icon name="User" size={20} className="text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onViewProfile(f)}>
                    <p className="font-body text-sm font-semibold truncate" style={{ color: "hsl(345,65%,18%)" }}>
                      @{f.nickname}
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      {f.tastingsCount} дегустаций · ⭐ {f.avgRating}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => onViewProfile(f)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
                      style={{ backgroundColor: "hsl(36,40%,92%)", color: "hsl(345,55%,28%)" }}
                    >
                      <Icon name="User" size={15} />
                    </button>
                    <button
                      onClick={() => onRemoveFriend(f.id)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
                      style={{ backgroundColor: "hsl(0,0%,97%)", color: "hsl(0,60%,55%)" }}
                    >
                      <Icon name="UserMinus" size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}