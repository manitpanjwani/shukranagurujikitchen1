import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Faq } from "@/lib/types";
import { Drawer, FieldText, FieldNumber } from "./admin.items";

export const Route = createFileRoute("/admin/faqs")({
  component: AdminFaqs,
});

type Form = Partial<Faq>;
const empty: Form = { question: "", answer: "", sort_order: 0 };

function AdminFaqs() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Form | null>(null);

  const { data } = useQuery({
    queryKey: ["admin", "faqs"],
    queryFn: async () => {
      const { data } = await supabase.from("faqs").select("*").order("sort_order");
      return data as Faq[];
    },
  });

  const save = async () => {
    if (!editing) return;
    const { id, ...rest } = editing;
    if (!rest.question || !rest.answer) return toast.error("Question and answer required");
    const { error } = id
      ? await supabase.from("faqs").update(rest as any).eq("id", id)
      : await supabase.from("faqs").insert(rest as any);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin", "faqs"] });
    qc.invalidateQueries({ queryKey: ["faqs"] });
  };

  const del = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("faqs").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin", "faqs"] });
    qc.invalidateQueries({ queryKey: ["faqs"] });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">FAQs</h1>
        <button onClick={() => setEditing({ ...empty })} className="bg-primary/15 hover:bg-primary/25 text-primary border border-primary/40 backdrop-blur-sm rounded-full px-5 py-2.5 text-sm font-medium flex items-center gap-2 transition">
          <Plus className="size-4" /> Add FAQ
        </button>
      </div>

      <div className="mt-6 bg-card border rounded-2xl divide-y">
        {data?.map((f) => (
          <div key={f.id} className="flex items-start gap-4 p-4">
            <div className="flex-1">
              <div className="font-medium">{f.question}</div>
              <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{f.answer}</div>
            </div>
            <button onClick={() => setEditing({ ...f })} className="p-2 hover:bg-muted rounded-lg"><Pencil className="size-4" /></button>
            <button onClick={() => del(f.id)} className="p-2 hover:bg-destructive/10 rounded-lg text-destructive"><Trash2 className="size-4" /></button>
          </div>
        ))}
      </div>

      {editing && (
        <Drawer title={editing.id ? "Edit FAQ" : "New FAQ"} onClose={() => setEditing(null)}>
          <div className="space-y-4">
            <FieldText label="Question" value={editing.question} onChange={(v) => setEditing({ ...editing, question: v })} />
            <div>
              <label className="text-sm font-medium">Answer</label>
              <textarea
                rows={5}
                value={editing.answer ?? ""}
                onChange={(e) => setEditing({ ...editing, answer: e.target.value })}
                className="mt-1 w-full border rounded-lg px-3 py-2 bg-background outline-none focus:border-primary"
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
