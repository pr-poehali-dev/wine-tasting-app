import { useState } from "react";
import Icon from "@/components/ui/icon";
import { auth } from "@/lib/api";

interface AuthProps {
  onAuth: (data?: { nickname: string; bio: string; avatar: string }) => void;
}

export default function Auth({ onAuth }: AuthProps) {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        if (!nickname.trim()) { setError("Введите никнейм"); setLoading(false); return; }
        if (password !== confirmPassword) { setError("Пароли не совпадают"); setLoading(false); return; }
        await auth.register(email, password, nickname.trim());
        onAuth();
      } else {
        const data = await auth.login(email, password);
        onAuth({ nickname: data.nickname, bio: data.bio, avatar: data.avatar });
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen wine-drop flex flex-col items-center justify-center p-6" 
         style={{ background: "linear-gradient(160deg, hsl(36,40%,97%) 0%, hsl(36,25%,93%) 100%)" }}>
      
      {/* Logo */}
      <div className="text-center mb-10 animate-slide-up">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full wine-gradient flex items-center justify-center shadow-lg">
            <span className="text-amber-100 text-lg">🍷</span>
          </div>
          <h1 className="font-display text-4xl font-light tracking-wide text-wine-dark" style={{ color: "hsl(345, 65%, 18%)" }}>
            Vinoteka
          </h1>
        </div>
        <div className="divider-gold mx-auto w-24 my-2" />
        <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mt-2">
          Дневник дегустатора
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm animate-scale-in" style={{ animationDelay: "0.1s" }}>
        <div className="card-wine rounded-2xl p-8">
          
          {/* Tabs */}
          <div className="flex gap-0 mb-8 bg-muted rounded-xl p-1">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2 text-sm font-body font-medium rounded-lg transition-all duration-200 ${
                mode === "login" 
                  ? "bg-wine text-cream shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              style={{ backgroundColor: mode === "login" ? "hsl(345, 55%, 28%)" : undefined, color: mode === "login" ? "hsl(36, 60%, 94%)" : undefined }}
            >
              Войти
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 py-2 text-sm font-body font-medium rounded-lg transition-all duration-200 ${
                mode === "register" 
                  ? "bg-wine text-cream shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              style={{ backgroundColor: mode === "register" ? "hsl(345, 55%, 28%)" : undefined, color: mode === "register" ? "hsl(36, 60%, 94%)" : undefined }}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="animate-fade-in">
                <label className="font-body text-xs font-medium tracking-wide text-muted-foreground uppercase mb-1.5 block">
                  Никнейм
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="sommelier_pro"
                    className="w-full h-11 px-4 pl-10 bg-muted border border-border rounded-xl font-body text-sm focus:border-wine transition-colors"
                    required
                  />
                  <Icon name="User" size={15} className="absolute left-3 top-3.5 text-muted-foreground" />
                </div>
              </div>
            )}

            <div>
              <label className="font-body text-xs font-medium tracking-wide text-muted-foreground uppercase mb-1.5 block">
                Электронная почта
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="wine@example.com"
                  className="w-full h-11 px-4 pl-10 bg-muted border border-border rounded-xl font-body text-sm focus:border-wine transition-colors"
                  required
                />
                <Icon name="Mail" size={15} className="absolute left-3 top-3.5 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="font-body text-xs font-medium tracking-wide text-muted-foreground uppercase mb-1.5 block">
                Пароль
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-4 pl-10 bg-muted border border-border rounded-xl font-body text-sm focus:border-wine transition-colors"
                  required
                />
                <Icon name="Lock" size={15} className="absolute left-3 top-3.5 text-muted-foreground" />
              </div>
            </div>

            {mode === "register" && (
              <div className="animate-fade-in">
                <label className="font-body text-xs font-medium tracking-wide text-muted-foreground uppercase mb-1.5 block">
                  Подтвердите пароль
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 px-4 pl-10 bg-muted border border-border rounded-xl font-body text-sm focus:border-wine transition-colors"
                    required
                  />
                  <Icon name="Lock" size={15} className="absolute left-3 top-3.5 text-muted-foreground" />
                </div>
              </div>
            )}

            {error && (
              <div className="px-3 py-2 rounded-lg font-body text-xs text-red-700 bg-red-50 border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-body font-semibold text-sm tracking-wide transition-all duration-200 hover:opacity-90 active:scale-98 shadow-md mt-2 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, hsl(345,65%,18%) 0%, hsl(345,55%,28%) 100%)", color: "hsl(36,60%,94%)" }}
            >
              {loading ? "Загрузка..." : mode === "register" ? "Создать аккаунт" : "Войти"}
            </button>

            {mode === "login" && (
              <p className="text-center font-body text-xs text-muted-foreground mt-2 cursor-pointer hover:text-wine transition-colors">
                Забыли пароль?
              </p>
            )}
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center font-body text-xs text-muted-foreground">
              Продолжая, вы соглашаетесь с{" "}
              <span className="text-wine cursor-pointer hover:underline" style={{ color: "hsl(345, 55%, 28%)" }}>
                условиями сервиса
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Decorative */}
      <p className="mt-8 font-display text-sm italic text-muted-foreground animate-fade-in" style={{ animationDelay: "0.3s" }}>
        «In vino veritas»
      </p>
    </div>
  );
}