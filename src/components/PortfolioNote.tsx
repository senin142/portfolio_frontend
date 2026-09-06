const PORTFOLIO_URL = 'https://github.com/senin142/portfolio1.0';

export default function PortfolioNote() {
  return (
    <a
      href={PORTFOLIO_URL}
      target="_blank"
      rel="noopener"
      className="block bg-ink px-4 py-2 text-center font-mono text-[11px] text-white/80 transition-colors hover:text-brand-light"
    >
      One of Shubhanshu Pandey's portfolio demos (role-gated publishing CMS) — see the others (role workflow portal, video player) on the full portfolio ↗
    </a>
  );
}
