import InfoPageShell from "../../components/marketing/InfoPageShell";
import { HighlightGrid, SectionCards } from "../../components/marketing/InfoContentBlocks";
import { websiteInfoContent } from "../../lib/info-page-content";

export default function RefundPolicyPage() {
  const content = websiteInfoContent.refund;

  return (
    <InfoPageShell
      eyebrow="Refund Policy"
      title="Refunds depend on coupon validity and dispute findings."
      description="CouponX uses protected payment flows. If a coupon fails and the buyer provides valid evidence, the case can be reviewed for refund."
    >
      <HighlightGrid items={content.highlights} />
      <SectionCards sections={content.sections} />
    </InfoPageShell>
  );
}
