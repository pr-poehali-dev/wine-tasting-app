import Icon from "@/components/ui/icon";

type Tab = "tastings" | "friends" | "notifications" | "profile";

interface TopNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
  notifCount?: number;
}

const NAV_ITEMS: { id: Tab; icon: string; label: string }[] = [
  { id: "tastings", icon: "Wine", label: "Дегустации" },
  { id: "friends", icon: "Users", label: "Друзья" },
  { id: "notifications", icon: "Bell", label: "Уведомления" },
  { id: "profile", icon: "User", label: "Профиль" },
];

export default function BottomNav({ active, onChange, notifCount = 0 }: TopNavProps) {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-around px-1 pt-safe"
      style={{
        backgroundColor: "hsl(345, 65%, 18%)",
        boxShadow: "0 2px 20px rgba(60,5,15,0.3)",
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className="flex flex-col items-center gap-0.5 py-2.5 px-3 relative transition-all duration-200 flex-1"
          >
            {/* Active indicator bar bottom */}
            {isActive && (
              <div
                className="absolute bottom-0 left-2 right-2 h-0.5 rounded-t-full"
                style={{ backgroundColor: "hsl(42,75%,50%)" }}
              />
            )}

            <div className="relative">
              <Icon
                name={item.icon as "Wine"}
                size={20}
                style={{ color: isActive ? "hsl(42,90%,72%)" : "rgba(255,240,220,0.55)" }}
              />
              {item.id === "notifications" && notifCount > 0 && (
                <div
                  className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "hsl(42,90%,55%)" }}
                >
                  <span className="font-body text-[8px] font-bold" style={{ color: "hsl(345,65%,15%)" }}>
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                </div>
              )}
            </div>

            <span
              className="font-body text-[9px] font-semibold tracking-wide leading-none"
              style={{ color: isActive ? "hsl(42,90%,72%)" : "rgba(255,240,220,0.55)" }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
