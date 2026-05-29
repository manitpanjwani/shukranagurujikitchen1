import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ChefHat, Leaf, Truck } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Shukrana Guruji Kitchen" },
      { name: "description", content: "Our story — a Pune cloud kitchen serving slow-cooked, soulful Indian food made with fresh ingredients every day." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <section className="container-wide py-20">
        <div className="max-w-3xl">
          <div className="text-xs tracking-[0.3em] uppercase text-primary font-semibold">
            Our Story
          </div>
          <h1 className="font-display text-5xl md:text-6xl italic mt-4">
            Food made the way home does it.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Shukrana Guruji Kitchen started with a simple idea — that great food doesn't have to
            be fancy. It has to be honest. We slow-cook our gravies, hand-roll our parathas, and
            press fresh juices every morning. Nothing frozen, nothing reheated, nothing
            shortcut.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <img
            src="https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&h=700&q=80"
            alt="Our kitchen"
            className="rounded-3xl w-full h-[480px] object-cover shadow-card"
          />
          <img
            src="https://images.unsplash.com/photo-1542367597-8849eb950fd8?auto=format&fit=crop&w=900&h=700&q=80"
            alt="Fresh thali"
            className="rounded-3xl w-full h-[480px] object-cover shadow-card mt-10"
          />
        </div>

        <div className="mt-20 grid md:grid-cols-4 gap-6">
          {[
            { Icon: Heart, title: "Made with care", text: "Recipes refined over generations." },
            { Icon: ChefHat, title: "Skilled cooks", text: "Trained chefs lead every shift." },
            { Icon: Leaf, title: "Fresh always", text: "Daily-sourced produce and proteins." },
            { Icon: Truck, title: "Hot delivery", text: "Insulated packaging, 32-min average." },
          ].map(({ Icon, title, text }) => (
            <div key={title} className="bg-card border border-border/60 rounded-2xl p-6 shadow-soft">
              <Icon className="size-7 text-primary" />
              <h3 className="font-display text-xl mt-4">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <Link
            to="/menu"
            className="inline-flex bg-primary text-primary-foreground rounded-full px-8 py-3.5 font-medium text-sm hover:bg-primary/90 transition shadow-card"
          >
            Explore the menu
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
