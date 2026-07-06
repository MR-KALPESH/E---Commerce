"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useCart } from "@/hooks/useCart";
import { menuData } from "./menuData";
import MobileMenu from "./MobileMenu";
import DesktopMenu from "./DesktopMenu";
import {
  SearchIcon,
  UserIcon,
  HeartIcon,
  CartIcon,
  MenuIcon,
  CloseIcon,
} from "./icons";
import { HeaderSetting } from "@prisma/client";
import { useAppSelector } from "@/redux/store";
import { useSession, signOut } from "next-auth/react";
import SearchModal from "./SearchModal";

type IProps = {
  headerData?: HeaderSetting | null;
};

const MainHeader = ({ headerData }: IProps) => {
  const { data: session } = useSession();
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const { handleCartClick, cartCount, totalPrice } = useCart();
  const wishlistCount = useAppSelector((state) => state.wishlistReducer).items
    ?.length;

  const handleOpenCartModal = () => {
    handleCartClick();
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownOpen &&
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropdownOpen]);

  // Sticky menu
  const handleStickyMenu = () => {
    if (window.scrollY >= 80) {
      setStickyMenu(true);
    } else {
      setStickyMenu(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleStickyMenu);
    return () => {
      window.removeEventListener("scroll", handleStickyMenu);
    };
  }, []);

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setNavigationOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <header
        className={`fixed left-0 top-0 w-full z-50 bg-white transition-all  ease-in-out duration-300 ${stickyMenu && "shadow-sm"
          }`}
      >


        {/* Main Header */}
        <div className="px-4 mx-auto max-w-7xl sm:px-6 xl:px-0">
          <div className="flex items-center justify-between py-4 xl:py-0">
            {/* Logo */}
            <div>
              <Link className="block py-2 shrink-0" href="/">
                <div className="flex items-center gap-1">
                  <Image
                    src={headerData?.headerLogo || "/images/logo/logo.svg"}
                    alt="Logo"
                    width={148}
                    height={36}
                    priority
                  />
                </div>
              </Link>
            </div>

            {/* Desktop Menu - Hidden on mobile */}
            <div className="hidden xl:block">
              <DesktopMenu menuData={menuData} stickyMenu={stickyMenu} />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                className="transition hover:text-blue focus:outline-none"
                onClick={() => setSearchModalOpen(true)}
                aria-label="Search"
              >
                <SearchIcon />
              </button>

              <div className="relative" ref={profileDropdownRef}>
                <button
                  className="transition hover:text-blue focus:outline-none flex items-center"
                  onClick={() => {
                    if (session) {
                      setProfileDropdownOpen(!profileDropdownOpen);
                    } else {
                      window.location.href = "/auth/signin";
                    }
                  }}
                  aria-label="Account"
                >
                  {session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt="Profile"
                      width={22}
                      height={22}
                      className="rounded-full border border-gray-3 hover:border-blue transition-colors"
                    />
                  ) : (
                    <UserIcon />
                  )}
                </button>

                {session && profileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-3 rounded-xl shadow-lg py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-gray-3">
                      <p className="text-[10px] text-dark-4 font-semibold uppercase tracking-wider">Signed in as</p>
                      <p className="text-xs font-bold text-dark truncate mt-0.5">{session.user?.name || session.user?.email}</p>
                    </div>

                    {session.user?.email === "admin@cozycommerce.com" && (
                      <Link
                        href="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="block px-4 py-2 text-xs font-semibold text-dark-2 hover:bg-gray-1 hover:text-blue transition-colors"
                      >
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      href="/my-orders"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="block px-4 py-2 text-xs font-semibold text-dark-2 hover:bg-gray-1 hover:text-blue transition-colors"
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/order-tracking"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="block px-4 py-2 text-xs font-semibold text-dark-2 hover:bg-gray-1 hover:text-blue transition-colors"
                    >
                      Track Order
                    </Link>

                    <div className="border-t border-gray-3 my-1" />

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-red hover:bg-red-light-6 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>

              <Link
                href="/wishlist"
                className="relative text-gray-700 transition hover:text-blue focus:outline-none"
                aria-label="Wishlist"
              >
                <HeartIcon />
                <span className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] text-white bg-red-600 text-[10px] font-normal rounded-full inline-flex items-center justify-center">
                  {wishlistCount}
                </span>
              </Link>

              <button
                className="relative text-gray-700 transition hover:text-blue focus:outline-none"
                onClick={handleOpenCartModal}
                aria-label="Cart"
              >
                <CartIcon />
                <span className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] text-white bg-red-600 text-[10px] font-normal rounded-full inline-flex items-center justify-center">
                  {cartCount || 0}
                </span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                className="transition xl:hidden focus:outline-none"
                onClick={() => setNavigationOpen(!navigationOpen)}
                aria-label={navigationOpen ? "Close menu" : "Open menu"}
              >
                {navigationOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Offcanvas */}

      <MobileMenu
        headerLogo={headerData?.headerLogo || null}
        isOpen={navigationOpen}
        onClose={() => setNavigationOpen(false)}
        menuData={menuData}
      />

      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </>
  );
};

export default MainHeader;
