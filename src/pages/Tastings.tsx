import { useState } from "react";
import Icon from "@/components/ui/icon";
import { TastingCard as TastingCardType } from "@/types";

interface TastingsProps {
  tastings: TastingCardType[];
  onNew: () => void;
  onView: (id: string) => void;
  userProfile: { nickname: string; avatar: string };
}

const WINE_STYLE_COLORS: Record<string, string> = {
  "Красное": "hsl(345, 55%, 28%)",
  "Белое": "hsl(45, 70%, 45%)",
  "Розовое": "hsl(350, 70%, 60%)",
  "Игристое": "hsl(42, 75%, 50%)",
  "Оранжевое": "hsl(25, 80%, 45%)",
  "Десертное": "hsl(30, 65%, 35%)",
};

export default function Tastings({ tastings, onNew, onView, userProfile }: TastingsProps) {
  const [filter, setFilter] = useState<string>("Все");
  const styles = ["Все", "Красное", "Белое", "Розовое", "Игристое", "Оранжевое", "Десертное"];

  const filtered = filter === "Все" ? tastings : tastings.filter(t => t.style === filter);

  const avgRating = tastings.length
    ? (tastings.reduce((acc, t) => acc + t.rating, 0) / tastings.length).toFixed(1)
    : "—";

  return (
    <div className="min-h-screen parchment-bg pb-6" style={{ paddingTop: "56px" }}>
      {/* Header */}
      <div className="wine-gradient pt-5 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, white 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="flex items-center justify-between relative z-10 animate-slide-up">
          <div>
            <p className="font-body text-xs tracking-[0.2em] uppercase mb-0.5" style={{ color: "hsl(42, 90%, 70%)" }}>
              Добро пожаловать
            </p>
            <h1 className="font-display text-2xl font-light" style={{ color: "hsl(36, 60%, 94%)" }}>
              {userProfile.nickname}
            </h1>
          </div>
          <div className="w-11 h-11 rounded-full border-2 overflow-hidden flex items-center justify-center"
            style={{ borderColor: "hsl(42, 75%, 50%)", backgroundColor: "hsl(36, 40%, 92%)" }}>
            {userProfile.avatar ? (
              <img src={userProfile.avatar} className="w-full h-full object-cover" alt="" />
            ) : (
              <Icon name="User" size={20} className="text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-6 relative z-10">
          {[
            { label: "Дегустаций", value: tastings.length },
            { label: "Средний балл", value: avgRating },
            { label: "Стран", value: new Set(tastings.map(t => t.country)).size },
          ].map((s) => (
            <div key={s.label} className="flex-1 text-center">
              <p className="font-display text-2xl font-semibold" style={{ color: "hsl(42, 90%, 70%)" }}>
                {s.value}
              </p>
              <p className="font-body text-xs opacity-70" style={{ color: "hsl(36, 60%, 94%)" }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter chips */}
      <div className="-mt-6 px-4 mb-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {styles.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className="flex-shrink-0 px-4 py-2 rounded-full font-body text-xs font-medium transition-all duration-200 shadow-sm"
              style={filter === s
                ? { backgroundColor: "hsl(345, 55%, 28%)", color: "hsl(36, 60%, 94%)" }
                : { backgroundColor: "white", color: "hsl(345, 30%, 40%)", border: "1px solid hsl(36,20%,85%)" }
              }
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="px-4 space-y-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">🍷</span>
            <p className="font-display text-xl text-muted-foreground mb-2">Пока нет дегустаций</p>
            <p className="font-body text-sm text-muted-foreground">Добавьте первую карточку дегустации</p>
          </div>
        ) : (
          filtered.map((t) => (
            <div
              key={t.id}
              className="card-wine rounded-2xl overflow-hidden hover-lift cursor-pointer"
              onClick={() => onView(t.id)}
            >
              <div className="flex">
                {/* Wine color accent */}
                <div className="w-1.5 flex-shrink-0" style={{ backgroundColor: WINE_STYLE_COLORS[t.style] || "hsl(345,55%,28%)" }} />
                
                <div className="flex flex-1 p-4 gap-3">
                  {t.photo && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={t.photo} alt={t.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  {!t.photo && (
                    <div className="w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl"
                      style={{ backgroundColor: "hsl(36,40%,92%)" }}>
                      🍷
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-display text-base font-semibold leading-tight truncate" style={{ color: "hsl(345,65%,18%)" }}>
                          {t.name}
                        </h3>
                        <p className="font-body text-xs text-muted-foreground mt-0.5">
                          {t.year} · {t.country}{t.region ? `, ${t.region}` : ""}
                        </p>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-lg"
                        style={{ backgroundColor: "hsl(36,40%,92%)" }}>
                        <span className="font-body text-sm font-bold" style={{ color: "hsl(345,55%,28%)" }}>
                          {t.rating}
                        </span>
                        <span className="text-xs" style={{ color: "hsl(42,75%,50%)" }}>★</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="font-body text-xs px-2 py-0.5 rounded-full border"
                        style={{ borderColor: WINE_STYLE_COLORS[t.style] || "hsl(345,55%,28%)", color: WINE_STYLE_COLORS[t.style] || "hsl(345,55%,28%)" }}>
                        {t.style}
                      </span>
                      <span className="font-body text-xs text-muted-foreground">
                        {t.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="font-body text-xs text-muted-foreground flex items-center gap-1">
                        <Icon name="Heart" size={11} />
                        {t.likes}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={onNew}
        className="fixed bottom-20 right-6 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 z-30"
        style={{ background: "linear-gradient(135deg, hsl(345,65%,18%), hsl(345,55%,28%))" }}
      >
        <Icon name="Plus" size={24} style={{ color: "hsl(36,60%,94%)" }} />
      </button>
    </div>
  );
}