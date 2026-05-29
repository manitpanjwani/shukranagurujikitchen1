import { Link } from "@tanstack/react-router";
import { Instagram, Phone, MapPin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-background mt-24">
      <div className="container-wide py-16 grid md:grid-cols-4 gap-10">
        <div>
          <div className="font-display text-2xl">
            Shukrana <span className="text-primary">Guruji</span>
          </div>
          <div className="text-[10px] tracking-[0.3em] uppercase opacity-70">Kitchen</div>
          <p className="mt-4 text-sm opacity-80 max-w-xs">
            Premium multi-cuisine cloud kitchen. Slow-cooked, soulfully served — delivered hot
            across Pune.
          </p>
        </div>

        <div>
          <h4 className="font-display text-lg mb-4">Explore</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link to="/" className="hover:text-primary">Home</Link></li>
            <li><Link to="/menu" className="hover:text-primary">Menu</Link></li>
            <li><Link to="/about" className="hover:text-primary">About</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg mb-4">Delivering in</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li>Kharadi</li>
            <li>Viman Nagar</li>
            <li>Wagholi</li>
            <li>Hadapsar</li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg mb-4">Reach us</h4>
          <ul className="space-y-3 text-sm opacity-80">
            <li className="flex items-center gap-2"><Phone className="size-4" /> +91 90000 00000</li>
            <li className="flex items-center gap-2"><Mail className="size-4" /> hello@shukranaguruji.com</li>
            <li className="flex items-start gap-2"><MapPin className="size-4 mt-0.5" /> Kharadi, Pune 411014</li>
            <li className="flex items-center gap-2"><Instagram className="size-4" /> @shukranagurujikitchen</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-background/10">
        <div className="container-wide py-5 text-xs opacity-70 flex flex-wrap justify-between gap-3">
          <span>© {new Date().getFullYear()} Shukrana Guruji Kitchen. All rights reserved.</span>
          <Link to="/admin/login" className="hover:text-primary">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
