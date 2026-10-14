import { Link } from 'react-router-dom';

/** Invitation to establishments to complete their listing (makes, equipment). Quiet: the page is for drivers. */
export function ProNote({ title, body, cta }: { title: string; body: string; cta: string }) {
  return (
    <section className="container-editorial pb-14 md:pb-20">
      <div className="flex flex-col gap-5 rounded-2xl border border-line p-6 md:flex-row md:items-center md:justify-between md:gap-10 md:p-8">
        <div className="max-w-2xl">
          <h2 className="text-[24px] font-semibold leading-tight text-strong md:text-[28px]">{title}</h2>
          <p className="mt-2 text-[16px] leading-relaxed text-slate1">{body}</p>
        </div>
        <Link to="/pro/dashboard?section=workshop" className="btn-ghost-navy min-h-[48px] shrink-0 self-start px-5 md:self-auto">
          {cta}
        </Link>
      </div>
    </section>
  );
}
