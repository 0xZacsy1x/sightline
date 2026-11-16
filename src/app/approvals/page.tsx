import type { Metadata } from "next";

import { ApprovalsInspector } from "@/components/approvals/approvals-inspector";
import { NumberedItem, SplitExplainer } from "@/components/blueprint/layouts";
import { InlineCode } from "@/components/blueprint/primitives";
import { Section, SectionLabel } from "@/components/blueprint/section";

export const metadata: Metadata = {
  title: "Approval Inspector",
  description: "Review the token permissions your wallet has granted.",
};

/** UI-REFERENCE.md §4 */
export default function ApprovalsPage() {
  return (
    <>
      <ApprovalsInspector />

      {/* §4.4 mini guide */}
      <Section>
        <div className="flex flex-col gap-8">
          <SectionLabel>MINI GUIDE</SectionLabel>
          <SplitExplainer
            heading={
              <>
                Why unlimited <span className="font-mono text-verdict-risk">approve()</span> allowances are dangerous.
              </>
            }
            description="An approval lets a contract move your tokens later, without asking again. Unlimited approvals are convenient — and they stay open until you revoke them."
          >
            <NumberedItem index={1} title="You sign one approval">
              A dApp asks you to call <InlineCode>approve(spender, 2^256 − 1)</InlineCode> so you never have to approve
              again. Your wallet shows it as a harmless-looking permission.
            </NumberedItem>
            <NumberedItem index={2} title="The allowance never expires">
              That spender can call <InlineCode>transferFrom()</InlineCode> on your tokens at any time — months later,
              for your full balance, including tokens you receive after approving.
            </NumberedItem>
            <NumberedItem index={3} title="One compromise drains everything">
              If the spender is malicious, upgraded, or hacked, it can empty that token from your wallet. Revoke
              allowances you no longer use, and prefer exact amounts over unlimited.
            </NumberedItem>
          </SplitExplainer>
        </div>
      </Section>
    </>
  );
}
