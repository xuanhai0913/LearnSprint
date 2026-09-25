import { z } from 'zod';

const usageSchema = z.object({
  input: z.object({ speechTokens: z.number().int().nonnegative().max(1e9), textTokens: z.number().int().nonnegative().max(1e9) }),
  output: z.object({ speechTokens: z.number().int().nonnegative().max(1e9), textTokens: z.number().int().nonnegative().max(1e9) }),
});
export type SonicUsage = z.infer<typeof usageSchema>;
export function parseUsage(input: unknown): SonicUsage | null {
  const parsed = usageSchema.safeParse(input);
  return parsed.success ? parsed.data : null;
}
export function estimateVoiceUsd(usage: SonicUsage): number {
  // Public us-east-1 on-demand token rates, reviewed 2026-09-23; not an invoice.
  return (usage.input.speechTokens * 3 + usage.input.textTokens * .33 + usage.output.speechTokens * 12 + usage.output.textTokens * 2.75) / 1_000_000;
}

