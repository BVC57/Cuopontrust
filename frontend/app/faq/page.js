import InfoPageShell from "../../components/marketing/InfoPageShell";
import { FaqCards, HighlightGrid } from "../../components/marketing/InfoContentBlocks";
import { websiteInfoContent } from "../../lib/info-page-content";

export default function FaqPage() {
  const content = websiteInfoContent.faq;

  return (
    <InfoPageShell
      eyebrow="FAQ"
      title="Answers to common buyer and seller questions."
      description="Understand how listing, verification, disputes, payments, and support work on CouponX."
    >
      <HighlightGrid items={content.highlights} />
      <FaqCards items={content.faqs} />
    </InfoPageShell>
  );
}
