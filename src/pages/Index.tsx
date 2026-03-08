import { useState, useEffect, useCallback } from "react";
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
import { auth, tastings as tastingsApi, friendsApi, TastingApiRow, FriendApiRow } from "@/lib/api";

type Screen = "auth" | "setup-profile" | "main" | "new-tasting" | "tasting-detail" | "public-profile";
type Tab = "tastings" | "friends" | "notifications" | "profile";

function apiToTasting(row: TastingApiRow): TastingCard {
  return {
    id: row.id,
    name: row.name,
    year: row.year,
    country: row.country,
    region: row.region,
    producer: row.producer,
    style: row.style,
    impression: row.impression,
    date: row.date,
    photo: row.photo,
    color: row.color,
    density: row.density,
    aromaIntensity: row.aromaIntensity,
    primaryAromas: row.primaryAromas,
    secondaryAromas: row.secondaryAromas,
    flavor: row.flavor,
    finish: row.finish,
    rating: row.rating,
    notes: row.notes,
    likes: row.likes,
  };
}

function apiToFriend(row: FriendApiRow): Friend {
  return {
    id: row.id,
    nickname: row.nickname,
    bio: row.bio,
    avatar: row.avatar,
    tastingsCount: row.tastingsCount,
    avgRating: row.avgRating,
    tastings: row.tastings.map(apiToTasting),
  };
}

const DEMO_NOTIFICATIONS = [
  { id: "n1", type: "like" as const, from: "sommelier_pro", target: "первая дегустация", time: "Добро пожаловать!", read: false },
];

export default function Index() {
  const [screen, setScreen] = useState<Screen>(() =>
    auth.isLoggedIn() ? "main" : "auth"
  );
  const [tab, setTab] = useState<Tab>("tastings");
  const [profile, setProfile] = useState<UserProfile>({ nickname: auth.getNickname() || "", bio: "", avatar: "" });
  const [myTastings, setMyTastings] = useState<TastingCard[]>([]);
  const [myFriends, setMyFriends] = useState<Friend[]>([]);
  const [notifications] = useState(DEMO_NOTIFICATIONS);
  const [selectedTasting, setSelectedTasting] = useState<TastingCard | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [loading, setLoading] = useState(false);

  const loadTastings = useCallback(async () => {
    try {
      const rows = await tastingsApi.list();
      setMyTastings(rows.map(apiToTasting));
    } catch { /* silent */ }
  }, []);

  const loadFriends = useCallback(async () => {
    try {
      const rows = await friendsApi.list();
      setMyFriends(rows.map(apiToFriend));
    } catch { /* silent */ }
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const me = await auth.me();
      setProfile({ nickname: me.nickname, bio: me.bio, avatar: me.avatar });
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (screen === "main") {
      loadTastings();
      loadFriends();
      loadProfile();
    }
  }, [screen, loadTastings, loadFriends, loadProfile]);

  const handleAuth = async (sessionData?: { nickname: string; bio: string; avatar: string }) => {
    if (sessionData) {
      setProfile({ nickname: sessionData.nickname, bio: sessionData.bio || "", avatar: sessionData.avatar || "" });
      setScreen("main");
    } else {
      setScreen("setup-profile");
    }
  };

  const handleProfileSave = async (p: UserProfile) => {
    setLoading(true);
    try {
      await auth.updateProfile(p.nickname, p.bio, p.avatar);
      setProfile(p);
      setScreen("main");
    } catch (e) {
      setProfile(p);
      setScreen("main");
    } finally {
      setLoading(false);
    }
  };

  const handleNewTasting = async (card: Omit<TastingCard, "id" | "likes">) => {
    try {
      const res = await tastingsApi.create({
        name: card.name,
        year: card.year,
        country: card.country,
        region: card.region,
        producer: card.producer,
        style: card.style,
        impression: card.impression,
        date: card.date,
        photo: card.photo,
        color: card.color,
        density: card.density,
        aromaIntensity: card.aromaIntensity,
        primaryAromas: card.primaryAromas,
        secondaryAromas: card.secondaryAromas,
        flavor: card.flavor,
        finish: card.finish,
        rating: card.rating,
        notes: card.notes,
      });
      const newCard: TastingCard = { ...card, id: res.id, likes: 0 };
      setMyTastings(prev => [newCard, ...prev]);
    } catch (err) {
      console.error("Ошибка сохранения дегустации:", err);
      const newCard: TastingCard = { ...card, id: Date.now().toString(), likes: 0 };
      setMyTastings(prev => [newCard, ...prev]);
    }
    setScreen("main");
    setTab("tastings");
    loadTastings();
  };

  const handleLike = async (id: string) => {
    try {
      const res = await tastingsApi.like(id);
      setMyTastings(prev => prev.map(t => t.id === id ? { ...t, likes: res.likes } : t));
      if (selectedFriend) {
        setMyFriends(prev => prev.map(f =>
          f.id === selectedFriend.id
            ? { ...f, tastings: f.tastings.map(t => t.id === id ? { ...t, likes: res.likes } : t) }
            : f
        ));
      }
    } catch {
      setMyTastings(prev => prev.map(t => t.id === id ? { ...t, likes: t.likes + 1 } : t));
    }
  };

  const handleAddFriend = async (friendId: string) => {
    try {
      await friendsApi.add(friendId);
      await loadFriends();
    } catch { /* silent */ }
  };

  const handleRemoveFriend = async (id: string) => {
    try {
      await friendsApi.remove(id);
      setMyFriends(prev => prev.filter(f => f.id !== id));
    } catch {
      setMyFriends(prev => prev.filter(f => f.id !== id));
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (screen === "auth") return <Auth onAuth={handleAuth} />;
  if (screen === "setup-profile") return <Profile onSave={handleProfileSave} loading={loading} />;

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
          tastings={myTastings}
          onNew={() => setScreen("new-tasting")}
          onView={(id) => {
            const t = myTastings.find(t => t.id === id);
            if (t) { setSelectedTasting(t); setScreen("tasting-detail"); }
          }}
          userProfile={profile}
          onRefresh={loadTastings}
        />
      )}

      {tab === "friends" && (
        <Friends
          friends={myFriends}
          onAddFriend={handleAddFriend}
          onViewProfile={(f) => { setSelectedFriend(f); setScreen("public-profile"); }}
          onRemoveFriend={handleRemoveFriend}
          onRefresh={loadFriends}
        />
      )}

      {tab === "notifications" && (
        <Notifications notifications={notifications} onMarkRead={() => {}} />
      )}

      {tab === "profile" && (
        <Profile
          isEdit
          initialData={profile}
          onSave={handleProfileSave}
          loading={loading}
          onLogout={() => {
            auth.logout();
            setMyTastings([]);
            setMyFriends([]);
            setProfile({ nickname: "", bio: "", avatar: "" });
            setScreen("auth");
          }}
        />
      )}

      <BottomNav active={tab} onChange={setTab} notifCount={unreadCount} />
    </div>
  );
}