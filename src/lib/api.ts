const BASE = {
  auth: "https://functions.poehali.dev/cd14de3a-8c21-46cf-a1aa-7a00f45fe9e5",
  tastings: "https://functions.poehali.dev/ccc69939-31c9-4e74-9fc9-ff205a619f24",
  friends: "https://functions.poehali.dev/bae1bbd6-db33-433a-b6d5-69125d0aa998",
};

function getSession(): string {
  return localStorage.getItem("session_id") || "";
}

function saveSession(id: string) {
  localStorage.setItem("session_id", id);
}

function clearSession() {
  localStorage.removeItem("session_id");
  localStorage.removeItem("user_id");
  localStorage.removeItem("nickname");
}

async function req<T>(url: string, options?: RequestInit): Promise<T> {
  const session = getSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(session ? { "X-Session-Id": session } : {}),
    ...(options?.headers as Record<string, string> || {}),
  };
  const res = await fetch(url, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка сервера");
  return data as T;
}

// Auth
export const auth = {
  register: async (email: string, password: string, nickname: string) => {
    const data = await req<{ session_id: string; user_id: number; nickname: string }>(
      `${BASE.auth}?action=register`,
      { method: "POST", body: JSON.stringify({ email, password, nickname }) }
    );
    saveSession(data.session_id);
    localStorage.setItem("user_id", String(data.user_id));
    localStorage.setItem("nickname", data.nickname);
    return data;
  },

  login: async (email: string, password: string) => {
    const data = await req<{ session_id: string; user_id: number; nickname: string; bio: string; avatar: string }>(
      `${BASE.auth}?action=login`,
      { method: "POST", body: JSON.stringify({ email, password }) }
    );
    saveSession(data.session_id);
    localStorage.setItem("user_id", String(data.user_id));
    localStorage.setItem("nickname", data.nickname);
    return data;
  },

  me: async () => {
    return req<{ user_id: number; nickname: string; bio: string; avatar: string }>(
      `${BASE.auth}?action=me`
    );
  },

  updateProfile: async (nickname: string, bio: string, avatar: string) => {
    return req<{ ok: boolean }>(`${BASE.auth}?action=profile`, {
      method: "PUT",
      body: JSON.stringify({ nickname, bio, avatar }),
    });
  },

  logout: clearSession,
  isLoggedIn: () => !!getSession(),
  getUserId: () => localStorage.getItem("user_id"),
  getNickname: () => localStorage.getItem("nickname"),
};

// Tastings
export const tastings = {
  list: async (userId?: string) => {
    const qs = userId ? `&user_id=${userId}` : "";
    return req<TastingApiRow[]>(`${BASE.tastings}?action=list${qs}`);
  },

  create: async (card: TastingPayload) => {
    return req<{ id: string }>(`${BASE.tastings}?action=create`, {
      method: "POST",
      body: JSON.stringify(card),
    });
  },

  like: async (tastingId: string) => {
    return req<{ liked: boolean; likes: number }>(
      `${BASE.tastings}?action=like&tasting_id=${tastingId}`,
      { method: "POST" }
    );
  },
};

// Friends
export const friendsApi = {
  list: async () => {
    return req<FriendApiRow[]>(`${BASE.friends}?action=list`);
  },

  search: async (nickname: string) => {
    return req<SearchResult[]>(`${BASE.friends}?action=search&nickname=${encodeURIComponent(nickname)}`);
  },

  add: async (friendId: string) => {
    return req<{ ok: boolean }>(`${BASE.friends}?action=add`, {
      method: "POST",
      body: JSON.stringify({ friend_id: parseInt(friendId) }),
    });
  },

  remove: async (friendId: string) => {
    return req<{ ok: boolean }>(`${BASE.friends}?action=remove`, {
      method: "POST",
      body: JSON.stringify({ friend_id: parseInt(friendId) }),
    });
  },
};

// Types
export interface TastingApiRow {
  id: string;
  user_id: number;
  name: string;
  year: string;
  country: string;
  region: string;
  producer: string;
  style: string;
  impression: string;
  date: string;
  photo: string;
  color: string;
  density: string;
  aromaIntensity: number;
  primaryAromas: string;
  secondaryAromas: string;
  flavor: string;
  finish: string;
  rating: number;
  notes: string;
  likes: number;
  is_liked: boolean;
}

export interface TastingPayload {
  name: string;
  year: string;
  country: string;
  region?: string;
  producer?: string;
  style: string;
  impression?: string;
  date: string;
  photo?: string;
  color?: string;
  density?: string;
  aromaIntensity?: number;
  primaryAromas?: string;
  secondaryAromas?: string;
  flavor?: string;
  finish?: string;
  rating: number;
  notes?: string;
}

export interface FriendApiRow {
  id: string;
  nickname: string;
  bio: string;
  avatar: string;
  tastingsCount: number;
  avgRating: number;
  tastings: TastingApiRow[];
}

export interface SearchResult {
  id: string;
  nickname: string;
  bio: string;
  avatar: string;
  tastingsCount: number;
  is_friend: boolean;
}
