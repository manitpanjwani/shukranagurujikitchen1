import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Offer } from "@/lib/types";
import { Drawer, FieldText, FieldNumber, Toggle } from "./admin.items";

export const Route = createFileRoute("/admin/offers")({
  component: AdminOffers,
});

type Form = Partial<Offer>;
const empty: Form = { title: "", subtitle: "", code: "", active: true, sort_order: 0 };

function AdminOffers() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Form | null>(null);

  const { data } = useQuery({
    queryKey: ["admin", "offers"],
    queryFn: async () => {
      const { data } = await supabase.from("offers").select("*").order("sort_order");
      return data as Offer[];
    },
  });

  const save = async () => {
    if (!editing) return;
    const { id, ...rest } = editing;
    if (!rest.title) return toast.error("Title required");
    const { error } = id
      ? await supabase.from("offers").update(rest as any).eq("id", id)
      : await supabase.from("offers").insert(rest as any);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin", "offers"] });
    qc.invalidateQueries({ queryKey: ["offers"] });
  };

  const del = async (id: string) => {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("offers").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin", "offers"] });
    qc.invalidateQueries({ queryKey: ["offers"] });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">Offers</h1>
        <button onClick={() => setEditing({ ...empty })} className="bg-primary/15 hover:bg-primary/25 text-primary border border-primary/40 backdrop-blur-sm rounded-full px-5 py-2.5 text-sm font-medium flex items-center gap-2 transition">
          <Plus className="size-4" /> Add offer
        </button>
      </div>

      <div className="mt-6 bg-card border rounded-2xl divide-y">
        {data?.map((o) => (
          <div key={o.id} className="flex items-center gap-4 p-4">
            <div className="flex-1">
              <div className="font-medium">{o.title}</div>
              <div className="text-xs text-muted-foreground">
                {o.subtitle} {o.code && `· ${o.code}`} {!o.active && "· Inactive"}
              </div>
            </div>
            <button onClick={() => setEditing({ ...o })} className="p-2 hover:bg-muted rounded-lg"><Pencil className="size-4" /></button>
            <button onClick={() => del(o.id)} className="p-2 hover:bg-destructive/10 rounded-lg text-destructive"><Trash2 className="size-4" /></button>
          </div>
        ))}
      </div>

      {editing && (
        <Drawer title={editing.id ? "Edit offer" : "New offer"} onClose={() => setEditing(null)}>
          <div className="space-y-4">
            <FieldText label="Title" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} />
            <FieldText label="Subtitle" value={editing.subtitle ?? ""} onChange={(v) => setEditing({ ...editing, subtitle: v })} />
            <FieldText label="Code (optional)" value={editing.code ?? ""} onChange={(v) => setEditing({ ...editing, code: v })} />
            <FieldNumber label="Sort order" value={editing.sort_order ?? 0} onChange={(v) => setEditing({ ...editing, sort_order: v })} />
            <Toggle label="Active" value={!!editing.active} onChange={(v) => setEditing({ ...editing, active: v })} />
            <button onClick={save} className="w-full bg-primary text-primary-foreground rounded-full py-3 font-medium">Save</button>
          </div>
        </Drawer>
      )}
    </div>
  );
}
