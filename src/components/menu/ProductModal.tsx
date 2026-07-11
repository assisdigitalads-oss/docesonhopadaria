import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/data/menu";
import { formatBRL, formatUnitLabel } from "@/data/menu";
import { useCart, type CartItem } from "@/lib/cart-context";

interface Props {
  product: Product | null;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: Props) {
  const { addItem } = useCart();
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [qty, setQty] = useState<number>(product?.minQty ?? 1);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (product) {
      setSelections({});
      setQty(product.minQty);
      setError("");
    }
  }, [product]);

  const unitPrice = product
    ? product.unit === "cento"
      ? product.price / 100
      : product.price
    : 0;

  const total = useMemo(
    () => (product ? (product.unit === "kg" ? 0 : unitPrice * qty) : 0),
    [product, unitPrice, qty],
  );

  if (!product) return null;

  const toggleOption = (groupLabel: string, name: string, max: number) => {
    setSelections((prev) => {
      const cur = prev[groupLabel] ?? [];
      if (cur.includes(name)) return { ...prev, [groupLabel]: cur.filter((n) => n !== name) };
      if (max === 1) return { ...prev, [groupLabel]: [name] };
      if (cur.length >= max) return prev;
      return { ...prev, [groupLabel]: [...cur, name] };
    });
  };

  const handleAdd = () => {
    for (const g of product.optionGroups ?? []) {
      const chosen = selections[g.label] ?? [];
      if (chosen.length < g.min) {
        setError(`Escolha ${g.min > 1 ? `pelo menos ${g.min}` : "uma opção"} em: ${g.label}`);
        return;
      }
    }
    if (qty < product.minQty) {
      setError(
        product.unit === "cento"
          ? `Quantidade mínima para salgados é ${product.minQty} unidades.`
          : `Quantidade mínima: ${product.minQty}${product.unit === "kg" ? " kg" : " un"}.`,
      );
      return;
    }
    const configKey =
      product.id +
      "|" +
      Object.entries(selections)
        .map(([k, v]) => `${k}:${v.join(",")}`)
        .join(";");
    const item: CartItem = {
      id: configKey,
      productId: product.id,
      name: product.name,
      unit: product.unit,
      price: product.price,
      qty,
      minQty: product.minQty,
      step: product.step,
      selections,
    };
    addItem(item);
    onClose();
  };

  const isCento = product.unit === "cento";
  const isKg = product.unit === "kg";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-wine-deep/70 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-card w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b bg-card/95 backdrop-blur px-5 py-4">
          <div className="min-w-0">
            <h3 className="font-display text-xl leading-tight text-wine truncate">{product.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatBRL(product.price)} / {formatUnitLabel(product.unit)}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="shrink-0 rounded-full w-9 h-9 grid place-items-center hover:bg-muted transition"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {product.description && (
            <p className="text-sm text-muted-foreground italic">{product.description}</p>
          )}

          {(product.optionGroups ?? []).map((group) => {
            const chosen = selections[group.label] ?? [];
            return (
              <div key={group.label}>
                <div className="flex items-baseline justify-between mb-2">
                  <h4 className="font-semibold text-sm text-wine">{group.label}</h4>
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {group.max === 1 ? "Obrigatório" : `Até ${group.max}`}
                  </span>
                </div>
                <div className="grid gap-1.5">
                  {group.options.map((opt) => {
                    const selected = chosen.includes(opt.name);
                    return (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => toggleOption(group.label, opt.name, group.max)}
                        className={[
                          "flex items-center justify-between text-left rounded-lg border px-3.5 py-2.5 text-sm transition",
                          selected
                            ? "border-wine bg-wine/5 text-wine font-medium"
                            : "border-border bg-background hover:border-wine/40",
                        ].join(" ")}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={[
                              "grid place-items-center h-5 w-5 rounded-full border text-[10px]",
                              selected ? "border-wine bg-wine text-cream" : "border-border",
                            ].join(" ")}
                          >
                            {selected ? "✓" : ""}
                          </span>
                          <span>
                            {opt.name}
                            {opt.veg && <span className="ml-1.5 text-[11px]" title="Vegetariano">🌿</span>}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Quantity — hidden for kg items (peso definido na retirada) */}
          {isKg ? (
            <div className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-wine">
              <p className="font-semibold">Preço por kg: {formatBRL(product.price)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                O peso final é definido na retirada ou entrega. O valor exato será
                informado neste momento.
              </p>
            </div>
          ) : (
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <h4 className="font-semibold text-sm text-wine">Quantidade</h4>
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {isCento ? `Mínimo ${product.minQty} un` : `Mínimo ${product.minQty} un`}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(product.minQty, +(q - product.step).toFixed(2)))}
                className="h-11 w-11 rounded-full bg-cream border border-border text-wine text-xl font-bold hover:bg-wine hover:text-cream transition"
                aria-label="Diminuir"
              >
                −
              </button>
              <input
                type="number"
                value={Number.isFinite(qty) ? qty : ""}
                min={product.minQty}
                step={product.step}
                inputMode="numeric"
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") { setQty(NaN as unknown as number); return; }
                  const v = parseFloat(raw);
                  setQty(Number.isFinite(v) ? v : (NaN as unknown as number));
                }}
                onBlur={() => {
                  if (!Number.isFinite(qty) || qty < product.minQty) setQty(product.minQty);
                }}
                className="w-24 text-center h-11 rounded-lg border bg-background font-semibold text-wine"
              />
              <button
                type="button"
                onClick={() => setQty((q) => +(q + product.step).toFixed(2))}
                className="h-11 w-11 rounded-full bg-cream border border-border text-wine text-xl font-bold hover:bg-wine hover:text-cream transition"
                aria-label="Aumentar"
              >
                +
              </button>
              <span className="text-sm text-muted-foreground">un</span>
            </div>
            {isCento && (
              <p className="text-xs text-muted-foreground mt-2">
                Salgados: qualquer quantidade a partir de 25 unidades.
              </p>
            )}
          </div>
          )}

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 border-t bg-card/95 backdrop-blur px-5 py-4">
          <button
            type="button"
            onClick={handleAdd}
            className="w-full h-13 rounded-xl bg-wine text-cream font-semibold shadow-soft hover:bg-wine-deep transition flex items-center justify-between px-5 py-3.5"
          >
            <span>Adicionar ao pedido</span>
            <span className="font-display text-lg">{formatBRL(total)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
