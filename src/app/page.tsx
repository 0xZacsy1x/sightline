import {
  CapabilitiesSection,
  HowItWorksSection,
  NetworksSection,
  VerdictExplainerSection,
} from "@/components/home/home-sections";
import { OmniScanner } from "@/components/scanner/omni-scanner";

/** UI-REFERENCE.md §3 — Scanner homepage. */
export default function ScannerPage() {
  return (
    <>
      <OmniScanner />
      <CapabilitiesSection />
      <HowItWorksSection />
      <NetworksSection />
      <VerdictExplainerSection />
    </>
  );
}
