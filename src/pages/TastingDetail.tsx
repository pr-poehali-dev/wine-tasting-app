import Icon from "@/components/ui/icon";
import { TastingCard } from "@/types";

interface TastingDetailProps {
  card: TastingCard;
  onBack: () => void;
  onLike: (id: string) => void;
  isOwn?: boolean;
}

const STYLE_COLORS: Record<string, string> = {
  "Красное": "hsl(345, 55%, 28%)",
  "Белое": "hsl(45, 70%, 45%)",
  "Розовое": "hsl(350, 70%, 60%)",
  "Игристое": "hsl(42, 75%, 50%)",
  "Оранжевое": "hsl(25, 80%, 45%)",
  "Десертное": "hsl(30, 65%, 35%)",
};

const Row = ({ label, value }: { label: string; value?: string | number }) =>
  value ? (
    <div className="py-3 border-b last:border-0" style={{ borderColor: "hsl(36,20%,88%)" }}>
      <p className="font-body text-xs tracking-wide uppercase text-muted-foreground mb-1">{label}</p>
      <p className="font-body text-sm" style={{ color: "hsl(345,30%,15%)" }}>{value}</p>
    </div>
  ) : null;

export default function TastingDetail({ card, onBack, onLike, isOwn = true }: TastingDetailProps) {
  const accentColor = STYLE_COLORS[card.style] || "hsl(345,55%,28%)";

  const handleShare = async () => {
    const url = `${window.location.origin}/tasting/${card.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: card.name, text: `Дегустация: ${card.name} ${card.year}`, url });
      } catch (_e) { void _e; }
    } else {
      navigator.clipboard.writeText(url);
      alert("Ссылка скопирована!");
    }
  };

  return (
    <div className="min-h-screen parchment-bg pb-10" style={{ paddingTop: "56px" }}>
      {/* Hero */}
      <div className="relative">
        {card.photo ? (
          <div className="relative h-64">
            <img src={card.photo} alt={card.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))" }} />
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center" style={{
            background: `linear-gradient(135deg, ${accentColor}dd, ${accentColor}88)`
          }}>
            <span className="text-8xl opacity-60">🍷</span>
          </div>
        )}
        
        {/* Overlay controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <button onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm"
            style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
            <Icon name="ArrowLeft" size={18} className="text-white" />
          </button>
          <div className="flex gap-2">
            <button onClick={handleShare}
              className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm"
              style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
              <Icon name="Share2" size={16} className="text-white" />
            </button>
          </div>
        </div>

        {/* Rating badge */}
        <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl backdrop-blur-sm"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <span className="font-display text-xl font-bold text-white">{card.rating}</span>
          <span className="text-sm ml-1" style={{ color: "hsl(42,90%,70%)" }}>★</span>
        </div>
      </div>

      <div className="px-4 -mt-4 relative z-10">
        {/* Title card */}
        <div className="card-wine rounded-2xl p-5 mb-4 animate-slide-up">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="font-body text-xs px-2.5 py-1 rounded-full mb-2 inline-block"
                style={{ backgroundColor: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}40` }}>
                {card.style}
              </span>
              <h1 className="font-display text-2xl font-semibold leading-tight" style={{ color: "hsl(345,65%,18%)" }}>
                {card.name}
              </h1>
              <p className="font-body text-sm text-muted-foreground mt-1">
                {[card.year, card.producer, card.region, card.country].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>

          {/* Like & Share */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t" style={{ borderColor: "hsl(36,20%,88%)" }}>
            <button
              onClick={() => onLike(card.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-body text-sm font-medium transition-all hover:opacity-80"
              style={{ border: "1px solid hsl(345,55%,28%)", color: "hsl(345,55%,28%)", backgroundColor: "white" }}
            >
              <Icon name="Heart" size={15} />
              <span>{card.likes}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-body text-sm font-medium transition-all hover:opacity-80"
              style={{ backgroundColor: "hsl(345,55%,28%)", color: "hsl(36,60%,94%)" }}
            >
              <Icon name="Share2" size={15} />
              Поделиться
            </button>
            <p className="ml-auto font-body text-xs text-muted-foreground">{card.date}</p>
          </div>
        </div>

        {/* Stars */}
        <div className="card-wine rounded-2xl p-5 mb-4 animate-slide-up" style={{ animationDelay: "0.05s" }}>
          <p className="font-body text-xs tracking-wide uppercase text-muted-foreground mb-3">Общая оценка</p>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[1,2,3,4,5].map(n => (
                <span key={n} className="text-2xl" style={{ color: n <= card.rating ? "hsl(42,75%,50%)" : "hsl(36,20%,80%)" }}>★</span>
              ))}
            </div>
            <span className="font-display text-xl font-bold" style={{ color: "hsl(345,65%,18%)" }}>
              {card.rating}/5
            </span>
          </div>
        </div>

        {/* Aroma intensity */}
        {card.aromaIntensity && (
          <div className="card-wine rounded-2xl p-5 mb-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="font-body text-xs tracking-wide uppercase text-muted-foreground">Интенсивность аромата</p>
              <span className="font-body text-xs font-medium" style={{ color: "hsl(345,55%,28%)" }}>
                {["","Низкая","Умеренная","Средняя","Высокая","Интенсивная"][card.aromaIntensity]}
              </span>
            </div>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(n => (
                <div key={n} className="flex-1 h-2 rounded-full"
                  style={{ backgroundColor: n <= card.aromaIntensity ? "hsl(345,55%,28%)" : "hsl(36,20%,85%)" }} />
              ))}
            </div>
          </div>
        )}

        {/* Sensory details */}
        <div className="card-wine rounded-2xl p-5 mb-4 animate-slide-up" style={{ animationDelay: "0.12s" }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 rounded-full" style={{ backgroundColor: "hsl(42,75%,50%)" }} />
            <p className="font-display text-base font-semibold" style={{ color: "hsl(345,65%,18%)" }}>Описание</p>
          </div>
          <Row label="Цвет" value={card.color} />
          <Row label="Плотность" value={card.density} />
          <Row label="Первичные ароматы" value={card.primaryAromas} />
          <Row label="Вторичные и третичные ароматы" value={card.secondaryAromas} />
          <Row label="Вкус" value={card.flavor} />
          <Row label="Послевкусие" value={card.finish} />
          {card.impression && (
            <div className="pt-3">
              <p className="font-body text-xs tracking-wide uppercase text-muted-foreground mb-1">Общее впечатление</p>
              <p className="font-display text-sm italic leading-relaxed" style={{ color: "hsl(345,30%,25%)" }}>
                "{card.impression}"
              </p>
            </div>
          )}
        </div>

        {card.notes && (
          <div className="card-wine rounded-2xl p-5 mb-4 animate-slide-up" style={{ animationDelay: "0.15s" }}>
            <p className="font-body text-xs tracking-wide uppercase text-muted-foreground mb-2">Примечания</p>
            <p className="font-body text-sm leading-relaxed text-muted-foreground">{card.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}