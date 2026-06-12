import { Manrope, Space_Grotesk } from "next/font/google";
import "./../styles/globals.css";
import Providers from "./providers";
import RouteChrome from "../components/RouteChrome";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata = {
  title: "CouponX",
  description: "Buy verified coupons, sell unused deals, and manage payments with a trusted coupon marketplace."
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
