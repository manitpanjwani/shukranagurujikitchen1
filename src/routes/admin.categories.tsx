import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Category } from "@/lib/types";
import { Drawer, FieldText, FieldNumber } from "./admin.items";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

type Form = Partial<Category> & { _file?: File | null };

const empty: Form = { name: "", slug: "", icon: "", image_url: "", sort_order: 0 };

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function AdminCategories() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Form | null>(null);

  const { data } = useQuery({
    queryKey: ["admin", "categories"],
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
      const path = `categories/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("media").upload(path, _file);
      if (upErr) return toast.error(upErr.message);
      image_url = supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
    }

    const payload = { ...rest, image_url };
    const { error } = id
      ? await supabase.from("categories").update(payload).eq("id", id)
      : await supabase.from("categories").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin", "categories"] });
    qc.invalidateQueries({ queryKey: ["categories"] });
  };

  const del = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin", "categories"] });
    qc.invalidateQueries({ queryKey: ["categories"] });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">Categories</h1>
        <button
          onClick={() => setEditing({ ...empty })}
          className="bg-primary text-primary-foreground rounded-full px-5 py-2.5 text-sm font-medium flex items-center gap-2"
        >
          <Plus className="size-4" /> Add category
        </button>
      </div>

      <div className="mt-6 bg-card border rounded-2xl divide-y">
        {data?.map((c) => (
          <div key={c.id} className="flex items-center gap-4 p-4">
            {c.image_url && <img src={c.image_url} className="size-12 rounded-full object-cover" alt="" />}
            <div className="flex-1">
              <div className="font-medium">{c.icon} {c.name}</div>
              <div className="text-xs text-muted-foreground">/{c.slug}</div>
            </div>
            <button onClick={() => setEditing({ ...c })} className="p-2 hover:bg-muted rounded-lg">
              <Pencil className="size-4" />
            </button>
            <button onClick={() => del(c.id)} className="p-2 hover:bg-destructive/10 rounded-lg text-destructive">
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>

      {editing && (
        <Drawer title={editing.id ? "Edit category" : "New category"} onClose={() => setEditing(null)}>
          <div className="space-y-4">
            <FieldText label="Name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
            <FieldText label="Slug" value={editing.slug} placeholder="auto" onChange={(v) => setEditing({ ...editing, slug: v })} />
            <FieldText label="Icon (emoji)" value={editing.icon ?? ""} onChange={(v) => setEditing({ ...editing, icon: v })} />
            <FieldText label="Image URL" value={editing.image_url ?? ""} onChange={(v) => setEditing({ ...editing, image_url: v })} />
            <div>
              <label className="text-sm font-medium">Or upload image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEditing({ ...editing, _file: e.target.files?.[0] ?? null })}
                className="mt-1 w-full text-sm"
              />
            </div>
            <FieldNumber label="Sort order" value={editing.sort_order ?? 0} onChange={(v) => setEditing({ ...editing, sort_order: v })} />
            <button onClick={save} className="w-full bg-primary text-primary-foreground rounded-full py-3 font-medium">Save</button>
          </div>
        </Drawer>
      )}
    </div>
  );
}
