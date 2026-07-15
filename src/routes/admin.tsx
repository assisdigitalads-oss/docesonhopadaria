import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useRef, type ChangeEvent } from "react";
import { AdminStoreProvider, useAdmin } from "@/lib/admin-store";
import { categories, formatBRL, type CategoryId, type Product, type PriceUnit } from "@/data/menu";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel administrativo — Doce Sonho" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <AdminStoreProvider>
      <AdminGate />
    </AdminStoreProvider>
  ),
});

function AdminGate() {
  const { isAuthed } = useAdmin();
  return isAuthed ? <AdminPanel /> : <PinScreen />;
}

function PinScreen() {
  const { login } = useAdmin();
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  return (
    <div className="min-h-screen bg-background grid place-items-center px-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!login(pin)) { setErr("PIN incorreto."); setPin(""); }
        }}
        className="w-full max-w-sm bg-card rounded-2xl shadow-lift border border-border/60 p-6 space-y-4"
      >
        <div className="text-center">
          <div className="text-4xl mb-2">🔐</div>
          <h1 className="font-display text-2xl text-wine">Painel administrativo</h1>
          <p className="text-xs text-muted-foreground mt-1">Digite o PIN para continuar</p>
        </div>
        <input
          autoFocus
          type="password"
          inputMode="numeric"
          maxLength={8}
          value={pin}
          onChange={(e) => { setPin(e.target.value); setErr(""); }}
          placeholder="PIN"
          className="w-full h-12 text-center text-xl tracking-[0.5em] font-semibold rounded-lg border border-border bg-background focus:outline-none focus:border-wine focus:ring-2 focus:ring-wine/20"
        />
        {err && <p className="text-xs text-destructive text-center">{err}</p>}
        <button type="submit" className="w-full h-11 rounded-lg bg-wine text-cream font-semibold hover:bg-wine-deep transition">
          Entrar
        </button>
        <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-wine">← Voltar ao cardápio</Link>
      </form>
    </div>
  );
}

function AdminPanel() {
  const { products, settings, updateSettings, updateProduct, deleteProduct, addProduct, logout, resetAll, customIds } = useAdmin();
  const [tab, setTab] = useState<"produtos" | "config">("produtos");
  const [filterCat, setFilterCat] = useState<CategoryId | "all">("all");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (filterCat !== "all" && p.category !== filterCat) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [products, filterCat, search]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-wine/10 bg-cream/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 h-16 flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl text-wine leading-none">Painel administrativo</h1>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Doce Sonho</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="text-xs text-wine hover:underline">Ver cardápio</Link>
            <button onClick={logout} className="text-xs rounded-full px-3 py-1.5 bg-wine text-cream hover:bg-wine-deep">Sair</button>
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-4 pb-2 flex gap-2">
          {(["produtos", "config"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={[
                "rounded-full px-4 py-1.5 text-sm font-medium transition",
                tab === t ? "bg-wine text-cream" : "text-wine hover:bg-wine/10",
              ].join(" ")}
            >
              {t === "produtos" ? "Produtos" : "Configurações"}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 pb-24">
        {tab === "produtos" ? (
          <>
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar produto..."
                className="flex-1 h-10 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:border-wine"
              />
              <select
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value as CategoryId | "all")}
                className="h-10 rounded-lg border border-border bg-card px-3 text-sm"
              >
                <option value="all">Todas categorias</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button
                onClick={() => setShowAdd(true)}
                className="h-10 rounded-lg bg-wine text-cream text-sm font-semibold px-4 hover:bg-wine-deep"
              >
                + Novo produto
              </button>
            </div>

            <div className="grid gap-2">
              {filtered.map((p) => (
                <ProductRow
                  key={p.id}
                  product={p}
                  isCustom={customIds.includes(p.id)}
                  onSave={(patch) => updateProduct(p.id, patch)}
                  onDelete={() => {
                    if (confirm(`Apagar "${p.name}"?`)) deleteProduct(p.id);
                  }}
                />
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-10 text-muted-foreground text-sm">Nenhum produto encontrado.</div>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-border/60">
              <button
                onClick={() => { if (confirm("Restaurar cardápio original e apagar todas as alterações?")) resetAll(); }}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Restaurar cardápio original (apaga todas as alterações)
              </button>
            </div>
          </>
        ) : (
          <SettingsPanel settings={settings} onSave={updateSettings} />
        )}
      </main>

      {showAdd && (
        <AddProductModal
          onClose={() => setShowAdd(false)}
          onAdd={(p) => { addProduct(p); setShowAdd(false); }}
        />
      )}
    </div>
  );
}

function ProductRow({
  product, onSave, onDelete, isCustom,
}: {
  product: Product;
  onSave: (patch: Partial<Product>) => void;
  onDelete: () => void;
  isCustom: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(String(product.price));
  const [description, setDescription] = useState(product.description ?? "");
  const [image, setImage] = useState(product.image ?? "");
  const cat = categories.find((c) => c.id === product.category);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) { alert("Imagem muito grande (máx. 2 MB)."); return; }
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(f);
  };

  const save = () => {
    const priceN = parseFloat(price.replace(",", "."));
    if (!Number.isFinite(priceN) || priceN < 0) { alert("Preço inválido"); return; }
    onSave({
      name: name.trim() || product.name,
      price: priceN,
      description: description.trim() || undefined,
      image: image || undefined,
    });
    setOpen(false);
  };

  return (
    <div className="bg-card rounded-xl border border-border/60 overflow-hidden">
      <div className="flex items-center gap-3 p-3">
        <img
          src={image || product.image || cat?.image}
          alt=""
          className="h-14 w-14 rounded-lg object-cover shrink-0 border border-border"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-wine truncate">{product.name}</p>
            {isCustom && <span className="text-[10px] uppercase bg-gold/20 text-gold-deep px-1.5 py-0.5 rounded">Novo</span>}
          </div>
          <p className="text-xs text-muted-foreground">
            {cat?.short} · {formatBRL(product.price)} / {product.unit}
          </p>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="text-xs rounded-lg px-3 py-1.5 bg-wine/10 text-wine hover:bg-wine/20"
        >
          {open ? "Fechar" : "Editar"}
        </button>
        <button
          onClick={onDelete}
          className="text-xs rounded-lg px-3 py-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20"
        >
          Apagar
        </button>
      </div>
      {open && (
        <div className="border-t border-border/60 p-4 space-y-3 bg-background/50">
          <Field label="Nome" value={name} onChange={setName} />
          <Field label="Preço (R$)" value={price} onChange={setPrice} inputMode="decimal" />
          <Field label="Descrição" value={description} onChange={setDescription} textarea />
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-wine mb-1.5">Foto</label>
            <div className="flex items-center gap-3">
              <img
                src={image || product.image || cat?.image}
                alt=""
                className="h-16 w-16 rounded-lg object-cover border border-border"
              />
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-xs rounded-lg px-3 py-2 bg-wine/10 text-wine hover:bg-wine/20"
              >
                Escolher imagem
              </button>
              {image && (
                <button type="button" onClick={() => setImage("")} className="text-xs text-muted-foreground hover:text-destructive">
                  Remover foto
                </button>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Máx. 2 MB. Fica salva no seu navegador.</p>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={save} className="flex-1 h-10 rounded-lg bg-wine text-cream font-semibold hover:bg-wine-deep">
              Salvar alterações
            </button>
            <button onClick={() => setOpen(false)} className="h-10 rounded-lg px-4 border border-border text-sm">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AddProductModal({ onClose, onAdd }: { onClose: () => void; onAdd: (p: Product) => void }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState<PriceUnit>("un");
  const [category, setCategory] = useState<CategoryId>(categories[0].id);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) { alert("Imagem muito grande (máx. 2 MB)."); return; }
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(f);
  };

  const submit = () => {
    if (!name.trim()) { alert("Informe um nome"); return; }
    const priceN = parseFloat(price.replace(",", "."));
    if (!Number.isFinite(priceN) || priceN < 0) { alert("Preço inválido"); return; }
    const defaults =
      unit === "cento"
        ? { minQty: 25, step: 1 }
        : unit === "kg"
          ? { minQty: 0.5, step: 0.5 }
          : { minQty: 1, step: 1 };
    const id = `custom-${Date.now()}-${name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").slice(0, 30)}`;
    onAdd({
      id,
      name: name.trim(),
      price: priceN,
      unit,
      category,
      description: description.trim() || undefined,
      image: image || undefined,
      ...defaults,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-wine-deep/70 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div className="bg-card w-full max-w-lg rounded-2xl shadow-lift max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-display text-xl text-wine">Novo produto</h2>
          <button onClick={onClose} aria-label="Fechar" className="rounded-full w-8 h-8 grid place-items-center hover:bg-muted">✕</button>
        </header>
        <div className="p-5 space-y-3">
          <Field label="Nome" value={name} onChange={setName} placeholder="Ex: Bolo especial" />
          <div className="grid grid-cols-2 gap-2">
            <Field label="Preço (R$)" value={price} onChange={setPrice} inputMode="decimal" placeholder="0,00" />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-wine mb-1.5">Unidade</label>
              <select value={unit} onChange={(e) => setUnit(e.target.value as PriceUnit)} className="w-full h-10 rounded-lg border border-border bg-background px-2 text-sm">
                <option value="un">Unidade</option>
                <option value="cento">Cento (100 un)</option>
                <option value="kg">Quilo (kg)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-wine mb-1.5">Categoria</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as CategoryId)} className="w-full h-10 rounded-lg border border-border bg-background px-2 text-sm">
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <Field label="Descrição" value={description} onChange={setDescription} textarea />
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-wine mb-1.5">Foto</label>
            <div className="flex items-center gap-3">
              {image && <img src={image} alt="" className="h-16 w-16 rounded-lg object-cover border border-border" />}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
              <button type="button" onClick={() => fileRef.current?.click()} className="text-xs rounded-lg px-3 py-2 bg-wine/10 text-wine hover:bg-wine/20">
                Escolher imagem
              </button>
              {image && (
                <button type="button" onClick={() => setImage("")} className="text-xs text-muted-foreground hover:text-destructive">Remover</button>
              )}
            </div>
          </div>
        </div>
        <footer className="border-t px-5 py-4 flex gap-2">
          <button onClick={submit} className="flex-1 h-11 rounded-lg bg-wine text-cream font-semibold hover:bg-wine-deep">
            Adicionar produto
          </button>
          <button onClick={onClose} className="h-11 rounded-lg px-4 border border-border text-sm">Cancelar</button>
        </footer>
      </div>
    </div>
  );
}

function SettingsPanel({
  settings, onSave,
}: {
  settings: { whatsapp: string; pixKey: string; pixKeyType: string; pixBeneficiario: string };
  onSave: (patch: Partial<{ whatsapp: string; pixKey: string; pixKeyType: string; pixBeneficiario: string }>) => void;
}) {
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp);
  const [pixKey, setPixKey] = useState(settings.pixKey);
  const [pixKeyType, setPixKeyType] = useState(settings.pixKeyType);
  const [pixBeneficiario, setPixBeneficiario] = useState(settings.pixBeneficiario);
  const [saved, setSaved] = useState(false);

  const save = () => {
    const wa = whatsapp.replace(/\D/g, "");
    if (wa.length < 10) { alert("WhatsApp inválido — inclua DDD e país (ex: 5519982193443)"); return; }
    onSave({ whatsapp: wa, pixKey: pixKey.trim(), pixKeyType: pixKeyType.trim(), pixBeneficiario: pixBeneficiario.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-xl space-y-6">
      <section className="bg-card rounded-2xl border border-border/60 p-5 space-y-3">
        <h2 className="font-display text-xl text-wine">WhatsApp da empresa</h2>
        <Field
          label="Número (com país e DDD)"
          value={whatsapp}
          onChange={setWhatsapp}
          placeholder="5519982193443"
          inputMode="tel"
        />
        <p className="text-[11px] text-muted-foreground">
          Formato internacional, apenas números. Ex: 55 (Brasil) + 19 (DDD) + 98219-3443.
        </p>
      </section>

      <section className="bg-card rounded-2xl border border-border/60 p-5 space-y-3">
        <h2 className="font-display text-xl text-wine">Chave Pix</h2>
        <Field label="Chave Pix" value={pixKey} onChange={setPixKey} placeholder="13.665.441/0001-54" />
        <Field label="Tipo de chave" value={pixKeyType} onChange={setPixKeyType} placeholder="CNPJ" />
        <Field label="Beneficiário" value={pixBeneficiario} onChange={setPixBeneficiario} placeholder="Doce Sonho Padaria" />
      </section>

      <div className="flex items-center gap-3">
        <button onClick={save} className="h-11 rounded-lg bg-wine text-cream font-semibold px-6 hover:bg-wine-deep">
          Salvar configurações
        </button>
        {saved && <span className="text-sm text-green-700">✓ Salvo!</span>}
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, textarea, inputMode,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; textarea?: boolean; inputMode?: "tel" | "text" | "decimal" | "numeric";
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wider text-wine mb-1.5">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-wine focus:ring-2 focus:ring-wine/20"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:border-wine focus:ring-2 focus:ring-wine/20"
        />
      )}
    </label>
  );
}
