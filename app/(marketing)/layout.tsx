/**
 * Marketing/landing layout — no sidebar, no top bar.
 * Used for the public landing page at /.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
