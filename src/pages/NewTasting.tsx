import { useState, useRef } from "react";
import Icon from "@/components/ui/icon";
import { TastingCard } from "@/types";

interface NewTastingProps {
  onSave: (card: Omit<TastingCard, "id" | "likes">) => void;
  onBack: () => void;
}

const WINE_STYLES = ["Красное", "Белое", "Розовое", "Игристое", "Оранжевое", "Десертное", "Крепленое"];
const COUNTRIES = ["Франция", "Италия", "Испания", "Австралия", "Аргентина", "Грузия", "Россия", "США", "Германия", "Португалия", "Другая"];
const DENSITIES = ["Лёгкое", "Среднее", "Полнотелое"];

export default function NewTasting({ onSave, onBack }: NewTastingProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState("");
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [producer, setProducer] = useState("");
  const [style, setStyle] = useState("Красное");
  const [impression, setImpression] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [aromaIntensity, setAromaIntensity] = useState(3);
  const [primaryAromas, setPrimaryAromas] = useState("");
  const [secondaryAromas, setSecondaryAromas] = useState("");
  const [flavor, setFlavor] = useState("");
  const [finish, setFinish] = useState("");
  const [color, setColor] = useState("");
  const [density, setDensity] = useState("Среднее");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [notes, setNotes] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) { alert("Поставьте общую оценку"); return; }
    onSave({ photo, name, year, country, region, producer, style, impression, date, aromaIntensity, primaryAromas, secondaryAromas, flavor, finish, color, density, rating, notes });
  };

  const InputField = ({ label, value, onChange, placeholder, type = "text", required = false }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean;
  }) => (
    <div>
      <label className="font-body text-xs font-medium tracking-wide text-muted-foreground uppercase mb-1.5 block">
        {label} {required && <span style={{ color: "hsl(345,55%,28%)" }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full h-10 px-3.5 bg-muted border border-border rounded-xl font-body text-sm transition-colors"
      />
    </div>
  );

  return (
    <div className="min-h-screen parchment-bg pb-10">
      {/* Header */}
      <div className="wine-gradient pt-12 pb-8 px-6 relative overflow-hidden sticky top-0 z-20">
        <div className="flex items-center gap-4 relative z-10">
          <button onClick={onBack} className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
            <Icon name="ArrowLeft" size={18} style={{ color: "hsl(36,60%,94%)" }} />
          </button>
          <div>
            <p className="font-body text-xs tracking-[0.2em] uppercase" style={{ color: "hsl(42,90%,70%)" }}>Новая</p>
            <h1 className="font-display text-2xl font-light" style={{ color: "hsl(36,60%,94%)" }}>Дегустация</h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pt-5 space-y-4 max-w-lg mx-auto">
        
        {/* Photo */}
        <div className="card-wine rounded-2xl p-5">
          <p className="font-body text-xs font-medium tracking-wide text-muted-foreground uppercase mb-3">Фото вина</p>
          <div className="flex gap-3 items-center">
            {photo ? (
              <div className="relative">
                <img src={photo} alt="wine" className="w-20 h-20 rounded-xl object-cover" />
                <button type="button" onClick={() => setPhoto("")}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "hsl(345,55%,28%)", color: "white" }}>
                  <Icon name="X" size={10} />
                </button>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center"
                style={{ borderColor: "hsl(36,20%,75%)", backgroundColor: "hsl(36,40%,95%)" }}>
                <Icon name="Image" size={24} className="text-muted-foreground" />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <button type="button"
                onClick={() => { if (fileRef.current) { fileRef.current.setAttribute("capture","environment"); fileRef.current.click(); } }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-body text-xs font-medium transition-all"
                style={{ border: "1px solid hsl(345,55%,28%)", color: "hsl(345,55%,28%)", backgroundColor: "white" }}>
                <Icon name="Camera" size={13} /> Камера
              </button>
              <button type="button"
                onClick={() => { if (fileRef.current) { fileRef.current.removeAttribute("capture"); fileRef.current.click(); } }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-body text-xs font-medium transition-all"
                style={{ border: "1px solid hsl(345,55%,28%)", color: "hsl(345,55%,28%)", backgroundColor: "white" }}>
                <Icon name="Image" size={13} /> Галерея
              </button>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </div>

        {/* Main info */}
        <div className="card-wine rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-4 rounded-full" style={{ backgroundColor: "hsl(42,75%,50%)" }} />
            <p className="font-display text-base font-semibold" style={{ color: "hsl(345,65%,18%)" }}>Основная информация</p>
          </div>
          <InputField label="Название вина" value={name} onChange={setName} placeholder="Château Margaux" required />
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Год урожая" value={year} onChange={setYear} placeholder="2020" />
            <div>
              <label className="font-body text-xs font-medium tracking-wide text-muted-foreground uppercase mb-1.5 block">Страна</label>
              <select value={country} onChange={(e) => setCountry(e.target.value)}
                className="w-full h-10 px-3 bg-muted border border-border rounded-xl font-body text-sm">
                <option value="">Выберите</option>
                {COUNTRIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <InputField label="Регион" value={region} onChange={setRegion} placeholder="Бордо, Тоскана..." />
          <InputField label="Производитель" value={producer} onChange={setProducer} placeholder="Название хозяйства" />
          
          <div>
            <label className="font-body text-xs font-medium tracking-wide text-muted-foreground uppercase mb-2 block">
              Стиль вина
            </label>
            <div className="flex flex-wrap gap-2">
              {WINE_STYLES.map(s => (
                <button key={s} type="button" onClick={() => setStyle(s)}
                  className="px-3 py-1.5 rounded-full font-body text-xs font-medium transition-all duration-150"
                  style={style === s
                    ? { backgroundColor: "hsl(345,55%,28%)", color: "hsl(36,60%,94%)" }
                    : { border: "1px solid hsl(36,20%,80%)", color: "hsl(345,30%,40%)", backgroundColor: "white" }
                  }>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-body text-xs font-medium tracking-wide text-muted-foreground uppercase mb-1.5 block">
              Дата дегустации
            </label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full h-10 px-3.5 bg-muted border border-border rounded-xl font-body text-sm" />
          </div>
        </div>

        {/* Sensory */}
        <div className="card-wine rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-4 rounded-full" style={{ backgroundColor: "hsl(42,75%,50%)" }} />
            <p className="font-display text-base font-semibold" style={{ color: "hsl(345,65%,18%)" }}>Сенсорный анализ</p>
          </div>
          
          <InputField label="Цвет" value={color} onChange={setColor} placeholder="Рубиново-красный, янтарный..." />
          
          <div>
            <label className="font-body text-xs font-medium tracking-wide text-muted-foreground uppercase mb-2 block">
              Плотность
            </label>
            <div className="flex gap-2">
              {DENSITIES.map(d => (
                <button key={d} type="button" onClick={() => setDensity(d)}
                  className="flex-1 py-2 rounded-xl font-body text-xs font-medium transition-all"
                  style={density === d
                    ? { backgroundColor: "hsl(345,55%,28%)", color: "hsl(36,60%,94%)" }
                    : { border: "1px solid hsl(36,20%,80%)", color: "hsl(345,30%,40%)", backgroundColor: "white" }
                  }>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-body text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Интенсивность аромата
              </label>
              <span className="font-display text-sm font-semibold" style={{ color: "hsl(345,55%,28%)" }}>
                {["", "Низкая", "Умеренная", "Средняя", "Высокая", "Интенсивная"][aromaIntensity]}
              </span>
            </div>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => setAromaIntensity(n)}
                  className="flex-1 h-2 rounded-full transition-all"
                  style={{ backgroundColor: n <= aromaIntensity ? "hsl(345,55%,28%)" : "hsl(36,20%,85%)" }} />
              ))}
            </div>
          </div>

          <InputField label="Первичные ароматы" value={primaryAromas} onChange={setPrimaryAromas} placeholder="Фруктовые, цветочные..." />
          <InputField label="Вторичные и третичные ароматы" value={secondaryAromas} onChange={setSecondaryAromas} placeholder="Дубовые, пряные, земляные..." />
          <InputField label="Вкус" value={flavor} onChange={setFlavor} placeholder="Кислотность, танины, баланс..." />
          <InputField label="Послевкусие" value={finish} onChange={setFinish} placeholder="Длина, нюансы..." />
          
          <div>
            <label className="font-body text-xs font-medium tracking-wide text-muted-foreground uppercase mb-2 block">
              Общее впечатление
            </label>
            <textarea value={impression} onChange={(e) => setImpression(e.target.value)}
              placeholder="Описание вина, впечатления, особенности..."
              rows={3}
              className="w-full px-3.5 py-3 bg-muted border border-border rounded-xl font-body text-sm resize-none" />
          </div>
        </div>

        {/* Rating */}
        <div className="card-wine rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 rounded-full" style={{ backgroundColor: "hsl(42,75%,50%)" }} />
            <p className="font-display text-base font-semibold" style={{ color: "hsl(345,65%,18%)" }}>Общая оценка</p>
          </div>
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="flex gap-3 star-rating">
              {[1,2,3,4,5].map(n => (
                <button
                  key={n}
                  type="button"
                  className="star text-4xl transition-all duration-150"
                  style={{ color: n <= (hoveredRating || rating) ? "hsl(42,75%,50%)" : "hsl(36,20%,80%)" }}
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHoveredRating(n)}
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          {rating > 0 && (
            <p className="text-center font-display text-sm italic text-muted-foreground">
              {["","Слабое","Удовлетворительное","Хорошее","Очень хорошее","Превосходное"][rating]}
            </p>
          )}
        </div>

        {/* Notes */}
        <div className="card-wine rounded-2xl p-5">
          <label className="font-body text-xs font-medium tracking-wide text-muted-foreground uppercase mb-2 block">
            Примечания
          </label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Любые дополнительные заметки, сочетания с едой, цена..."
            rows={3}
            className="w-full px-3.5 py-3 bg-muted border border-border rounded-xl font-body text-sm resize-none" />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full h-12 rounded-xl font-body font-semibold text-sm tracking-wide transition-all duration-200 hover:opacity-90 shadow-md"
          style={{ background: "linear-gradient(135deg, hsl(345,65%,18%) 0%, hsl(345,55%,28%) 100%)", color: "hsl(36,60%,94%)" }}
        >
          Сохранить дегустацию
        </button>
      </form>
    </div>
  );
}
