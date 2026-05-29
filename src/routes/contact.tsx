import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Shukrana Guruji Kitchen" },
      { name: "description", content: "Get in touch with Shukrana Guruji Kitchen. Call, email, or send us a message." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.message) {
      toast.error("Name and message are required");
      return;
    }
    setSending(true);
    const { error } = await supabase.from("contact_messages").insert(form as any);
    setSending(false);
    if (error) {
      toast.error("Couldn't send — try again");
      return;
    }
    toast.success("Thanks! We'll get back to you soon.");
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <SiteLayout>
      <section className="container-wide py-20">
        <div className="text-center mb-14">
          <div className="text-xs tracking-[0.3em] uppercase text-primary font-semibold">
            Reach out
          </div>
          <h1 className="font-display text-5xl md:text-6xl italic mt-3">Let's talk food.</h1>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Catering, bulk orders, feedback or just saying hi — we love hearing from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-5 bg-card border rounded-2xl shadow-soft">
              <div className="size-11 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="size-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Call us</div>
                <div className="text-muted-foreground text-sm">+91 90000 00000</div>
                <div className="text-xs text-muted-foreground mt-1">11 AM – 11 PM, every day</div>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 bg-card border rounded-2xl shadow-soft">
              <div className="size-11 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="size-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Email</div>
                <div className="text-muted-foreground text-sm">hello@shukranaguruji.com</div>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 bg-card border rounded-2xl shadow-soft">
              <div className="size-11 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="size-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Kitchen</div>
                <div className="text-muted-foreground text-sm">Kharadi, Pune 411014</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Serving Kharadi, Viman Nagar, Wagholi, Hadapsar
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="bg-card border rounded-2xl shadow-soft p-7 space-y-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full border rounded-lg px-3 py-2.5 bg-background outline-none focus:border-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2.5 bg-background outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2.5 bg-background outline-none focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Message *</label>
              <textarea
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="mt-1 w-full border rounded-lg px-3 py-2.5 bg-background outline-none focus:border-primary resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full bg-primary text-primary-foreground rounded-full py-3 font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition disabled:opacity-60"
            >
              <Send className="size-4" /> {sending ? "Sending..." : "Send message"}
            </button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
