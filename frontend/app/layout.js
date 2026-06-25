import { Manrope, Space_Grotesk } from "next/font/google";
import "./../styles/globals.css";
import Providers from "./providers";
import RouteChrome from "../components/RouteChrome";
import { marketingContent } from "../lib/marketingContent";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata = {
  title: "CouponX - India's Trusted Coupon Buy & Sell Marketplace",
  description: marketingContent.heroSubheading,
  keywords: [
    "coupon marketplace India",
    "buy coupons online India",
    "sell unused coupons online",
    "verified coupons India",
    "discount coupon marketplace",
    "promo code marketplace",
    "gift voucher marketplace India",
    "buy discount vouchers",
    "sell gift vouchers",
    "Flipkart coupons",
    "Amazon coupons",
    "Zomato coupons",
    "Swiggy coupons",
    "best coupon website India",
    "CouponX"
  ],
  openGraph: {
    title: "CouponX - India's Trusted Coupon Buy & Sell Marketplace",
    description: marketingContent.heroSubheading,
    type: "website",
    locale: "en_IN",
    siteName: "CouponX"
  },
  twitter: {
    card: "summary_large_image",
    title: "CouponX - India's Trusted Coupon Buy & Sell Marketplace",
    description: marketingContent.heroSubheading
  },
  category: "shopping"
};

const adminThemeBootstrap = `
  (() => {
    try {
      const storedTheme = window.localStorage.getItem("couponx_admin_theme");
      const nextTheme = storedTheme === "dark" || storedTheme === "light" ? storedTheme : "light";
      document.documentElement.setAttribute("data-admin-theme", nextTheme);
    } catch {
      document.documentElement.setAttribute("data-admin-theme", "light");
    }
  })();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${manrope.variable} ${spaceGrotesk.variable}`} data-admin-theme="light">
      <body>
        <script dangerouslySetInnerHTML={{ __html: adminThemeBootstrap }} />
        <Providers>
          <RouteChrome>{children}</RouteChrome>
        </Providers>
      </body>
    </html>
  );
}
