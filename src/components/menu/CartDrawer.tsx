import { useState } from "react";
import { useCart, calcItemTotal } from "@/lib/cart-context";
import {
  formatBRL,
  formatQty,
  WHATSAPP_NUMBER,
  ENDERECO_LOJA,
} from "@/data/menu";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Modo = "retirada" | "entrega";

export function CartDrawer({ open, onClose }: Props) {
  const { items, updateQty, removeItem, subtotal, clear } = useCart();
  const [modo, setModo] = useState<Modo>("retirada");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [obs, setObs] = useState("");
  const [erro, setErro] = useState("");

  const buildMessage = () => {
    const linhas: string[] = [];
    linhas.push("*NOVO PEDIDO — Doce Sonho* 🥐");
    linhas.push("");
    linhas.push(`*Cliente:* ${nome}`);
    linhas.push(`*Telefone:* ${telefone}`);
    linhas.push(`*Modalidade:* ${modo === "retirada" ? "🏬 Retirada na loja" : "🛵 Entrega"}`);
    if (modo === "entrega") linhas.push(`*Endereço:* ${endereco}`);
    linhas.push("");
    linhas.push("*Itens do pedido:*");
    items.forEach((it, idx) => {
      if (it.unit === "kg") {
        linhas.push(`\n${idx + 1}. *${it.name}*`);
        linhas.push(`   • Preço: ${formatBRL(it.price)}/kg`);
        linhas.push(`   • Peso a definir na retirada/entrega`);
      } else {
        linhas.push(`\n${idx + 1}. *${formatQty(it.qty, it.unit)} — ${it.name}*`);
      }
      Object.entries(it.selections).forEach(([k, v]) => {
        if (v.length) linhas.push(`   • ${k}: ${v.join(", ")}`);
      });
      if (it.unit !== "kg") linhas.push(`   Subtotal: ${formatBRL(calcItemTotal(it))}`);
    });
    linhas.push("");
    linhas.push(`*Total do pedido: ${formatBRL(subtotal)}*`);
    if (obs.trim()) {
      linhas.push("");
      linhas.push(`*Observações:* ${obs.trim()}`);
    }
    if (modo === "retirada") {
      linhas.push("");
      linhas.push(`_Retirada: ${ENDERECO_LOJA}_`);
    }
    return linhas.join("\n");
  };

  const handleEnviar = () => {
    setErro("");
    if (!items.length) { setErro("Seu carrinho está vazio."); return; }
    if (!nome.trim()) { setErro("Informe seu nome."); return; }
    if (!telefone.trim() || telefone.replace(/\D/g, "").length < 10) {
      setErro("Informe um telefone válido com DDD.");
      return;
    }
    if (modo === "entrega" && !endereco.trim()) {
      setErro("Informe o endereço de entrega.");
      return;
    }
    const msg = buildMessage();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  return (
    <div
      className={[
        "fixed inset-0 z-40 transition",
        open ? "pointer-events-auto" : "pointer-events-none",
      ].join(" ")}
    >
      <div
        onClick={onClose}
        className={[
          "absolute inset-0 bg-wine-deep/60 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
      <aside
        className={[
          "absolute right-0 top-0 h-full w-full sm:max-w-md bg-cream flex flex-col shadow-lift transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <header className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <div>
            <h2 className="font-display text-2xl text-wine">Seu pedido</h2>
            <p className="text-xs text-muted-foreground">
              {items.length} {items.length === 1 ? "item" : "itens"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full w-9 h-9 grid place-items-center hover:bg-wine/10 text-wine transition"
            aria-label="Fechar carrinho"
          >
            ✕
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <div className="text-5xl mb-3">🛒</div>
              <p>Seu carrinho está vazio.</p>
              <p className="text-xs mt-1">Escolha seus itens no cardápio ao lado.</p>
            </div>
          ) : (
            items.map((it) => (
              <div key={it.id} className="bg-card rounded-2xl border border-border/60 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-wine truncate">{it.name}</h4>
                    {Object.entries(it.selections).map(([k, v]) =>
                      v.length ? (
                        <p key={k} className="text-xs text-muted-foreground">
                          <span className="font-medium">{k}:</span> {v.join(", ")}
                        </p>
                      ) : null,
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(it.id)}
                    className="text-xs text-muted-foreground hover:text-destructive"
                    aria-label="Remover"
                  >
                    Remover
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      className="h-8 w-8 rounded-full bg-cream-deep text-wine font-bold hover:bg-wine hover:text-cream"
                      onClick={() =>
                        updateQty(it.id, Math.max(it.minQty, +(it.qty - it.step).toFixed(2)))
                      }
                    >
                      −
                    </button>
                    <span className="min-w-16 text-center font-semibold text-wine">
                      {formatQty(it.qty, it.unit)}
                    </span>
                    <button
                      className="h-8 w-8 rounded-full bg-cream-deep text-wine font-bold hover:bg-wine hover:text-cream"
                      onClick={() => updateQty(it.id, +(it.qty + it.step).toFixed(2))}
                    >
                      +
                    </button>
                  </div>
                  <span className="font-display text-lg text-wine">
                    {formatBRL(calcItemTotal(it))}
                  </span>
                </div>
              </div>
            ))
          )}

          {items.length > 0 && (
            <div className="pt-2 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-wine mb-2">
                  Modalidade
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["retirada", "entrega"] as Modo[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setModo(m)}
                      className={[
                        "rounded-xl border px-3 py-2.5 text-sm font-medium transition",
                        modo === m
                          ? "bg-wine text-cream border-wine"
                          : "bg-card border-border text-wine hover:border-wine/50",
                      ].join(" ")}
                    >
                      {m === "retirada" ? "🏬 Retirada" : "🛵 Entrega"}
                    </button>
                  ))}
                </div>
              </div>

              <FormField label="Nome" value={nome} onChange={setNome} placeholder="Seu nome" />
              <FormField
                label="Telefone / WhatsApp"
                value={telefone}
                onChange={setTelefone}
                placeholder="(19) 99999-9999"
                inputMode="tel"
              />
              {modo === "entrega" && (
                <FormField
                  label="Endereço de entrega"
                  value={endereco}
                  onChange={setEndereco}
                  placeholder="Rua, número, bairro, referência"
                  textarea
                />
              )}
              <FormField
                label="Observações"
                value={obs}
                onChange={setObs}
                placeholder="Ex: sem cebola, entregar às 18h, etc."
                textarea
              />
            </div>
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t border-border/60 px-5 py-4 bg-card/60 backdrop-blur space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-display text-2xl text-wine">{formatBRL(subtotal)}</span>
            </div>
            {erro && (
              <p className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded px-2 py-1.5">
                {erro}
              </p>
            )}
            <button
              onClick={handleEnviar}
              className="w-full h-13 rounded-xl bg-[#25D366] hover:brightness-95 text-white font-semibold py-3.5 flex items-center justify-center gap-2 shadow-soft transition"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.966-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.891c0 2.096.549 4.14 1.593 5.945L0 24l6.335-1.652a12.062 12.062 0 005.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.495-8.411L20.52 3.449zM12.05 21.785h-.004a9.87 9.87 0 01-5.03-1.378l-.361-.214-3.741.976 1-3.643-.235-.375a9.86 9.86 0 01-1.51-5.26c.002-5.45 4.437-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.826 9.826 0 012.892 6.994c-.003 5.45-4.437 9.886-9.887 9.886z"/>
              </svg>
              Enviar Pedido pelo WhatsApp
            </button>
            <button
              onClick={() => { if (confirm("Limpar todos os itens?")) clear(); }}
              className="w-full text-xs text-muted-foreground hover:text-destructive"
            >
              Limpar carrinho
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
}

function FormField({
  label, value, onChange, placeholder, textarea, inputMode,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; textarea?: boolean; inputMode?: "tel" | "text";
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wider text-wine mb-1.5">
        {label}
      </span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:border-wine focus:ring-2 focus:ring-wine/20"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:border-wine focus:ring-2 focus:ring-wine/20"
        />
      )}
    </label>
  );
}
