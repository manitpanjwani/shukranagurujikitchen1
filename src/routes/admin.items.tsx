import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Trash2, Plus, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Category, MenuItem } from "@/lib/types";

export const Route = createFileRoute("/admin/items")({
  component: AdminItems,
});

type Form = Partial<MenuItem> & { _file?: File | null };

const empty: Form = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  compare_at_price: null,
  category_id: null,
  is_veg: true,
  is_bestseller: false,
  in_stock: true,
  rating: 4.5,
  reviews_count: 0,
  image_url: "",
  sort_order: 0,
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function AdminItems() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Form | null>(null);
  const [search, setSearch] = useState("");

  const { data: items } = useQuery({
    queryKey: ["admin", "items"],
    queryFn: async () => {
      const { data } = await supabase.from("menu_items").select("*").order("sort_order");
      return data as MenuItem[];
    },
  });
  const { data: cats } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("sort_order");
      return data as Category[];
    },
  });

  const save = async () => {
    if (!editing) return;
    const { _file, id, ...rest } = editing;
    if (!rest.name) return toast.error("Name required");
    if (!rest.slug) rest.slug = slugify(rest.name);

    let image_url = rest.image_url ?? null;
    if (_file) {
      const ext = _file.name.split(".").pop();
      const path = `items/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("media").upload(path, _file);
      if (upErr) return toast.error(upErr.message);
      image_url = supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
    }

    const payload = { ...rest, image_url, updated_at: new Date().toISOString() };
    const { error } = id
      ? await supabase.from("menu_items").update(payload).eq("id", id)
      : await supabase.from("menu_items").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(id ? "Item updated" : "Item created");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin", "items"] });
    qc.invalidateQueries({ queryKey: ["menu_items"] });
    qc.invalidateQueries({ queryKey: ["bestsellers"] });
    qc.invalidateQueries({ queryKey: ["items-preview"] });
  };

  const del = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin", "items"] });
    qc.invalidateQueries({ queryKey: ["menu_items"] });
  };

  const filtered = items?.filter((i) => i.name.toLowerCase().includes(search.toLowerCase())) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-4xl">Menu items</h1>
          <p className="text-muted-foreground mt-1">{items?.length ?? 0} dishes</p>
        </div>
        <button
          onClick={() => setEditing({ ...empty })}
          className="bg-primary text-primary-foreground rounded-full px-5 py-2.5 text-sm font-medium flex items-center gap-2 hover:bg-primary/90"
        >
          <Plus className="size-4" /> Add item
        </button>
      </div>

      <input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mt-6 w-full max-w-md border rounded-lg px-3 py-2 bg-background outline-none focus:border-primary"
      />

      <div className="mt-6 bg-card border rounded-2xl divide-y overflow-hidden">
        {filtered.map((i) => (
          <div key={i.id} className="flex items-center gap-4 p-4">
            {i.image_url && <img src={i.image_url} className="size-14 rounded-lg object-cover" alt="" />}
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{i.name}</div>
              <div className="text-xs text-muted-foreground">
                ₹{i.price} · {cats?.find((c) => c.id === i.category_id)?.name ?? "—"} ·{" "}
                {i.is_veg ? "Veg" : "Non-veg"} {i.is_bestseller && "· ★"} {!i.in_stock && "· Out"}
              </div>
            </div>
            <button onClick={() => setEditing({ ...i })} className="p-2 hover:bg-muted rounded-lg">
              <Pencil className="size-4" />
            </button>
            <button onClick={() => del(i.id)} className="p-2 hover:bg-destructive/10 rounded-lg text-destructive">
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="p-12 text-center text-muted-foreground text-sm">No items.</div>
        )}
      </div>

      {editing && (
        <Drawer title={editing.id ? "Edit item" : "New item"} onClose={() => setEditing(null)}>
          <div className="space-y-4">
            <FieldText label="Name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
            <FieldText
              label="Slug"
              value={editing.slug}
              placeholder="auto from name"
              onChange={(v) => setEditing({ ...editing, slug: v })}
            />
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                rows={3}
                value={editing.description ?? ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className="mt-1 w-full border rounded-lg px-3 py-2 bg-background outline-none focus:border-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FieldNumber label="Price ₹" value={editing.price} onChange={(v) => setEditing({ ...editing, price: v })} />
              <FieldNumber
                label="Compare price (optional)"
                value={editing.compare_at_price ?? 0}
                onChange={(v) => setEditing({ ...editing, compare_at_price: v || null })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                value={editing.category_id ?? ""}
                onChange={(e) => setEditing({ ...editing, category_id: e.target.value || null })}
                className="mt-1 w-full border rounded-lg px-3 py-2 bg-background outline-none focus:border-primary"
              >
                <option value="">— None —</option>
                {cats?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <FieldNumber label="Rating" value={editing.rating} step={0.1} onChange={(v) => setEditing({ ...editing, rating: v })} />
              <FieldNumber label="Reviews" value={editing.reviews_count} onChange={(v) => setEditing({ ...editing, reviews_count: v })} />
              <FieldNumber label="Sort" value={editing.sort_order} onChange={(v) => setEditing({ ...editing, sort_order: v })} />
            </div>
            <div className="flex flex-wrap gap-4">
              <Toggle label="Veg" value={!!editing.is_veg} onChange={(v) => setEditing({ ...editing, is_veg: v })} />
              <Toggle label="Bestseller" value={!!editing.is_bestseller} onChange={(v) => setEditing({ ...editing, is_bestseller: v })} />
              <Toggle label="In stock" value={!!editing.in_stock} onChange={(v) => setEditing({ ...editing, in_stock: v })} />
            </div>
            <FieldText
              label="Image URL"
              value={editing.image_url ?? ""}
              onChange={(v) => setEditing({ ...editing, image_url: v })}
            />
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Upload className="size-4" /> Or upload image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEditing({ ...editing, _file: e.target.files?.[0] ?? null })}
                className="mt-1 w-full text-sm"
              />
            </div>
            {editing.image_url && (
              <img src={editing.image_url} className="w-full h-40 object-cover rounded-lg" alt="" />
            )}
            <button
              onClick={save}
              className="w-full bg-primary text-primary-foreground rounded-full py-3 font-medium hover:bg-primary/90"
            >
              Save
            </button>
          </div>
        </Drawer>
      )}
    </div>
  );
}

export function Drawer({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-lg bg-background h-full overflow-auto shadow-2xl">
        <div className="sticky top-0 bg-background z-10 flex items-center justify-between p-5 border-b">
          <h2 className="font-display text-2xl">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
            <X className="size-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function FieldText({ label, value, onChange, placeholder }: { label: string; value: string | undefined; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border rounded-lg px-3 py-2 bg-background outline-none focus:border-primary"
      />
    </div>
  );
}

export function FieldNumber({ label, value, onChange, step = 1 }: { label: string; value: number | null | undefined; onChange: (v: number) => void; step?: number }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        type="number"
        step={step}
        value={value ?? 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full border rounded-lg px-3 py-2 bg-background outline-none focus:border-primary"
      />
    </div>
  );
}

export function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
