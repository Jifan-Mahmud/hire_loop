"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, MotionConfig } from "motion/react";

import {
  House,
  LayoutSideContent,
  Bell,
  Gear,
  Briefcase,
  LayoutCells,
  Magnifier,
  Bookmark,
  FileText,
  CreditCard,
  Persons,
} from "@gravity-ui/icons";

import { Button, Drawer } from "@heroui/react";
import { authClient } from "@/lib/auth-client";

/* --------------------------------------------------
   Navigation items
-------------------------------------------------- */

const adminNavItems = [
  {
    icon: LayoutCells,
    label: "Dashboard",
    href: "/deshboard/admin",
  },
  {
    icon: Persons,
    label: "Users",
    href: "/deshboard/admin/users",
  },
  {
    icon: LayoutSideContent,
    label: "Companies",
    href: "/deshboard/admin/companies",
  },
  {
    icon: Briefcase,
    label: "Jobs",
    href: "/deshboard/admin/jobs",
  },
  {
    icon: CreditCard,
    label: "Payments",
    href: "/deshboard/admin/payments",
  },
  {
    icon: Gear,
    label: "Settings",
    href: "/deshboard/admin/settings",
  },
];

const recruiterNavItems = [
  {
    icon: House,
    label: "Dashboard",
    href: "/deshboard/recruiter",
  },
  {
    icon: LayoutSideContent,
    label: "My Company",
    href: "/deshboard/recruiter/company",
  },
  {
    icon: Briefcase,
    label: "Jobs",
    href: "/deshboard/recruiter/jobs",
  },
  {
    icon: Briefcase,
    label: "Create Job",
    href: "/deshboard/recruiter/jobs/new",
  },
  {
    icon: Bell,
    label: "Applications",
    href: "/dashboard/applications",
  },
  {
    icon: Gear,
    label: "Settings",
    href: "/dashboard/settings",
  },
];

const seekerNavItems = [
  {
    icon: LayoutCells,
    label: "Dashboard",
    href: "/deshboard/seekers",
  },
  {
    icon: Magnifier,
    label: "Jobs",
    href: "/jobs",
  },
  {
    icon: Bookmark,
    label: "Saved Jobs",
    href: "/deshboard/seekers/saved-jobs",
  },
  {
    icon: FileText,
    label: "Applications",
    href: "/deshboard/seekers/applications",
  },
  {
    icon: CreditCard,
    label: "Billing",
    href: "/pricing",
  },
  {
    icon: Gear,
    label: "Settings",
    href: "/deshboard/seekers/settings",
  },
];

/* --------------------------------------------------
   Animation
-------------------------------------------------- */

const ease = [0.22, 1, 0.36, 1];

const listVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    x: -10,
  },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.35,
      ease,
    },
  },
};

/* --------------------------------------------------
   Logo
-------------------------------------------------- */

function Logo() {
  return (
    <Link
      href="/"
      className="inline-block text-[21px] font-bold tracking-tight"
    >
      <span className="text-white">Hire</span>
      <span className="text-white">Loop</span>
    </Link>
  );
}

/* --------------------------------------------------
   Seeker Portal Card (Matches reference design)
-------------------------------------------------- */

function SeekerProfileWidget() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const plan = user?.plan || "free";
  const tierLabel =
    plan === "premium"
      ? "Premium Tier"
      : plan === "pro"
      ? "Professional Tier"
      : "Free Tier";

  const initial = (user?.name || "Seeker").charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all">
      <div className="relative shrink-0">
        {user?.image ? (
          <img
            src={user.image}
            alt={user?.name || "Seeker"}
            className="size-10 rounded-full object-cover border border-white/10"
          />
        ) : (
          <div className="size-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white border border-white/10">
            {initial}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white truncate">
          Seeker Portal
        </p>
        <p className="text-[11px] font-normal text-neutral-400 truncate">
          {tierLabel}
        </p>
      </div>
    </div>
  );
}

/* --------------------------------------------------
   Recruiter User Card
-------------------------------------------------- */

function RecruiterUserCard() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const role = "Recruiter";
  const initial = (user?.name || "User").charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3 text-white border border-white/10">
      <div className="relative">
        {user?.image ? (
          <img
            src={user.image}
            alt={user?.name || "User"}
            className="size-11 rounded-full object-cover border border-white/10"
          />
        ) : (
          <div className="size-11 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-base font-semibold text-white border border-white/10">
            {initial}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold leading-tight text-white">
          {user?.name || "HireLoop Recruiter"}
        </p>
        <p className="truncate text-xs text-neutral-400">
          {role}
        </p>
      </div>
    </div>
  );
}

/* --------------------------------------------------
   Navigation List
-------------------------------------------------- */

function NavList({ id, roleType }) {
  const pathname = usePathname();
  const navItems =
    roleType === "admin"
      ? adminNavItems
      : roleType === "seeker"
      ? seekerNavItems
      : recruiterNavItems;

  const isActive = (href) => {
    if (
      href === "/deshboard/seekers" ||
      href === "/deshboard/recruiter" ||
      href === "/deshboard/admin"
    ) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <motion.nav
      variants={listVariants}
      initial="hidden"
      animate="show"
      className="flex w-full flex-col gap-1.5"
    >
      {navItems.map((item) => {
        const active = isActive(item.href);
        const Icon = item.icon;

        return (
          <motion.div key={item.href} variants={itemVariants} className="w-full">
            <Link
              href={item.href}
              className={`
                group relative flex h-10 w-full items-center justify-start gap-3 rounded-xl px-4 text-[13px] font-medium transition-all duration-200
                ${
                  active
                    ? "bg-white/[0.08] text-white shadow-sm"
                    : "text-white/40 hover:bg-white/[0.04] hover:text-white/80"
                }
              `}
            >
              {/* Active right bar */}
              {active && (
                <motion.span
                  layoutId={`${id}-active-bar`}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 32,
                  }}
                  className="absolute right-0 top-0 h-full w-[3px] rounded-l-sm bg-purple-500"
                />
              )}

              {/* Icon */}
              <Icon
                className={`size-[16px] shrink-0 transition-colors duration-200 ${
                  active ? "text-white" : "text-white/40 group-hover:text-white/80"
                }`}
              />

              {/* Label */}
              <span className="truncate">{item.label}</span>
            </Link>
          </motion.div>
        );
      })}
    </motion.nav>
  );
}

/* --------------------------------------------------
   Main Dashboard Sidebar Export
-------------------------------------------------- */

const DashboardSideBar = () => {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  // Determine current portal role
  const isAdmin =
    user?.role === "admin" ||
    pathname.startsWith("/deshboard/admin");
  const isRecruiter =
    !isAdmin &&
    (user?.role === "recruiter" || pathname.startsWith("/deshboard/recruiter"));
  const roleType = isAdmin ? "admin" : isRecruiter ? "recruiter" : "seeker";

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#0d0d11] text-white">
        {/* ==========================================
            Desktop Sidebar
        ========================================== */}
        <aside className="z-40 hidden w-[250px] flex-col border-r border-white/[0.08] bg-[#0d0d11] px-4 py-6 lg:flex sticky top-20 h-[calc(100vh-80px)] overflow-y-auto">
          {/* Logo area */}
          <div className="flex w-full flex-col px-2">
            <Logo />
            {isAdmin && (
              <span className="text-[11px] font-medium text-neutral-400 mt-0.5 tracking-wide">
                Admin Console
              </span>
            )}
          </div>

          {/* User Widget for Seeker & Recruiter */}
          {!isAdmin && (
            <div className="mt-6 w-full">
              {roleType === "seeker" ? <SeekerProfileWidget /> : <RecruiterUserCard />}
            </div>
          )}

          {/* Navigation */}
          <div className={`${isAdmin ? "mt-6" : "mt-7"} w-full`}>
            <NavList id="desktop" roleType={roleType} />
          </div>

          {/* Admin Bottom Profile Card (Matches Reference Image) */}
          {isAdmin && (
            <div className="mt-auto pt-4 border-t border-white/[0.08] px-2 flex items-center gap-3">
              <div className="size-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden border border-white/10">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user?.name || "Admin"}
                    className="size-full object-cover"
                  />
                ) : (
                  (user?.name || "Alex Rivera")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.name || "Alex Rivera"}
                </p>
                <p className="text-[11px] text-neutral-400 truncate">System Admin</p>
              </div>
            </div>
          )}
        </aside>

        {/* ==========================================
            Mobile / Tablet Drawer
        ========================================== */}
        <div className="fixed left-0 top-20 z-50 p-4 lg:hidden">
          <Drawer>
            <Button
              variant="secondary"
              className="h-10 border border-white/10 bg-[#171717] px-3 text-[13px] text-white"
            >
              <LayoutSideContent className="size-4" />
              <span>Menu</span>
            </Button>

            <Drawer.Backdrop>
              <Drawer.Content placement="left">
                <Drawer.Dialog className="w-[260px] border-r border-white/10 bg-[#0d0d11] text-white">
                  <Drawer.CloseTrigger />

                  <Drawer.Header className="flex flex-col justify-start px-5 py-6">
                    <Drawer.Heading className="sr-only">
                      Navigation
                    </Drawer.Heading>
                    <Logo />
                    {isAdmin && (
                      <span className="text-[11px] font-medium text-neutral-400 mt-0.5 tracking-wide">
                        Admin Console
                      </span>
                    )}
                  </Drawer.Header>

                  <Drawer.Body className="px-4 flex flex-col h-full">
                    {!isAdmin && (
                      <div className="mb-7">
                        {roleType === "seeker" ? (
                          <SeekerProfileWidget />
                        ) : (
                          <RecruiterUserCard />
                        )}
                      </div>
                    )}

                    <NavList id="mobile" roleType={roleType} />

                    {isAdmin && (
                      <div className="mt-auto pt-4 border-t border-white/[0.08] px-2 flex items-center gap-3">
                        <div className="size-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden">
                          {user?.image ? (
                            <img
                              src={user.image}
                              alt={user?.name || "Admin"}
                              className="size-full object-cover"
                            />
                          ) : (
                            "AR"
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white truncate">
                            {user?.name || "Alex Rivera"}
                          </p>
                          <p className="text-[11px] text-neutral-400 truncate">System Admin</p>
                        </div>
                      </div>
                    )}
                  </Drawer.Body>
                </Drawer.Dialog>
              </Drawer.Content>
            </Drawer.Backdrop>
          </Drawer>
        </div>
      </div>
    </MotionConfig>
  );
};

export default DashboardSideBar;
