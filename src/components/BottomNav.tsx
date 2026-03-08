import Icon from "@/components/ui/icon";

type Tab = "tastings" | "friends" | "notifications" | "profile";

interface BottomNavProps {
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

export default function BottomNav({ active, onChange, notifCount = 0 }: BottomNavProps) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2 backdrop-blur-md"
      style={{
        backgroundColor: "rgba(255, 252, 248, 0.95)",
        borderTop: "1px solid hsl(36,20%,85%)",
        boxShadow: "0 -4px 20px rgba(100,20,35,0.08)",
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className="flex flex-col items-center gap-1 py-1 px-4 rounded-xl relative transition-all duration-200"
            style={isActive ? { color: "hsl(345,55%,28%)" } : { color: "hsl(345,15%,60%)" }}
          >
            <div className={`transition-all duration-200 ${isActive ? "scale-110" : "scale-100"}`}>
              <Icon name={item.icon as "Wine"} size={22} />
            </div>
            <span className="font-body text-[10px] font-medium leading-none">
              {item.label}
            </span>
            
            {item.id === "notifications" && notifCount > 0 && (
              <div className="absolute top-0.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "hsl(345,55%,28%)" }}>
                <span className="font-body text-[9px] font-bold text-white">
                  {notifCount > 9 ? "9+" : notifCount}
                </span>
              </div>
            )}

            {isActive && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                style={{ backgroundColor: "hsl(42,75%,50%)" }} />
            )}
          </button>
        );
      })}
    </div>
  );
}
