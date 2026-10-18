import { Container } from "./container";

export function PageHeader({
  eyebrow,
  title,
  lede,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
}) {
  return (
    <header className="border-b border-white/10 pt-12 pb-10 md:pt-16 md:pb-12">
      <Container>
        {eyebrow ? (
          <p className="text-xs uppercase tracking-[0.22em] text-[#c9c3b6]">{eyebrow}</p>
        ) : null}
        <h1 className="mt-3 max-w-[16ch] font-display text-[clamp(2.7rem,6vw,4.8rem)] leading-[0.95] tracking-tight">
          {title}
        </h1>
        {lede ? <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#c9c3b6]">{lede}</p> : null}
      </Container>
    </header>
  );
}

export function DraftNotice({ children }: { children: React.ReactNode }) {
  return (
    <p className="border border-[#9f1c1c]/70 bg-[#9f1c1c]/10 px-4 py-3 text-sm leading-relaxed">
      <strong className="font-medium">Draft. </strong>
      {children}
    </p>
  );
}
