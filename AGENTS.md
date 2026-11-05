<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep ordering state in the root CartProvider and persist submitted demonstration orders in Cloud; carts are session-scoped and checkout totals are recomputed server-side.
- Protect management with the authenticated route layout and database admin roles; account registration creates profiles but never grants administrative privileges.
- Use validated server functions for administration and checkout; public catalog reads use the publishable client and media uploads remain in private Cloud storage.
- Every price, availability and feature toggle (shared carts, dine-in, loyalty) is re-checked inside server functions; browser values are display-only because the frontend is untrusted.
- Pure business rules (pricing, bill split, customer stats) live in src/lib/pizza.ts so a future database swap only touches the server-function files.
- Operational configuration and club administration use validated operations server functions; platform contract edits require a separate operator allowlist so restaurant roles cannot negotiate platform fees.
- Club credit consumption and order insertion are atomic database operations; demo memberships never authorize real-order benefits or contribute to platform remuneration.
- Automatic printing uses a server-owned queue claimed once per device and the kitchen browser's silent-print setup; interrupted jobs require reconciliation rather than automatic duplicate retries.
- Review submission requires a separate order capability token and delivered status; only directors read review contents and aggregates.

- Dining bills are scoped to immutable dining sessions; closure locks the table, verifies the displayed subtotal and rotates its session atomically.
- Service reviews require an order capability and a requested or closed dining session; aggregate one private review per session for directors only.
- FH Foods is the platform brand and public establishment identity comes from validated store settings.
- This edition uses an isolated app and Cloud instance per subscribing establishment; do not onboard unrelated establishments into this instance because existing roles and catalog are instance-global. Shared multi-tenant hosting requires a separate tenant-isolation migration across every data path before onboarding.
- License enforcement uses shared server-function middleware plus restrictive database policies, RPC guards and write triggers; billing/auth/legal routes remain available while operations are blocked.
- Only platform operators can change licenses through an audited atomic RPC; restaurant director roles cannot extend their own subscription or mark invoices paid.
- The template license starts in explicit demonstration mode, not as a fabricated paid subscription; payment integration must be enabled only after verified provider reconciliation.
