import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Trash2, Plus, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Banner } from "@/lib/types";
import { Drawer, FieldText, FieldNumber, Toggle } from "./admin.items";

export const Route = createFileRoute("/admin/banners")({
  component: AdminBanners,
});

type Form = Partial<Banner> & { _desktopFile?: File | null; _mobileFile?: File | null };

const empty: Form = {
  title: "",
  subtitle: "",
  desktop_url: "",
  mobile_url: "",
  active: true,
  sort_order: 0,
};

async function upload(file: File, prefix: string) {
  const ext = file.name.split(".").pop();
  const path = `${prefix}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file);
  if (error) throw error;
  return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
}

function AdminBanners() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Form | null>(null);

  const { data } = useQuery({
    queryKey: ["admin", "banners"],
    queryFn: async () => {
      const { data } = await supabase.from("banners").select("*").order("sort_order");
      return data as Banner[];
    },
  });

  const save = async () => {
    if (!editing) return;
    const { _desktopFile, _mobileFile, id, ...rest } = editing;
    try {
      let desktop_url = rest.desktop_url ?? null;
      let mobile_url = rest.mobile_url ?? null;
      if (_desktopFile) desktop_url = await upload(_desktopFile, "banners/desktop");
      if (_mobileFile) mobile_url = await upload(_mobileFile, "banners/mobile");

      const payload: any = { ...rest, desktop_url, mobile_url };
      const { error } = id
        ? await supabase.from("banners").update(payload).eq("id", id)
        : await supabase.from("banners").insert(payload);
      if (error) throw error;
      toast.success(id ? "Banner updated" : "Banner added");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin", "banners"] });
      qc.invalidateQueries({ queryKey: ["banners"] });
    } catch (e: any) {
      toast.error(e.message ?? "Save failed");
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin", "banners"] });
    qc.invalidateQueries({ queryKey: ["banners"] });
  };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-4xl">Banners</h1>
          <p className="text-muted-foreground mt-1">
            Hero images for the homepage. Upload separate <b>desktop</b> and{" "}
            <b>mobile</b> versions.
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...empty })}
          className="bg-primary/15 hover:bg-primary/25 text-primary border border-primary/40 rounded-full px-5 py-2.5 text-sm font-medium flex items-center gap-2 backdrop-blur-sm transition"
        >
          <Plus className="size-4" /> Add banner
        </button>
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {data?.map((b) => (
          <div key={b.id} className="bg-card border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 gap-1 bg-muted">
              <div className="col-span-2 aspect-[16/9] bg-muted relative">
                {b.desktop_url ? (
                  <img src={b.desktop_url} className="w-full h-full object-cover" alt="" />
                ) : (
                  <Empty />
                )}
                <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wider bg-foreground/80 text-background px-2 py-0.5 rounded">Desktop</span>
              </div>
              <div className="aspect-[9/16] bg-muted relative">
                {b.mobile_url ? (
                  <img src={b.mobile_url} className="w-full h-full object-cover" alt="" />
                ) : (
                  <Empty />
                )}
                <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wider bg-foreground/80 text-background px-2 py-0.5 rounded">Mobile</span>
              </div>
            </div>
            <div className="p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{b.title || `Banner #${b.sort_order}`}</div>
                <div className="text-xs text-muted-foreground">
                  Sort {b.sort_order} · {b.active ? "Active" : "Hidden"}
                </div>
              </div>
              <button onClick={() => setEditing({ ...b })} className="p-2 hover:bg-muted rounded-lg">
                <Pencil className="size-4" />
              </button>
              <button onClick={() => del(b.id)} className="p-2 hover:bg-destructive/10 rounded-lg text-destructive">
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
        {data && data.length === 0 && (
          <div className="md:col-span-2 p-12 text-center text-muted-foreground text-sm bg-card border rounded-2xl">
            No banners yet — add your first one.
          </div>
        )}
      </div>

      {editing && (
        <Drawer title={editing.id ? "Edit banner" : "New banner"} onClose={() => setEditing(null)}>
          <div className="space-y-4">
            <FieldText label="Title (optional, internal)" value={editing.title ?? ""} onChange={(v) => setEditing({ ...editing, title: v })} />
            <FieldText label="Subtitle (optional)" value={editing.subtitle ?? ""} onChange={(v) => setEditing({ ...editing, subtitle: v })} />

            <div>
              <label className="text-sm font-medium">Desktop image (wide, ~16:9)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEditing({ ...editing, _desktopFile: e.target.files?.[0] ?? null })}
                className="mt-1 w-full text-sm"
              />
              {editing.desktop_url && (
                <img src={editing.desktop_url} className="mt-2 w-full aspect-[16/9] object-cover rounded-lg" alt="" />
              )}
            </div>
            <FieldText label="Or desktop image URL" value={editing.desktop_url ?? ""} onChange={(v) => setEditing({ ...editing, desktop_url: v })} />

            <div>
              <label className="text-sm font-medium">Mobile image (tall, ~9:16)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEditing({ ...editing, _mobileFile: e.target.files?.[0] ?? null })}
                className="mt-1 w-full text-sm"
              />
              {editing.mobile_url && (
                <img src={editing.mobile_url} className="mt-2 w-40 aspect-[9/16] object-cover rounded-lg" alt="" />
              )}
            </div>
            <FieldText label="Or mobile image URL" value={editing.mobile_url ?? ""} onChange={(v) => setEditing({ ...editing, mobile_url: v })} />

            <div className="grid grid-cols-2 gap-3">
              <FieldNumber label="Sort order" value={editing.sort_order ?? 0} onChange={(v) => setEditing({ ...editing, sort_order: v })} />
              <div className="flex items-end">
                <Toggle label="Active" value={!!editing.active} onChange={(v) => setEditing({ ...editing, active: v })} />
              </div>
            </div>

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

function Empty() {
  return (
    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
      <ImageIcon className="size-6" />
    </div>
  );
}
