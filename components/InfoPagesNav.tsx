"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Info, Heart, Shield, Users } from "lucide-react";

const navItems = [
  {
    href: "/about",
    label: "What's This?",
    icon: Info,
    description: "About Survival Pending"
  },
  {
    href: "/why",
    label: "The Power of Being Witnessed",
    icon: Heart,
    description: "Why your story matters"
  },
  {
    href: "/how",
    label: "Safety by Design",
    icon: Shield,
    description: "How we protect you"
  },
  {
    href: "/community",
    label: "Building Our Archive",
    icon: Users,
    description: "Join the movement"
  }
];

export function InfoPagesNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:block w-64 flex-shrink-0">
      <div className="sticky top-[120px]">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-start gap-3 rounded-lg px-3 py-3 transition-all",
                  "hover:bg-gray-100 dark:hover:bg-gray-800",
                  isActive && "bg-gray-100 dark:bg-gray-800"
                )}
              >
                <Icon 
                  className={cn(
                    "h-5 w-5 mt-0.5 flex-shrink-0 transition-colors",
                    isActive 
                      ? "text-gray-900 dark:text-gray-100" 
                      : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                  )} 
                />
                <div className="space-y-1">
                  <p 
                    className={cn(
                      "text-sm font-medium leading-tight transition-colors",
                      isActive 
                        ? "text-gray-900 dark:text-gray-100" 
                        : "text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100"
                    )}
                  >
                    {item.label}
                  </p>
                  <p 
                    className={cn(
                      "text-xs leading-tight transition-colors",
                      isActive
                        ? "text-gray-600 dark:text-gray-400"
                        : "text-gray-500 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400"
                    )}
                  >
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}