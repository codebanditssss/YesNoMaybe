"use client";
import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconMenu2, IconX } from "@tabler/icons-react";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLAnchorElement>) => void;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        "h-full px-4 py-6 hidden lg:flex lg:flex-col bg-white dark:bg-neutral-900 w-[300px] shrink-0 border-r dark:border-neutral-800",
        className
      )}
      animate={{
        width: animate ? (open ? "300px" : "72px") : "300px",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className={cn(
              "fixed inset-0 z-50 flex h-full w-full flex-col bg-white lg:hidden dark:bg-neutral-900",
              className
            )}
            {...props}
          >
            <div className="flex h-16 items-center justify-between px-4 border-b dark:border-neutral-800">
              <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Menu</div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-neutral-100 dark:ring-offset-neutral-950 dark:focus:ring-neutral-800 dark:data-[state=open]:bg-neutral-800"
              >
                <IconX className="h-6 w-6" />
                <span className="sr-only">Close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4 px-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  variant = "default",
  ...props
}: {
  link: Links & { onClick?: (e?: React.MouseEvent<HTMLAnchorElement>) => void };
  className?: string;
  variant?: "default" | "brand" | "muted" | "danger";
}) => {
  const { open, animate } = useSidebar();
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (link.onClick) {
      link.onClick(e);
    }
  };

  const variants = {
    default: "text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/50",
    brand: "text-neutral-900 dark:text-white font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800/50",
    muted: "text-neutral-400 dark:text-neutral-500 text-xs font-medium tracking-wider hover:bg-transparent dark:hover:bg-transparent",
    danger: "text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
  };

  return (
    <a
      href={link.href}
      className={cn(
        "flex items-center justify-start gap-3 group/sidebar py-2 px-3 rounded-lg transition-all duration-200",
        variants[variant],
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {link.icon}

      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </a>
  );
};
