import Logo from "@/src/components/common/Logo/Logo";

import styles from "./Header.module.css";
import Link from "next/link";
import {clsx} from "clsx";
import {usePathname} from "next/navigation";
import ConnectButton from "@/src/components/common/ConnectButton/ConnectButton";
import LaunchAppButton from "@/src/components/common/LaunchAppButton/LaunchAppButton";
import DisconnectMobile from "@/src/components/common/ConnectButton/DisconnectMobile";
import {useIsConnected} from "@fuels/react";
import {
  BlogLink,
  FuelAppUrl,
  POINTS_LEARN_MORE_URL,
  POINTS_PROMO_TITLE,
} from "@/src/utils/constants";
import IconButton from "../IconButton/IconButton";
import CloseIcon from "../../icons/Close/CloseIcon";
import {useEffect, useState, useRef} from "react";
import PointsIcon from "../../icons/Points/PointsIcon";

type Props = {
  isHomePage?: boolean;
};

const PROMO_BANNER_STORAGE_KEY = "fuel-boost-program-promo-banner-closed";

const ISSERVER = typeof window === "undefined";

const Header = ({isHomePage}: Props) => {
  const pathname = usePathname();
  const getActiveIndexFromPath = (path: string) => {
    if (path === "/") return 0;
    if (path.includes("/liquidity")) return 1;
    if (path.includes("/points")) return 2;
    return 0;
  };

  const {isConnected} = useIsConnected();
  const [isPromoShown, setIsPromoShown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    getActiveIndexFromPath(pathname),
  );
  const [isManualUpdate, setIsManualUpdate] = useState(false);
  const navRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const currentPositionRef = useRef({left: 0, width: 0});

  useEffect(() => {
    if (!ISSERVER) {
      const bannerClosed = localStorage.getItem(PROMO_BANNER_STORAGE_KEY);
      setIsPromoShown(!bannerClosed);
    }
  }, []);

  const handleCloseBanner = () => {
    setIsPromoShown(false);
    localStorage.setItem(PROMO_BANNER_STORAGE_KEY, "true");
  };

  const navItems = ["Swap", "Liquidity", "Points"];

  useEffect(() => {
    setActiveIndex(getActiveIndexFromPath(pathname));
  }, [pathname]);

  useEffect(() => {
    const currentEl = navRefs.current[activeIndex];
    const indicator = indicatorRef.current;

    if (currentEl && indicator) {
      const {offsetLeft, offsetWidth} = currentEl;

      // Store the current position before updating
      const currentPos = currentPositionRef.current;

      if (isManualUpdate) {
        // Manual transition (user clicked)
        indicator.style.transition = "none";
        indicator.style.left = `${currentPos.left}px`;
        indicator.style.width = `${currentPos.width}px`;

        // Force reflow
        indicator.offsetHeight;

        currentPositionRef.current = {left: offsetLeft, width: offsetWidth};

        const distance = Math.abs(offsetLeft - currentPos.left);
        const duration = Math.min(0.3, Math.max(0.1, distance / 1000)); // between 0.1s to 0.4s

        requestAnimationFrame(() => {
          indicator.style.transition = `all ${duration}s ease`;
          indicator.style.left = `${offsetLeft}px`;
          indicator.style.width = `${offsetWidth}px`;
        });

        const handleTransitionEnd = () => {
          setIsManualUpdate(false);
          indicator.removeEventListener("transitionend", handleTransitionEnd);
        };

        indicator.addEventListener("transitionend", handleTransitionEnd);
      } else {
        // Passive update (e.g., route change from elsewhere)
        indicator.style.transition = "none";
        indicator.style.left = `${offsetLeft}px`;
        indicator.style.width = `${offsetWidth}px`;
        currentPositionRef.current = {left: offsetLeft, width: offsetWidth};
      }
    }
  }, [activeIndex, isManualUpdate]);

  const handleNavItemClick = (index: number) => {
    setActiveIndex(index);
    setIsManualUpdate(true);
  };

  const AnimatedNavLinks = () => {
    const getHref = (index: number) => {
      switch (index) {
        case 0:
          return "/";
        case 1:
          return "/liquidity";
        case 2:
          return "/points";
        default:
          return "/";
      }
    };

    return (
      <div className={styles.navContainer}>
        <div className={styles.navItems}>
          <div className={styles.navIndicator} ref={indicatorRef}></div>
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={getHref(index)}
              ref={(el) => {
                navRefs.current[index] = el;
              }}
              className={clsx(
                styles.navItem,
                `${activeIndex === index && styles.active}`,
              )}
              onClick={() => handleNavItemClick(index)}
            >
              {item}
            </Link>
          ))}
          <a
            href={`${FuelAppUrl}/bridge?from=eth&to=fuel&auto_close=true&=true`}
            className={styles.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            Bridge
          </a>
        </div>
      </div>
    );
  };

  const NavLinks = () => {
    return (
      <>
        <Link
          href="/"
          className={clsx(styles.link, pathname === "/" && styles.activeLink)}
        >
          Swap
        </Link>
        <Link
          href="/liquidity"
          className={clsx(
            styles.link,
            pathname.includes("/liquidity") && styles.activeLink,
          )}
        >
          Liquidity
        </Link>
        <Link
          href="/points"
          className={clsx(
            styles.link,
            pathname.includes("/points") && styles.activeLink,
          )}
        >
          Points
        </Link>
        <a
          href={`${FuelAppUrl}/bridge?from=eth&to=fuel&auto_close=true&=true`}
          className={styles.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          Bridge
        </a>
      </>
    );
  };

  return (
    <header className={styles.header}>
      {isPromoShown && (
        <section className={styles.promo}>
          <div className={styles.promo_text}>
            <PointsIcon />
            <p className="mc-type-l">
              {POINTS_PROMO_TITLE}
              <Link href={POINTS_LEARN_MORE_URL} target="_blank">
                <u>Learn More</u>
              </Link>
            </p>
          </div>
          <IconButton onClick={handleCloseBanner} className={styles.promoClose}>
            <CloseIcon />
          </IconButton>
        </section>
      )}
      <section className={styles.main}>
        <div className={styles.left}>
          <Logo />
        </div>

        <div className={clsx(styles.center)}>
          {/* <div className={clsx("mc-type-l", styles.links)}> */}
          <AnimatedNavLinks />
          {/* </div> */}
        </div>

        <div className={clsx(styles.right)}>
          {isHomePage && (
            <>
              <a
                href="https://docs.mira.ly"
                className={styles.link}
                target="_blank"
              >
                Docs
              </a>
              <a href={BlogLink} className={styles.link} target="_blank">
                Blog
              </a>
            </>
          )}
          {/* {!isHomePage && <TestnetLabel />} */}
          {!isHomePage && <ConnectButton className={styles.launchAppButton} />}
          {isHomePage && (
            <div className={styles.launchAppArea}>
              {isConnected ? (
                <ConnectButton className={styles.launchAppButton} />
              ) : (
                <LaunchAppButton className={styles.launchAppButton} />
              )}
            </div>
          )}
        </div>

        <div className={clsx("mobileOnly", styles.links)}>
          <DisconnectMobile className={styles.disconnectMobile} />
          {/*   <MobileMenu /> */}
        </div>
      </section>

      <div className={clsx("mobileOnly", styles.navMobile)}>
        <div className={clsx("mc-type-b", styles.links)}>
          <NavLinks />
        </div>
      </div>
    </header>
  );
};

export default Header;
