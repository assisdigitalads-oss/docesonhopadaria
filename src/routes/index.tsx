import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState, useEffect } from "react";
import logoAsset from "@/assets/doce-sonho-logo.png.asset.json";
import heroImg from "@/assets/hero-bakery.jpg";
import {
  categories,
  products,
  formatBRL,
  formatUnitLabel,
  INSTAGRAM,
  WHATSAPP_NUMBER,
  ENDERECO_LOJA,
  type Product,
  type CategoryId,
} from "@/data/menu";
import { CartProvider, useCart } from "@/lib/cart-context";
import { ProductModal } from "@/components/menu/ProductModal";
import { CartDrawer } from "@/components/menu/CartDrawer";

export const Route = createFileRoute("/")({
  component: () => (
    <CartProvider>
      <MenuPage />
    </CartProvider>
  ),
});

function MenuPage() {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<CategoryId>(categories[0].id);
  const [product, setProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const catRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) => {
      if (p.name.toLowerCase().includes(term)) return true;
      if (p.description?.toLowerCase().includes(term)) return true;
      return (p.optionGroups ?? []).some((g) =>
        g.options.some((o) => o.name.toLowerCase().includes(term)),
      );
    });
  }, [search]);

  const grouped = useMemo(() => {
    const g: Record<CategoryId, Product[]> = {} as Record<CategoryId, Product[]>;
    for (const c of categories) g[c.id] = [];
    for (const p of filtered) g[p.category].push(p);
    return g;
  }, [filtered]);

  const scrollTo = (id: CategoryId) => {
    setActive(id);
    const el = catRefs.current[id];
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 140;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // update active on scroll
  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY + 180;
      let current: CategoryId = active;
      for (const c of categories) {
        const el = catRefs.current[c.id];
        if (el && el.offsetTop <= scrollY) current = c.id;
      }
      if (current !== active) setActive(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [active]);

  return (
    <div className="min-h-screen bg-background">
      <Header onOpenCart={() => setCartOpen(true)} />

      <Hero />

      <SearchBar search={search} setSearch={setSearch} />

      <CategoryNav active={active} onSelect={scrollTo} />

      <main className="mx-auto max-w-5xl px-4 pb-32 pt-6">
        {search && filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-5xl mb-3">🥐</div>
            <p>Nada encontrado para "{search}"</p>
          </div>
        )}

        {categories.map((cat) => {
          const items = grouped[cat.id];
          if (!items?.length) return null;
          return (
            <section
              key={cat.id}
              ref={(el) => { catRefs.current[cat.id] = el; }}
              className="scroll-mt-40 mb-14"
              id={`cat-${cat.id}`}
            >
              <div className="mb-5 flex items-end gap-4">
                <img
                  src={cat.image}
                  alt=""
                  className="h-16 w-16 rounded-2xl object-cover shadow-soft shrink-0"
                  loading="lazy"
                  width={64}
                  height={64}
                />
                <div className="min-w-0">
                  <h2 className="font-display text-3xl sm:text-4xl text-wine leading-none">
                    {cat.name}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">{cat.description}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} onSelect={() => setProduct(p)} categoryImg={cat.image} />
                ))}
              </div>
            </section>
          );
        })}

        <Footer />
      </main>

      <FloatingCartButton onClick={() => setCartOpen(true)} />

      <ProductModal product={product} onClose={() => setProduct(null)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

/* -------------------------- Sub-components -------------------------- */

function Header({ onOpenCart }: { onOpenCart: () => void }) {
  const { items } = useCart();
  const count = items.length;
  return (
    <header className="sticky top-0 z-30 border-b border-wine/10 bg-cream/95 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-4 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img src={logoAsset.url} alt="Doce Sonho" className="h-11 w-auto" />
          <div className="hidden sm:block min-w-0">
            <p className="font-display text-lg leading-none text-wine truncate">Doce Sonho</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Padaria e Confeitaria
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`https://instagram.com/${INSTAGRAM}`}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-wine hover:text-wine-deep font-medium"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
            @{INSTAGRAM}
          </a>
          <button
            onClick={onOpenCart}
            className="relative inline-flex items-center gap-2 rounded-full bg-wine text-cream px-4 py-2 text-sm font-medium shadow-soft hover:bg-wine-deep transition"
          >
            <span aria-hidden>🛒</span>
            <span className="hidden sm:inline">Pedido</span>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gold text-gold-foreground text-[11px] font-bold grid place-items-center">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-wheat-pattern">
      <div className="absolute inset-0 bg-gradient-wine opacity-90" />
      <img
        src={heroImg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-40"
        width={1600}
        height={1000}
      />
      <div className="relative mx-auto max-w-5xl px-4 py-14 sm:py-20 text-cream">
        <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold mb-4">
          <span className="h-px w-8 bg-gold" /> Cardápio de Encomendas
        </p>
        <h1 className="font-display text-4xl sm:text-6xl leading-[1.05] max-w-3xl">
          Feito à mão, com carinho de padaria de bairro.
        </h1>
        <p className="mt-4 max-w-xl text-cream/90 text-base sm:text-lg">
          Monte seu pedido de salgados, bolos, tortas, pizzas e doces — e envie direto pelo
          WhatsApp. Retirada ou entrega, você escolhe.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a
            href="#cat-folhados"
            className="inline-flex items-center gap-2 rounded-full bg-gold text-gold-foreground px-5 py-2.5 text-sm font-semibold hover:bg-cream transition"
          >
            Ver o cardápio →
          </a>
          <a
            href={`https://instagram.com/${INSTAGRAM}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-cream/40 text-cream px-5 py-2.5 text-sm font-medium hover:bg-cream/10 transition"
          >
            @{INSTAGRAM}
          </a>
        </div>
      </div>
    </section>
  );
}

function SearchBar({ search, setSearch }: { search: string; setSearch: (v: string) => void }) {
  return (
    <div className="sticky top-16 z-20 bg-cream/95 backdrop-blur border-b border-wine/10">
      <div className="mx-auto max-w-5xl px-4 py-3">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar salgados, bolos, sabores..."
            className="w-full h-11 rounded-full bg-card border border-border pl-11 pr-4 text-sm focus:outline-none focus:border-wine focus:ring-2 focus:ring-wine/20"
          />
        </div>
      </div>
    </div>
  );
}

function CategoryNav({
  active,
  onSelect,
}: {
  active: CategoryId;
  onSelect: (id: CategoryId) => void;
}) {
  return (
    <nav className="sticky top-[7.5rem] z-10 bg-cream/95 backdrop-blur border-b border-wine/10">
      <div className="mx-auto max-w-5xl px-2 py-2 overflow-x-auto scrollbar-hidden">
        <div className="flex gap-1.5 min-w-max">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={[
                "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition whitespace-nowrap",
                active === c.id
                  ? "bg-wine text-cream shadow-soft"
                  : "text-wine hover:bg-wine/10",
              ].join(" ")}
            >
              {c.short}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

function ProductCard({
  product, onSelect, categoryImg,
}: { product: Product; onSelect: () => void; categoryImg: string }) {
  const hasOptions = !!product.optionGroups?.length;
  return (
    <button
      onClick={onSelect}
      className="group text-left bg-card rounded-2xl border border-border/60 p-3 flex gap-3 hover:border-wine/40 hover:shadow-soft transition"
    >
      <img
        src={categoryImg}
        alt=""
        className="h-24 w-24 sm:h-28 sm:w-28 rounded-xl object-cover shrink-0"
        loading="lazy"
        width={112}
        height={112}
      />
      <div className="min-w-0 flex-1 flex flex-col">
        <h3 className="font-semibold text-wine leading-snug">{product.name}</h3>
        {product.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {product.description}
          </p>
        )}
        {hasOptions && (
          <p className="text-[11px] text-gold-deep font-medium mt-1">
            {product.optionGroups!.length === 1
              ? "Escolha o sabor"
              : `${product.optionGroups!.length} escolhas`}
          </p>
        )}
        <div className="mt-auto pt-2 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="font-display text-xl text-wine leading-none">
              {formatBRL(product.price)}
            </p>
            <p className="text-[11px] text-muted-foreground">
              por {formatUnitLabel(product.unit)}
              {product.unit === "cento" && ` · mín. ${product.minQty} un`}
            </p>
          </div>
          <span className="shrink-0 h-8 w-8 rounded-full bg-wine text-cream grid place-items-center text-lg font-bold group-hover:bg-wine-deep transition">
            +
          </span>
        </div>
      </div>
    </button>
  );
}

function FloatingCartButton({ onClick }: { onClick: () => void }) {
  const { items, subtotal } = useCart();
  if (items.length === 0) return null;
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 rounded-full bg-wine text-cream pl-5 pr-2 py-2 shadow-lift hover:bg-wine-deep transition"
    >
      <span className="text-sm">
        <span className="font-semibold">{items.length}</span>{" "}
        {items.length === 1 ? "item" : "itens"} · <span className="font-display">{formatBRL(subtotal)}</span>
      </span>
      <span className="rounded-full bg-gold text-gold-foreground px-3 py-1.5 text-xs font-bold">
        Ver pedido →
      </span>
    </button>
  );
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-wine/10 pt-8 text-sm text-muted-foreground">
      <div className="grid gap-6 sm:grid-cols-3">
        <div>
          <img src={logoAsset.url} alt="Doce Sonho" className="h-14 w-auto mb-2" />
          <p className="text-xs">Padaria e Confeitaria</p>
        </div>
        <div>
          <h4 className="font-semibold text-wine mb-1">Onde estamos</h4>
          <p className="text-xs leading-relaxed">{ENDERECO_LOJA}</p>
        </div>
        <div>
          <h4 className="font-semibold text-wine mb-1">Fale com a gente</h4>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noreferrer"
            className="block text-xs hover:text-wine"
          >
            WhatsApp: (19) 98219-3443
          </a>
          <a
            href={`https://instagram.com/${INSTAGRAM}`}
            target="_blank"
            rel="noreferrer"
            className="block text-xs hover:text-wine"
          >
            Instagram: @{INSTAGRAM}
          </a>
        </div>
      </div>
      <p className="text-[11px] text-center mt-8 pb-4">
        © {new Date().getFullYear()} Doce Sonho · Todos os preços conforme cardápio oficial.
      </p>
    </footer>
  );
}
