import Icon from "@/components/ui/icon";

interface Notification {
  id: string;
  type: "like" | "friend" | "comment";
  from: string;
  target?: string;
  time: string;
  read: boolean;
}

interface NotificationsProps {
  notifications: Notification[];
  onMarkRead: () => void;
}

const NOTIF_ICONS = {
  like: { icon: "Heart", color: "hsl(345,55%,28%)", bg: "hsl(345,55%,28%,0.1)" },
  friend: { icon: "UserPlus", color: "hsl(42,75%,40%)", bg: "hsl(42,75%,50%,0.1)" },
  comment: { icon: "MessageCircle", color: "hsl(210,60%,45%)", bg: "hsl(210,60%,45%,0.1)" },
};

export default function Notifications({ notifications, onMarkRead }: NotificationsProps) {
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen parchment-bg pb-24">
      <div className="wine-gradient pt-12 pb-8 px-6 relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10 animate-slide-up">
          <div>
            <p className="font-body text-xs tracking-[0.2em] uppercase mb-0.5" style={{ color: "hsl(42,90%,70%)" }}>
              Активность
            </p>
            <h1 className="font-display text-3xl font-light" style={{ color: "hsl(36,60%,94%)" }}>
              Уведомления
            </h1>
          </div>
          {unread > 0 && (
            <button
              onClick={onMarkRead}
              className="font-body text-xs px-3 py-2 rounded-xl transition-all hover:opacity-80"
              style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "hsl(36,60%,94%)" }}
            >
              Прочитать все
            </button>
          )}
        </div>
      </div>

      <div className="px-4 pt-5 max-w-lg mx-auto">
        {unread > 0 && (
          <div className="mb-3 px-1 animate-fade-in">
            <span className="font-body text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ backgroundColor: "hsl(345,55%,28%)", color: "hsl(36,60%,94%)" }}>
              {unread} новых
            </span>
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="text-center py-16 card-wine rounded-2xl animate-fade-in">
            <span className="text-5xl block mb-4">🔔</span>
            <p className="font-display text-xl text-muted-foreground mb-2">Тишина</p>
            <p className="font-body text-sm text-muted-foreground">Пока нет уведомлений</p>
          </div>
        ) : (
          <div className="space-y-2 animate-slide-up">
            {notifications.map((n) => {
              const cfg = NOTIF_ICONS[n.type];
              return (
                <div
                  key={n.id}
                  className="rounded-2xl p-4 flex items-start gap-3 transition-all"
                  style={{
                    backgroundColor: n.read ? "white" : "hsl(345,55%,28%,0.04)",
                    border: n.read ? "1px solid hsl(36,20%,85%)" : "1px solid hsl(345,55%,28%,0.2)",
                    boxShadow: n.read ? "0 1px 6px rgba(0,0,0,0.04)" : "0 2px 12px rgba(100,20,35,0.08)",
                  }}
                >
                  <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: `${cfg.color}18` }}>
                    <Icon name={cfg.icon as "Heart"} size={17} style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm leading-snug" style={{ color: "hsl(345,30%,15%)" }}>
                      <span className="font-semibold">@{n.from}</span>{" "}
                      {n.type === "like" && <>оценил вашу дегустацию <span className="font-medium" style={{ color: "hsl(345,55%,28%)" }}>«{n.target}»</span></>}
                      {n.type === "friend" && <>хочет добавить вас в друзья</>}
                      {n.type === "comment" && <>прокомментировал <span className="font-medium" style={{ color: "hsl(345,55%,28%)" }}>«{n.target}»</span></>}
                    </p>
                    <p className="font-body text-xs text-muted-foreground mt-1">{n.time}</p>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                      style={{ backgroundColor: "hsl(345,55%,28%)" }} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
