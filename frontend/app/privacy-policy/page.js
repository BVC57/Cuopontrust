import InfoPageShell from "../../components/marketing/InfoPageShell";
import { HighlightGrid, SectionCards } from "../../components/marketing/InfoContentBlocks";
import { websiteInfoContent } from "../../lib/info-page-content";

export default function PrivacyPolicyPage() {
  const content = websiteInfoContent.privacy;

  return (
    <InfoPageShell
      eyebrow="Privacy Policy"
      title="We keep personal data limited, useful, and protected."
      description="CouponX collects only the information needed to operate the marketplace, verify accounts, process transactions, and handle disputes."
    >
      <HighlightGrid items={content.highlights} />
      <SectionCards sections={content.sections} />
    </InfoPageShell>
  );
}
