"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaChartPie,
  FaCogs,
  FaTags,
  FaUsers,
  FaBullhorn,
  FaArrowLeft,
  FaShieldAlt,
  FaCalculator,
} from "react-icons/fa";

const ADMIN_NAV = [
  { name: "Overview", path: "/admin", icon: FaChartPie },
  { name: "System Settings", path: "/admin/settings", icon: FaCogs },
  { name: "Plans & Subscriptions", path: "/admin/plans", icon: FaTags },
  { name: "Profit Calculator", path: "/admin/calculator", icon: FaCalculator },
  { name: "User Management", path: "/admin/users", icon: FaUsers },
  { name: "Communication", path: "/admin/communication", icon: FaBullhorn },
];

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin");
    } else if (status === "authenticated") {
      if (session.user.role !== "admin") {
        router.push("/");
      } else {
        setAuthorized(true);
      }
    }
  }, [status, session]);

  if (status === "loading" || !authorized) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <FaShieldAlt className="text-primary text-4xl mb-3 animate-pulse" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
          Verifying Admin Access...
        </h2>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row w-full h-full overflow-hidden">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-glass-bg border-b md:border-b-0 md:border-r border-glass-border flex flex-col shrink-0">
        <div className="p-4 border-b border-glass-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-black uppercase tracking-widest text-foreground">
              Admin Console
            </span>
          </div>
          <Link
            href="/"
            className="text-xs text-muted hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <FaArrowLeft size={10} /> App
          </Link>
        </div>

        <nav className="p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-muted hover:bg-glass-hover hover:text-foreground"
                }`}
              >
                <Icon size={13} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-4 border-t border-glass-border hidden md:block">
          <div className="p-2.5 rounded-lg bg-glass-hover/50 border border-glass-border text-[11px] text-secondary-text">
            <p className="font-bold text-foreground truncate">{session.user.name || "Admin"}</p>
            <p className="truncate text-muted">{session.user.email}</p>
            <span className="inline-block mt-1 bg-primary/20 text-primary text-[9px] font-black uppercase px-2 py-0.5 rounded">
              Super Admin
            </span>
          </div>
        </div>
      </aside>

      {/* Admin Main Content View */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 bg-transparent">
        {children}
      </main>
    </div>
  );
}
