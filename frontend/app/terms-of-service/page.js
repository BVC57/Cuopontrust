import InfoPageShell from "../../components/marketing/InfoPageShell";
import { HighlightGrid, SectionCards } from "../../components/marketing/InfoContentBlocks";
import { websiteInfoContent } from "../../lib/info-page-content";

export default function TermsOfServicePage() {
  const content = websiteInfoContent.terms;

  return (
    <InfoPageShell
      eyebrow="Terms of Service"
      title="Rules for using CouponX fairly and safely."
      description="By using CouponX, you agree to submit valid coupons, avoid deceptive listings, and follow the platform rules for payments, disputes, and withdrawals."
    >
      <HighlightGrid items={content.highlights} />
      <SectionCards sections={content.sections} />
    </InfoPageShell>
  );
}
