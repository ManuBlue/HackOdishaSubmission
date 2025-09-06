"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface NavBarProps {
  items: NavItem[];
  className?: string;
}

export function NavBar({ items, className }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0].name);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={cn(
        "justify-between px-7 mx-full w-full fixed bottom-0 sm:top-0 left-1/2 -translate-x-1/2 z-50 mb-6 sm:pt-6 ",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>AI Security Guard</div>
        <div className="flex items-center gap-3 bg-background/5 border border-border backdrop-blur-lg py-1 px-1 rounded-full shadow-lg">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;

            return (
              <div
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name);
                  navigate(item.url);
                }}
                className={cn(
                  "flex items-center gap-2 cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors",
                  "text-foreground/80 hover:text-primary",
                  isActive && "bg-muted text-primary"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </div>
            );
          })}
        </div>
        <Button onClick={() => navigate("/")}>Logout</Button>
      </div>
    </div>
  );
}
