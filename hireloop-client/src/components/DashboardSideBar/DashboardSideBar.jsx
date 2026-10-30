"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, MotionConfig } from "motion/react";

import {
  House,
  LayoutSideContent,
  Bell,
  Gear,
  Briefcase,
} from "@gravity-ui/icons";

import { Button, Drawer } from "@heroui/react";

import { authClient } from "@/lib/auth-client";

/* --------------------------------------------------
   Navigation items
-------------------------------------------------- */

const navItems = [
  {
    icon: House,
    label: "Dashboard",
    href: "/deshboard/recruiter",
  },
  {
    icon: LayoutSideContent,
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
   Navigation
-------------------------------------------------- */

function NavList({ id }) {
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === "/dashboard") {
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
          <motion.div
            key={item.href}
            variants={itemVariants}
            className="w-full"
          >
            <Link
              href={item.href}
              className={`
                group relative flex h-10 w-full
                items-center
                justify-start
                gap-3
                rounded-sm
                px-4
                text-[13px]
                font-normal
                transition-all
                duration-200

                ${
                  active
                    ? "bg-white/[0.08] text-white"
                    : "text-white/40 hover:bg-white/[0.04] hover:text-white/70"
                }
              `}
            >
              {/* Active right border */}
              {active && (
                <motion.span
                  layoutId={`${id}-active-bar`}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 32,
                  }}
                  className="
                    absolute
                    right-0
                    top-0
                    h-full
                    w-[3px]
                    rounded-l-sm
                    bg-white
                  "
                />
              )}

              {/* Icon */}
              <Icon
                className={`
                  relative
                  z-10
                  size-[16px]
                  shrink-0
                  transition-colors
                  duration-200

                  ${
                    active
                      ? "text-white"
                      : "text-white/40 group-hover:text-white/70"
                  }
                `}
              />

              {/* Label */}
              <span className="relative z-10 truncate">
                {item.label}
              </span>
            </Link>
          </motion.div>
        );
      })}
    </motion.nav>
  );
}

/* --------------------------------------------------
   User Profile
-------------------------------------------------- */

function UserCard() {
  const router = useRouter();

  const { data: session } = authClient.useSession();

  const name = session?.user?.name || "Your account";

  const role =
    session?.user?.role === "recruiter"
      ? "Recruiter"
      : "Job Seeker";

  const avatar =
    session?.user?.image ||
    session?.user?.avatar ||
    null;

  const initial = name
    .trim()
    .charAt(0)
    .toUpperCase();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/signin");
        },
      },
    });
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: 0.35,
        duration: 0.4,
        ease,
      }}
      className="flex w-full flex-col items-center px-2"
    >
      {/* Profile */}
      <div className="flex w-full flex-col items-center text-center">
        {/* Avatar */}
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="
              h-11
              w-11
              shrink-0
              rounded-full
              object-cover
              ring-1
              ring-white/10
            "
          />
        ) : (
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-gradient-to-br
              from-indigo-500
              to-purple-500
              text-[13px]
              font-semibold
              text-white
            "
          >
            {initial}
          </div>
        )}

        {/* Name */}
        <p
          className="
            mt-2.5
            max-w-full
            truncate
            px-2
            text-[13px]
            font-medium
            leading-tight
            text-white
          "
        >
          {name}
        </p>

        {/* Role */}
        <p
          className="
            mt-1
            text-[10px]
            font-normal
            leading-none
            text-white/40
          "
        >
          {role}
        </p>
      </div>

      {/* Premium badge */}
      <div className="mt-2.5">
        <span
          className="
            inline-flex
            items-center
            justify-center
            rounded-[2px]
            border
            border-white/20
            bg-white/[0.08]
            px-2
            py-1
            text-[8px]
            font-medium
            uppercase
            tracking-wide
            text-white/70
          "
        >
          Premium Account
        </span>
      </div>
    </motion.div>
  );
}

/* --------------------------------------------------
   Sidebar
-------------------------------------------------- */

const DashboardSideBar = () => {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#111111] text-white">

        {/* ==========================================
            Desktop Sidebar
        ========================================== */}

        <aside
          className="
            z-40
            hidden
            w-[260px]
            flex-col
            border-r
            border-white/[0.08]
            bg-[#111111]
            px-4
            py-6
            lg:flex
          "
        >
          {/* Logo */}
          <div className="flex w-full justify-center">
            <Logo />
          </div>

          {/* User */}
          <div className="mt-7">
            <UserCard />
          </div>

          {/* Navigation */}
          <div className="mt-9 w-full">
            <NavList id="desktop" />
          </div>
        </aside>

        {/* ==========================================
            Mobile / Tablet
        ========================================== */}

        <div className="fixed left-0 top-0 z-50 p-4 lg:hidden">
          <Drawer>
            <Button
              variant="secondary"
              className="
                h-10
                border
                border-white/10
                bg-[#171717]
                px-3
                text-[13px]
                text-white
              "
            >
              <LayoutSideContent className="size-4" />
              <span>Menu</span>
            </Button>

            <Drawer.Backdrop>
              <Drawer.Content placement="left">
                <Drawer.Dialog
                  className="
                    w-[260px]
                    border-r
                    border-white/10
                    bg-[#111111]
                    text-white
                  "
                >
                  <Drawer.CloseTrigger />

                  <Drawer.Header
                    className="
                      flex
                      justify-center
                      px-5
                      py-6
                    "
                  >
                    <Drawer.Heading className="sr-only">
                      Navigation
                    </Drawer.Heading>

                    <Logo />
                  </Drawer.Header>

                  <Drawer.Body className="px-4">
                    {/* User */}
                    <div className="mb-9">
                      <UserCard />
                    </div>

                    {/* Navigation */}
                    <NavList id="mobile" />
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