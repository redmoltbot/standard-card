"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, CreditCard, Search, Bell } from "lucide-react";

const TABS = [
  { label: "Home",      route: "/home",      icon: Home },
  { label: "Customers", route: "/customers", icon: Users },
  { label: "Cards",     route: "/cards",     icon: CreditCard },
  { label: "Find",      route: "/find",      icon: Search },
  { label: "Push",      route: "/push",      icon: Bell },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-30">
      <div className="flex">
        {TABS.map((tab) => {
          const active = pathname === tab.route;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.route}
              href={tab.route}
              className={`flex-1 flex flex-col items-center py-3 transition-colors ${
                active
                  ? "text-[var(--clr-primary)] border-t-2 border-[var(--clr-primary)] -mt-px"
                  : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1 font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
