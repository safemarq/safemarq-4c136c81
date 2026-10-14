import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';
import { keepPunctuation } from '@/lib/typography';
import { cn } from '@/lib/utils';

/**
 * Article bodies. Markdown only: raw HTML in the text is ignored (react-markdown
 * does not render it without a plugin), so an admin typo can never inject a script.
 */
const components: Components = {
  h2: ({ children }) => <h2 className="mt-12 scroll-mt-24 text-[28px] font-semibold leading-tight text-strong md:text-[32px]">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-8 font-display text-[22px] font-semibold leading-snug text-strong">{children}</h3>,
  p: ({ children }) => <p className="mt-5 text-[18px] leading-[1.7] text-ink">{children}</p>,
  // Unordered bullets are small navy squares, like the rest of the site.
  ul: ({ children }) => (
    <ul className="mt-5 space-y-2 text-[18px] leading-[1.65] text-ink [&>li]:relative [&>li]:pl-6 [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:top-[0.68em] [&>li]:before:h-2 [&>li]:before:w-2 [&>li]:before:bg-strong">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-5 list-decimal space-y-2 pl-6 text-[18px] leading-[1.65] text-ink marker:font-semibold marker:text-strong [&>li]:pl-1">{children}</ol>
  ),
  li: ({ children }) => <li>{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-strong">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  blockquote: ({ children }) => <blockquote className="mt-6 border-l-[3px] border-strong pl-5 text-[18px] text-slate1 [&>p]:mt-2">{children}</blockquote>,
  hr: () => <hr className="my-10 border-line" />,
  a: ({ href = '', children }) => {
    if (href.startsWith('/')) {
      return (
        <Link to={href} className="font-semibold text-strong underline underline-offset-4 hover:decoration-2">
          {children}
        </Link>
      );
    }
    const safe = /^https?:\/\//i.test(href) || href.startsWith('mailto:');
    if (!safe) return <>{children}</>;
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-strong underline underline-offset-4 hover:decoration-2">
        {children}
      </a>
    );
  },
  // Pictures come from the cover field; inline images are left out on purpose.
  img: () => null,
  table: ({ children }) => (
    <div className="mt-6 overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[28rem] border-collapse text-left text-[16px]">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-paper-2">{children}</thead>,
  th: ({ children }) => <th className="border-b border-line px-4 py-3 font-semibold text-strong">{children}</th>,
  td: ({ children }) => <td className="border-b border-line px-4 py-3 align-top text-ink">{children}</td>,
  code: ({ children }) => <code className="rounded bg-paper-2 px-1.5 py-0.5 text-[0.9em]">{children}</code>,
};

export default function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn('[&>*:first-child]:mt-0', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components} skipHtml>
        {keepPunctuation(children)}
      </ReactMarkdown>
    </div>
  );
}
