import { useState } from "react";
import Auth from "./Auth";
import Profile from "./Profile";
import Tastings from "./Tastings";
import NewTasting from "./NewTasting";
import TastingDetail from "./TastingDetail";
import Friends from "./Friends";
import PublicProfile from "./PublicProfile";
import Notifications from "./Notifications";
import BottomNav from "@/components/BottomNav";
import { TastingCard, UserProfile, Friend } from "@/types";

type Screen =
  | "auth"
  | "setup-profile"
  | "main"
  | "new-tasting"
  | "tasting-detail"
  | "public-profile";

type Tab = "tastings" | "friends" | "notifications" | "profile";

const DEMO_TASTINGS: TastingCard[] = [
  {
    id: "1",
    name: "Barolo Cannubi",
    year: "2018",
    country: "Италия",
    region: "Пьемонт",
    producer: "Marchesi di Barolo",
    style: "Красное",
    impression: "Величественное, многослойное вино с характером и душой",
    date: "2024-01-15",
    color: "Рубиново-гранатовый с терракотовым ободом",
    density: "Полнотелое",
    aromaIntensity: 5,
    primaryAromas: "Вишня, слива, шиповник",
    secondaryAromas: "Кожа, табак, деготь, розы",
    flavor: "Мощные танины, высокая кислотность, долгое послевкусие",
    finish: "Очень длинное, с нотами специй и сухих роз",
    rating: 5,
    notes: "Открыть через 5 лет. Подавать с выдержанными сырами",
    likes: 12,
  },
  {
    id: "2",
    name: "Chablis Premier Cru",
    year: "2021",
    country: "Франция",
    region: "Бургундия",
    producer: "William Fèvre",
    style: "Белое",
    impression: "Минеральное и свежее, как морской бриз",
    date: "2024-02-10",
    color: "Светло-соломенный с зелёным отливом",
    density: "Лёгкое",
    aromaIntensity: 3,
    primaryAromas: "Зелёное яблоко, лимон, белый цветок",
    secondaryAromas: "Кремень, устрица, белый перец",
    flavor: "Высокая кислотность, прохладная минеральность",
    finish: "Среднее, йодистое",
    rating: 4,
    likes: 7,
  },
];

const DEMO_FRIENDS: Friend[] = [
  {
    id: "f1",
    nickname: "sommelier_pro",
    avatar: "",
    bio: "Сомелье с 10-летним опытом. Люблю Бургундию и натуральные вина.",
    tastingsCount: 87,
    avgRating: 4.2,
    tastings: [
      {
        id: "f1t1",
        name: "Gevrey-Chambertin",
        year: "2019",
        country: "Франция",
        region: "Бургундия",
        style: "Красное",
        date: "2024-01-20",
        rating: 5,
        likes: 23,
        color: "Бледно-рубиновый",
        density: "Среднее",
        aromaIntensity: 4,
        primaryAromas: "Малина, вишня, фиалка",
        impression: "Элегантность в чистом виде",
      }
    ],
  },
];

const DEMO_NOTIFICATIONS = [
  { id: "n1", type: "like" as const, from: "sommelier_pro", target: "Barolo Cannubi", time: "5 минут назад", read: false },
  { id: "n2", type: "friend" as const, from: "wine_lover_kz", time: "1 час назад", read: false },
  { id: "n3", type: "like" as const, from: "bordeaux_fan", target: "Chablis Premier Cru", time: "2 дня назад", read: true },
];

export default function Index() {
  const [screen, setScreen] = useState<Screen>("auth");
  const [tab, setTab] = useState<Tab>("tastings");
  const [profile, setProfile] = useState<UserProfile>({ nickname: "", bio: "", avatar: "" });
  const [tastings, setTastings] = useState<TastingCard[]>(DEMO_TASTINGS);
  const [friends, setFriends] = useState<Friend[]>(DEMO_FRIENDS);
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);
  const [selectedTasting, setSelectedTasting] = useState<TastingCard | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

  const handleAuth = () => setScreen("setup-profile");

  const handleProfileSave = (p: UserProfile) => {
    setProfile(p);
    setScreen("main");
  };

  const handleNewTasting = (card: Omit<TastingCard, "id" | "likes">) => {
    const newCard: TastingCard = { ...card, id: Date.now().toString(), likes: 0 };
    setTastings(prev => [newCard, ...prev]);
    setScreen("main");
    setTab("tastings");
  };

  const handleLike = (id: string) => {
    setTastings(prev => prev.map(t => t.id === id ? { ...t, likes: t.likes + 1 } : t));
    if (selectedFriend) {
      setFriends(prev => prev.map(f =>
        f.id === selectedFriend.id
          ? { ...f, tastings: f.tastings.map(t => t.id === id ? { ...t, likes: t.likes + 1 } : t) }
          : f
      ));
    }
  };

  const handleAddFriend = (nickname: string) => {
    const newFriend: Friend = {
      id: Date.now().toString(),
      nickname,
      avatar: "",
      bio: "Ценитель хорошего вина",
      tastingsCount: 0,
      avgRating: 0,
      tastings: [],
    };
    setFriends(prev => [...prev, newFriend]);
  };

  const handleRemoveFriend = (id: string) => {
    setFriends(prev => prev.filter(f => f.id !== id));
  };

  const handleMarkRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (screen === "auth") return <Auth onAuth={handleAuth} />;
  if (screen === "setup-profile") return <Profile onSave={handleProfileSave} />;

  if (screen === "new-tasting") return (
    <NewTasting onSave={handleNewTasting} onBack={() => setScreen("main")} />
  );

  if (screen === "tasting-detail" && selectedTasting) return (
    <TastingDetail
      card={selectedTasting}
      onBack={() => setScreen("main")}
      onLike={handleLike}
      isOwn
    />
  );

  if (screen === "public-profile" && selectedFriend) return (
    <PublicProfile
      friend={selectedFriend}
      onBack={() => setScreen("main")}
      onLike={handleLike}
      onViewTasting={(t) => {
        setSelectedTasting(t);
        setScreen("tasting-detail");
      }}
    />
  );

  return (
    <div className="relative">
      {tab === "tastings" && (
        <Tastings
          tastings={tastings}
          onNew={() => setScreen("new-tasting")}
          onView={(id) => {
            const t = tastings.find(t => t.id === id);
            if (t) { setSelectedTasting(t); setScreen("tasting-detail"); }
          }}
          userProfile={profile}
        />
      )}

      {tab === "friends" && (
        <Friends
          friends={friends}
          onAddFriend={handleAddFriend}
          onViewProfile={(f) => { setSelectedFriend(f); setScreen("public-profile"); }}
          onRemoveFriend={handleRemoveFriend}
        />
      )}

      {tab === "notifications" && (
        <Notifications notifications={notifications} onMarkRead={handleMarkRead} />
      )}

      {tab === "profile" && (
        <Profile
          isEdit
          initialData={profile}
          onSave={(p) => setProfile(p)}
        />
      )}

      <BottomNav active={tab} onChange={setTab} notifCount={unreadCount} />
    </div>
  );
}
