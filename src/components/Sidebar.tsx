// components/sidebar/Sidebar.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  children: React.ReactNode;
}

interface SidebarItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Home",
    href: "/",
    icon: "🏠",
  },
  {
    title: "All Content",
    href: "/content",
    icon: "📰",
  },
  {
    title: "Our Writers",
    href: "/content?filter=internal",
    icon: "✍️",
  },
  {
    title: "News Sources",
    href: "/content?filter=external",
    icon: "🌐",
  },
  {
    title: "Categories",
    href: "/categories",
    icon: "📂",
  },
  {
    title: "About",
    href: "/about",
    icon: "ℹ️",
  },
];

export function Sidebar({ children }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed left-4 top-4 z-50 md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <MobileSidebarContent
            pathname={pathname}
            onItemClick={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 border-r bg-background fixed left-0 top-0 h-screen">
        <DesktopSidebarContent pathname={pathname} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

function DesktopSidebarContent({ pathname }: { pathname: string }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold">NewsHub</h1>
        <p className="text-sm text-muted-foreground">Your content dashboard</p>
      </div>

      <ScrollArea className="flex-1">
        <nav className="p-4">
          <div className="space-y-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
                  pathname === item.href.split("?")[0]
                    ? "bg-accent font-medium"
                    : "text-muted-foreground"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.title}
              </Link>
            ))}
          </div>
        </nav>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground">Powered by NewsAPI</div>
      </div>
    </div>
  );
}

function MobileSidebarContent({
  pathname,
  onItemClick,
}: {
  pathname: string;
  onItemClick: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold">NewsHub</h1>
        <p className="text-sm text-muted-foreground">Your content dashboard</p>
      </div>

      <ScrollArea className="flex-1">
        <nav className="p-4">
          <div className="space-y-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onItemClick}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
                  pathname === item.href.split("?")[0]
                    ? "bg-accent font-medium"
                    : "text-muted-foreground"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.title}
              </Link>
            ))}
          </div>
        </nav>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground">Powered by NewsAPI</div>
      </div>
    </div>
  );
}
