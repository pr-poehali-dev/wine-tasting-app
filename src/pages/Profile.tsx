import { useState, useRef } from "react";
import Icon from "@/components/ui/icon";

interface ProfileProps {
  onSave: (profile: { nickname: string; bio: string; avatar: string }) => void;
  isEdit?: boolean;
  initialData?: { nickname: string; bio: string; avatar: string };
  loading?: boolean;
}

export default function Profile({ onSave, isEdit = false, initialData, loading = false }: ProfileProps) {
  const [nickname, setNickname] = useState(initialData?.nickname || "");
  const [bio, setBio] = useState(initialData?.bio || "");
  const [avatar, setAvatar] = useState<string>(initialData?.avatar || "");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatar(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ nickname, bio, avatar });
  };

  return (
    <div className="min-h-screen parchment-bg">
      {/* Header */}
      <div className="wine-gradient pt-12 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
        }} />
        <div className="text-center relative z-10 animate-slide-up">
          <p className="font-body text-xs tracking-[0.25em] uppercase mb-1" style={{ color: "hsl(42, 90%, 70%)" }}>
            {isEdit ? "Редактирование" : "Создание профиля"}
          </p>
          <h1 className="font-display text-3xl font-light" style={{ color: "hsl(36, 60%, 94%)" }}>
            Ваш профиль
          </h1>
        </div>
      </div>

      {/* Avatar upload */}
      <div className="flex justify-center -mt-12 mb-6 animate-scale-in">
        <div
          className="relative cursor-pointer group"
          onClick={() => fileRef.current?.click()}
        >
          <div
            className="w-24 h-24 rounded-full border-4 flex items-center justify-center overflow-hidden shadow-xl"
            style={{ borderColor: "hsl(42, 75%, 50%)", backgroundColor: "hsl(36, 40%, 92%)" }}
          >
            {avatar ? (
              <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <Icon name="User" size={36} className="text-muted-foreground" />
            )}
          </div>
          <div
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-110"
            style={{ background: "linear-gradient(135deg, hsl(345,65%,18%), hsl(345,55%,28%))" }}
          >
            <Icon name="Camera" size={14} style={{ color: "hsl(36, 60%, 94%)" }} />
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFile}
          className="hidden"
        />
      </div>

      {/* Upload options */}
      <div className="flex gap-3 justify-center px-6 mb-6 animate-fade-in">
        <button
          onClick={() => {
            if (fileRef.current) { fileRef.current.capture = "environment"; fileRef.current.click(); }
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border font-body text-xs font-medium transition-all hover:shadow-sm"
          style={{ borderColor: "hsl(345, 55%, 28%)", color: "hsl(345, 55%, 28%)", backgroundColor: "white" }}
        >
          <Icon name="Camera" size={13} />
          Камера
        </button>
        <button
          onClick={() => {
            if (fileRef.current) { fileRef.current.removeAttribute("capture"); fileRef.current.click(); }
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border font-body text-xs font-medium transition-all hover:shadow-sm"
          style={{ borderColor: "hsl(345, 55%, 28%)", color: "hsl(345, 55%, 28%)", backgroundColor: "white" }}
        >
          <Icon name="Image" size={13} />
          Галерея
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-6 pb-10 space-y-5 max-w-lg mx-auto animate-slide-up" style={{ animationDelay: "0.15s" }}>
        <div className="card-wine rounded-2xl p-6 space-y-5">
          <div>
            <label className="font-body text-xs font-medium tracking-wide text-muted-foreground uppercase mb-2 block">
              Никнейм
            </label>
            <div className="relative">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Ваш псевдоним"
                maxLength={30}
                className="w-full h-11 px-4 pl-10 bg-muted border border-border rounded-xl font-body text-sm transition-colors"
                required
              />
              <Icon name="AtSign" size={15} className="absolute left-3 top-3.5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-body">{nickname.length}/30</p>
          </div>

          <div>
            <label className="font-body text-xs font-medium tracking-wide text-muted-foreground uppercase mb-2 block">
              О себе
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Расскажите о своём опыте в дегустации вина, любимых регионах, стилях..."
              maxLength={300}
              rows={4}
              className="w-full px-4 py-3 bg-muted border border-border rounded-xl font-body text-sm resize-none transition-colors"
            />
            <p className="text-xs text-muted-foreground mt-1 font-body">{bio.length}/300</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl font-body font-semibold text-sm tracking-wide transition-all duration-200 hover:opacity-90 shadow-md disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, hsl(345,65%,18%) 0%, hsl(345,55%,28%) 100%)", color: "hsl(36,60%,94%)" }}
        >
          {loading ? "Сохранение..." : isEdit ? "Сохранить изменения" : "Продолжить"}
        </button>
      </form>
    </div>
  );
}