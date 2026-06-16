import InfoPageShell from "../../components/marketing/InfoPageShell";
import { FaqCards, HighlightGrid, SectionCards } from "../../components/marketing/InfoContentBlocks";
import { websiteInfoContent } from "../../lib/info-page-content";
import { marketingContent } from "../../lib/marketingContent";

export default function AboutUsPage() {
  const content = websiteInfoContent.about;

  return (
    <InfoPageShell
      eyebrow="About CouponX"
      title={marketingContent.heroHeadline}
      description={marketingContent.aboutDescription}
      ctaHref="/contact-us"
      ctaLabel="Contact our team"
    >
      <HighlightGrid items={content.highlights} />
      <SectionCards sections={content.sections} />
      <FaqCards items={content.faqs} />
    </InfoPageShell>
  );
}
