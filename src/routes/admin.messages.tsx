import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { ContactMessage } from "@/lib/types";

export const Route = createFileRoute("/admin/messages")({
  component: AdminMessages,
});

function AdminMessages() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "messages"],
    queryFn: async () => {
      const { data } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      return data as ContactMessage[];
    },
  });

  const del = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin", "messages"] });
    qc.invalidateQueries({ queryKey: ["admin", "counts"] });
  };

  return (
    <div>
      <h1 className="font-display text-4xl">Messages</h1>
      <p className="text-muted-foreground mt-1">{data?.length ?? 0} total</p>

      <div className="mt-6 space-y-4">
        {data?.map((m) => (
          <div key={m.id} className="bg-card border rounded-2xl p-5 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-medium">{m.name}</div>
                <div className="text-xs text-muted-foreground">
                  {m.email && <span>{m.email}</span>}
                  {m.email && m.phone && " · "}
                  {m.phone && <span>{m.phone}</span>}
                  {" · "}
                  {new Date(m.created_at).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => del(m.id)}
                className="p-2 hover:bg-destructive/10 rounded-lg text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">{m.message}</p>
          </div>
        ))}
        {(!data || data.length === 0) && (
          <div className="text-center text-muted-foreground py-12 bg-card border rounded-2xl">
            No messages yet.
          </div>
        )}
      </div>
    </div>
  );
}
