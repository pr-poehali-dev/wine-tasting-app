import Icon from "@/components/ui/icon";
import { Friend, TastingCard } from "@/types";

interface PublicProfileProps {
  friend: Friend;
  onBack: () => void;
  onViewTasting: (card: TastingCard) => void;
  onLike: (id: string) => void;
}

export default function PublicProfile({ friend, onBack, onViewTasting, onLike }: PublicProfileProps) {
  const avgRating = friend.tastings.length
    ? (friend.tastings.reduce((a, t) => a + t.rating, 0) / friend.tastings.length).toFixed(1)
    : "—";

  return (
    <div className="min-h-screen parchment-bg pb-6" style={{ paddingTop: "56px" }}>
      {/* Header */}
      <div className="wine-gradient pt-4 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, white 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <button onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center mb-6 relative z-10"
          style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
          <Icon name="ArrowLeft" size={18} style={{ color: "hsl(36,60%,94%)" }} />
        </button>
      </div>

      {/* Avatar */}
      <div className="flex justify-center -mt-12 mb-4">
        <div className="w-24 h-24 rounded-full border-4 overflow-hidden flex items-center justify-center shadow-xl animate-scale-in"
          style={{ borderColor: "hsl(42,75%,50%)", backgroundColor: "hsl(36,40%,92%)" }}>
          {friend.avatar ? (
            <img src={friend.avatar} alt={friend.nickname} className="w-full h-full object-cover" />
          ) : (
            <Icon name="User" size={36} className="text-muted-foreground" />
          )}
        </div>
      </div>

      <div className="px-4 space-y-4 max-w-lg mx-auto">
        {/* Profile card */}
        <div className="card-wine rounded-2xl p-5 text-center animate-slide-up">
          <h1 className="font-display text-2xl font-semibold" style={{ color: "hsl(345,65%,18%)" }}>
            @{friend.nickname}
          </h1>
          {friend.bio && (
            <p className="font-body text-sm text-muted-foreground mt-2 leading-relaxed">{friend.bio}</p>
          )}
          <div className="divider-gold my-4" />
          <div className="flex justify-around">
            {[
              { label: "Дегустаций", value: friend.tastings.length },
              { label: "Средний балл", value: avgRating },
              { label: "Стран", value: new Set(friend.tastings.map(t => t.country)).size },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display text-2xl font-bold" style={{ color: "hsl(345,65%,18%)" }}>{s.value}</p>
                <p className="font-body text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tastings */}
        <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <p className="font-display text-lg font-semibold mb-3 px-1" style={{ color: "hsl(345,65%,18%)" }}>
            Дегустации
          </p>

          {friend.tastings.length === 0 ? (
            <div className="text-center py-10 card-wine rounded-2xl">
              <p className="font-body text-sm text-muted-foreground">Пока нет дегустаций</p>
            </div>
          ) : (
            <div className="space-y-3">
              {friend.tastings.map((t) => (
                <div key={t.id} className="card-wine rounded-2xl overflow-hidden">
                  <div
                    className="flex p-4 gap-3 cursor-pointer"
                    onClick={() => onViewTasting(t)}
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: "hsl(36,40%,92%)" }}>
                      {t.photo ? (
                        <img src={t.photo} alt={t.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">🍷</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3 className="font-display text-sm font-semibold truncate" style={{ color: "hsl(345,65%,18%)" }}>
                          {t.name}
                        </h3>
                        <span className="font-body text-xs font-bold ml-2 flex-shrink-0" style={{ color: "hsl(42,75%,40%)" }}>
                          {t.rating}★
                        </span>
                      </div>
                      <p className="font-body text-xs text-muted-foreground mt-0.5">
                        {t.year} · {t.country} · {t.style}
                      </p>
                      <p className="font-body text-xs text-muted-foreground mt-0.5">{t.date}</p>
                    </div>
                  </div>
                  
                  {/* Like row */}
                  <div className="px-4 pb-3 flex items-center gap-3 border-t pt-3" style={{ borderColor: "hsl(36,20%,90%)" }}>
                    <button
                      onClick={() => onLike(t.id)}
                      className="flex items-center gap-1.5 font-body text-xs font-medium px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                      style={{ color: "hsl(345,55%,28%)", border: "1px solid hsl(345,55%,28%)", backgroundColor: "white" }}
                    >
                      <Icon name="Heart" size={12} />
                      <span>{t.likes}</span>
                    </button>
                    <span className="font-body text-xs text-muted-foreground ml-1">
                      {t.likes === 1 ? "лайк" : t.likes >= 2 && t.likes <= 4 ? "лайка" : "лайков"}
                    </span>
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