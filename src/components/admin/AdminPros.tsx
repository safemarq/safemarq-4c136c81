import { useState } from 'react';
import { ExternalLink, Mail, Phone } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useAdminProAccounts, useReviewSubmission, useSetProStatus, type AdminProRow } from '@/hooks/useAdminPros';
import { useApproveClaim, useRejectClaim } from '@/hooks/useAdmin';
import type { KycStatus } from '@/hooks/useProAccount';
import { formatBce, formatPhone, kboLookupUrl } from '@/lib/pro/validation';
import { cn } from '@/lib/utils';

// Admin is internal (single operator), so this screen stays in French.
const FILTERS: { id: KycStatus; label: string }[] = [
  { id: 'pending', label: 'À vérifier' },
  { id: 'needs_info', label: 'Infos demandées' },
  { id: 'approved', label: 'Validés' },
  { id: 'rejected', label: 'Refusés' },
];

export default function AdminPros() {
  const [status, setStatus] = useState<KycStatus>('pending');
  const { data = [], isLoading, isError } = useAdminProAccounts(status);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={status === f.id}
            onClick={() => setStatus(f.id)}
            className={cn(
              'min-h-[40px] rounded-full border px-4 text-sm font-semibold',
              status === f.id ? 'border-strong bg-strong text-paper' : 'border-line bg-card text-slate1',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading && <div className="h-40 animate-pulse rounded-2xl bg-paper-2" />}
      {isError && <p className="text-sm text-destructive">Chargement impossible (migration KYC appliquée ?).</p>}
      {!isLoading && !isError && data.length === 0 && <p className="rounded-xl border border-dashed border-line p-5 text-sm text-slate1">Rien dans cette file.</p>}
      {data.map((row) => (
        <ProCard key={row.user_id} row={row} />
      ))}
    </div>
  );
}

function ProCard({ row }: { row: AdminProRow }) {
  const [note, setNote] = useState(row.review_note ?? '');
  const [noteMissing, setNoteMissing] = useState(false);
  const setStatus = useSetProStatus();
  const approveClaim = useApproveClaim();
  const rejectClaim = useRejectClaim();
  const reviewSubmission = useReviewSubmission();
  const approved = row.kyc_status === 'approved';
  const busy = setStatus.isPending || approveClaim.isPending || rejectClaim.isPending || reviewSubmission.isPending;

  const decide = (status: KycStatus) => {
    const needsNote = status === 'needs_info' || status === 'rejected';
    if (needsNote && !note.trim()) return setNoteMissing(true);
    setNoteMissing(false);
    setStatus.mutate({ userId: row.user_id, status, note: note.trim() || null });
  };

  return (
    <article className="rounded-2xl border border-line bg-card p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl text-strong">{row.company_name}</h3>
          <p className="text-sm text-slate1">
            {row.account_type === 'dealer' ? 'Concession' : 'Garage indépendant'} · envoyé le{' '}
            {new Date(row.submitted_at).toLocaleDateString('fr-BE', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <a href={kboLookupUrl(row.bce_number)} target="_blank" rel="noopener noreferrer" className="btn-ghost-navy min-h-[40px] px-3 text-sm">
          BCE {formatBce(row.bce_number)}
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
      </header>

      <dl className="mt-4 grid gap-3 text-[15px] sm:grid-cols-2">
        <div>
          <dt className="text-xs text-slate1">Téléphone (à appeler)</dt>
          <dd>
            <a href={`tel:${row.phone}`} className="inline-flex items-center gap-1.5 font-semibold text-strong underline-offset-4 hover:underline">
              <Phone className="h-4 w-4" aria-hidden />
              {formatPhone(row.phone)}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate1">Email pro</dt>
          <dd>
            <a href={`mailto:${row.business_email}`} className="inline-flex items-center gap-1.5 break-all font-semibold text-strong underline-offset-4 hover:underline">
              <Mail className="h-4 w-4 shrink-0" aria-hidden />
              {row.business_email}
            </a>
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs text-slate1">Siège</dt>
          <dd>
            {row.street}, {row.postal_code} {row.city} · langue {row.contact_locale.toUpperCase()}
          </dd>
        </div>
      </dl>

      {(row.claims.length > 0 || row.submissions.length > 0) && (
        <section className="mt-5 rounded-xl bg-paper-2 p-4">
          <h4 className="font-sans text-sm font-semibold text-ink">Établissements demandés</h4>
          {!approved && <p className="mt-1 text-xs text-slate1">Validez le compte d'abord, puis les établissements.</p>}
          <ul className="mt-3 space-y-3">
            {row.claims.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-card p-3">
                <div className="min-w-0 text-sm">
                  <p className="font-semibold text-ink">Revendication · {c.garage?.name}</p>
                  <p className="text-slate1">{c.garage?.address}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" disabled={!approved || busy} onClick={() => approveClaim.mutate({ claimId: c.id })} className="btn-amber min-h-[40px] px-3 text-sm">
                    Lier
                  </button>
                  <button type="button" disabled={busy} onClick={() => rejectClaim.mutate({ claimId: c.id, note: note.trim() || undefined })} className="btn-ghost-navy min-h-[40px] px-3 text-sm">
                    Refuser
                  </button>
                </div>
              </li>
            ))}
            {row.submissions.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-card p-3">
                <div className="min-w-0 text-sm">
                  <p className="font-semibold text-ink">Nouveau · {s.name}</p>
                  <p className="text-slate1">
                    {s.street}, {s.postal_code} {s.city}
                    {s.website ? ` · ${s.website}` : ''}
                  </p>
                  <p className="text-slate1">{s.trades.join(', ')}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={!approved || busy}
                    onClick={() => reviewSubmission.mutate({ id: s.id, decision: 'approved', note: null })}
                    className="btn-amber min-h-[40px] px-3 text-sm"
                  >
                    Créer la fiche
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => reviewSubmission.mutate({ id: s.id, decision: 'rejected', note: note.trim() || null })}
                    className="btn-ghost-navy min-h-[40px] px-3 text-sm"
                  >
                    Refuser
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-5">
        <label htmlFor={`note-${row.user_id}`} className="field-label">
          Note au pro (obligatoire pour demander des infos ou refuser)
        </label>
        <Textarea id={`note-${row.user_id}`} value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} aria-invalid={noteMissing || undefined} />
        {noteMissing && <p className="field-error">Écrivez ce qui manque ou la raison du refus.</p>}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {row.kyc_status !== 'approved' && (
          <button type="button" disabled={busy} onClick={() => decide('approved')} className="btn-amber min-h-[44px]">
            Valider le compte
          </button>
        )}
        {row.kyc_status !== 'needs_info' && (
          <button type="button" disabled={busy} onClick={() => decide('needs_info')} className="btn-ghost-navy min-h-[44px]">
            Demander des infos
          </button>
        )}
        {row.kyc_status !== 'rejected' && (
          <button type="button" disabled={busy} onClick={() => decide('rejected')} className="inline-flex min-h-[44px] items-center rounded-lg px-4 text-[15px] font-semibold text-coral hover:bg-coral/10">
            Refuser
          </button>
        )}
      </div>
    </article>
  );
}
