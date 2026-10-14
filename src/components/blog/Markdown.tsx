import { Children, cloneElement, createContext, isValidElement, useContext, type ReactElement, type ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';
import { keepPunctuation } from '@/lib/typography';
import { cn } from '@/lib/utils';

/**
 * Article bodies. Markdown only: raw HTML in the text is ignored (react-markdown
 * does not render it without a plugin), so an admin typo can never inject a script.
 */
// Tables: a real table from the sm breakpoint; below it each row becomes a card
// (first cell as its title, the others under their column name), so a phone
// never has to scroll sideways through a price list.
type HNode = { type: string; tagName?: string; value?: string; children?: HNode[] };
const textOf = (n: HNode): string => (n.type === 'text' ? n.value ?? '' : (n.children ?? []).map(textOf).join(''));
function headerLabels(table?: HNode): string[] {
  const row = table?.children?.find((c) => c.tagName === 'thead')?.children?.find((c) => c.tagName === 'tr');
  return (row?.children ?? []).filter((c) => c.tagName === 'th').map((c) => textOf(c).trim());
}
const ColumnLabels = createContext<string[]>([]);

function Row({ children }: { children?: ReactNode }) {
  const labels = useContext(ColumnLabels);
  let col = 0;
  const cells = Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    const i = col++;
    return cloneElement(child as ReactElement<Record<string, unknown>>, { 'data-col': i, 'data-label': labels[i] ?? '' });
  });
  return <tr className="max-sm:block max-sm:rounded-xl max-sm:border max-sm:border-line max-sm:bg-card max-sm:p-4">{cells}</tr>;
}

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
  table: ({ node, children }) => (
    <ColumnLabels.Provider value={headerLabels(node as HNode | undefined)}>
      <div className="mt-6 sm:overflow-x-auto sm:rounded-xl sm:border sm:border-line">
        <table className="w-full border-collapse text-left text-[16px] max-sm:block sm:min-w-[28rem]">{children}</table>
      </div>
    </ColumnLabels.Provider>
  ),
  thead: ({ children }) => <thead className="bg-paper-2 max-sm:sr-only">{children}</thead>,
  tbody: ({ children }) => <tbody className="max-sm:block max-sm:space-y-3">{children}</tbody>,
  tr: ({ children }) => <Row>{children}</Row>,
  th: ({ children }) => <th className="border-b border-line px-4 py-3 font-semibold text-strong">{children}</th>,
  td: ({ children, ...props }) => {
    const data = props as Record<string, unknown>;
    const first = data['data-col'] === 0;
    const label = typeof data['data-label'] === 'string' ? data['data-label'] : '';
    return (
      <td
        className={cn(
          'border-b border-line px-4 py-3 align-top text-ink max-sm:block max-sm:border-0 max-sm:p-0',
          first ? 'max-sm:text-[17px] max-sm:font-semibold max-sm:text-strong' : 'max-sm:mt-2.5',
        )}
      >
        {!first && label && <span className="block text-[13px] font-semibold text-slate1 sm:hidden">{label}</span>}
        {children}
      </td>
    );
  },
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
