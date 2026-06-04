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

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${manrope.variable} ${spaceGrotesk.variable}`}>
      <body>
        <Providers>
          <RouteChrome>{children}</RouteChrome>
        </Providers>
      </body>
    </html>
  );
}
