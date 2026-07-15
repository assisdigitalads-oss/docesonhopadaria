import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  products as defaultProducts,
  categories,
  WHATSAPP_NUMBER as DEFAULT_WHATSAPP,
  PIX_KEY as DEFAULT_PIX_KEY,
  PIX_KEY_TYPE as DEFAULT_PIX_TYPE,
  PIX_BENEFICIARIO as DEFAULT_PIX_BENEFICIARIO,
  type Product,
  type CategoryId,
} from "@/data/menu";

const ADMIN_PIN = "0106";
const STORAGE_KEY = "doce-sonho-admin-v1";

export interface AdminSettings {
  whatsapp: string;
  pixKey: string;
  pixKeyType: string;
  pixBeneficiario: string;
}

interface StoreData {
  overrides: Record<string, Partial<Product>>;
  deleted: string[];
  custom: Product[];
  settings: AdminSettings;
}

const emptyStore: StoreData = {
  overrides: {},
  deleted: [],
  custom: [],
  settings: {
    whatsapp: DEFAULT_WHATSAPP,
    pixKey: DEFAULT_PIX_KEY,
    pixKeyType: DEFAULT_PIX_TYPE,
    pixBeneficiario: DEFAULT_PIX_BENEFICIARIO,
  },
};

interface AdminCtx {
  products: Product[];
  settings: AdminSettings;
  isAuthed: boolean;
  login: (pin: string) => boolean;
  logout: () => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  restoreProduct: (id: string) => void;
  addProduct: (p: Product) => void;
  updateSettings: (patch: Partial<AdminSettings>) => void;
  resetAll: () => void;
  deletedIds: string[];
  customIds: string[];
}

const AdminContext = createContext<AdminCtx | null>(null);

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<StoreData>(emptyStore);
  const [isAuthed, setAuthed] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setData({
          overrides: parsed.overrides ?? {},
          deleted: parsed.deleted ?? [],
          custom: parsed.custom ?? [],
          settings: { ...emptyStore.settings, ...(parsed.settings ?? {}) },
        });
      }
    } catch {}
    try {
      if (sessionStorage.getItem("doce-sonho-admin-auth") === "1") setAuthed(true);
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
  }, [data]);

  const products = useMemo<Product[]>(() => {
    const merged = defaultProducts
      .filter((p) => !data.deleted.includes(p.id))
      .map((p) => ({ ...p, ...(data.overrides[p.id] ?? {}) }));
    return [...merged, ...data.custom];
  }, [data]);

  const value: AdminCtx = {
    products,
    settings: data.settings,
    isAuthed,
    deletedIds: data.deleted,
    customIds: data.custom.map((p) => p.id),
    login: (pin) => {
      if (pin === ADMIN_PIN) {
        setAuthed(true);
        try { sessionStorage.setItem("doce-sonho-admin-auth", "1"); } catch {}
        return true;
      }
      return false;
    },
    logout: () => {
      setAuthed(false);
      try { sessionStorage.removeItem("doce-sonho-admin-auth"); } catch {}
    },
    updateProduct: (id, patch) =>
      setData((d) => {
        // custom product?
        if (d.custom.some((c) => c.id === id)) {
          return { ...d, custom: d.custom.map((c) => (c.id === id ? { ...c, ...patch } : c)) };
        }
        return { ...d, overrides: { ...d.overrides, [id]: { ...(d.overrides[id] ?? {}), ...patch } } };
      }),
    deleteProduct: (id) =>
      setData((d) => {
        if (d.custom.some((c) => c.id === id)) {
          return { ...d, custom: d.custom.filter((c) => c.id !== id) };
        }
        return { ...d, deleted: [...new Set([...d.deleted, id])] };
      }),
    restoreProduct: (id) =>
      setData((d) => ({ ...d, deleted: d.deleted.filter((x) => x !== id) })),
    addProduct: (p) =>
      setData((d) => ({ ...d, custom: [...d.custom, p] })),
    updateSettings: (patch) =>
      setData((d) => ({ ...d, settings: { ...d.settings, ...patch } })),
    resetAll: () => setData(emptyStore),
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminStoreProvider");
  return ctx;
}

export { categories, ADMIN_PIN };
export type { CategoryId };
