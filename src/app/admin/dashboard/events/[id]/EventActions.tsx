'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, Alert } from '@/components/ui'
import { formatMoney } from '@/lib/eventsWorkflow'
import { boardReview, treasurerReview, submitProposal, publishEvent } from '../actions'

const CONTROL =
  'w-full rounded-md border border-line bg-white px-3 py-2 text-ink placeholder-muted outline-none focus:border-green focus:ring-2 focus:ring-gold/40'

type Props = {
  eventId: string
  canBoard: boolean
  canTreasurer: boolean
  canSubmit: boolean
  canEdit: boolean
  canPublish: boolean
  estTotal: number | null
  boardTotal: number | null
  estNet: number
  outstanding: number
}

export default function EventActions({
  eventId,
  canBoard,
  canTreasurer,
  canSubmit,
  canEdit,
  canPublish,
  estTotal,
  boardTotal,
  estNet,
  outstanding,
}: Props) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  function run(action: (fd: FormData) => Promise<{ success: boolean; message: string }>) {
    return async (formData: FormData) => {
      setPending(true)
      setResult(null)
      const res = await action(formData)
      setResult(res)
      setPending(false)
      if (res.success) router.refresh()
    }
  }

  if (!canBoard && !canTreasurer && !canSubmit && !canEdit && !canPublish) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        No actions available to you at this stage.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {result && <Alert tone={result.success ? 'success' : 'error'}>{result.message}</Alert>}

      {canPublish && (
        <form action={run(publishEvent)} className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="font-serif text-lg font-bold text-green">Publish</h3>
          <p className="mt-1 text-sm text-slate-600">
            This event is approved. Publishing makes it visible on the homepage and Events page,
            and lets you send RSVP invites.
          </p>
          <input type="hidden" name="eventId" value={eventId} />
          <div className="mt-4">
            <Button type="submit" variant="primary" loading={pending}>Publish event</Button>
          </div>
        </form>
      )}

      {(canEdit || canSubmit) && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="font-serif text-lg font-bold text-green">Edit &amp; submit</h3>
          <p className="mt-1 text-sm text-slate-600">
            Make changes (details, fee, budget) before sending — or after the board requests changes.
          </p>
          {canEdit && (
            <Link
              href={`/admin/dashboard/events/${eventId}/edit`}
              className="mt-4 inline-flex items-center justify-center rounded-md border border-green px-4 py-2 font-semibold text-green transition-colors hover:bg-green hover:text-white"
            >
              Edit proposal
            </Link>
          )}
          {canSubmit && (
            <form action={run(submitProposal)} className="mt-3">
              <input type="hidden" name="eventId" value={eventId} />
              <Button type="submit" variant="primary" loading={pending}>Submit for board review</Button>
            </form>
          )}
        </div>
      )}

      {canBoard && (
        <form action={run(boardReview)} className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="font-serif text-lg font-bold text-green">Board review</h3>
          <input type="hidden" name="eventId" value={eventId} />
          <label className="mt-4 block text-sm font-medium text-slate-700">
            Confirmed budget total
            <input
              name="board_total"
              type="number"
              min="0"
              step="0.01"
              defaultValue={boardTotal ?? estTotal ?? ''}
              placeholder={estTotal != null ? String(estTotal) : '0.00'}
              className={`mt-1 ${CONTROL}`}
            />
          </label>
          <p className="mt-1 text-xs text-slate-500">
            Submitter estimate: {formatMoney(estTotal)}. Change this to override (original is preserved).
          </p>
          <label className="mt-4 block text-sm font-medium text-slate-700">
            Note (optional)
            <textarea name="note" rows={3} className={`mt-1 ${CONTROL}`} />
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="submit" name="action" value="approve" variant="primary" loading={pending}>
              Confirm → Treasurer
            </Button>
            <Button type="submit" name="action" value="request_changes" variant="ghost" disabled={pending}>
              Request changes
            </Button>
            <Button type="submit" name="action" value="decline" variant="ghost" disabled={pending}>
              Decline
            </Button>
          </div>
        </form>
      )}

      {canTreasurer && (
        <form action={run(treasurerReview)} className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="font-serif text-lg font-bold text-green">Treasurer — funds approval</h3>

          {/* Decision aids */}
          <div className="mt-3 space-y-1 rounded-lg bg-slate-50 p-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Board total</span><span className="font-semibold text-slate-800">{formatMoney(boardTotal ?? estTotal)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Estimated net</span><span className={`font-semibold ${estNet < 0 ? 'text-red-600' : 'text-green'}`}>{formatMoney(estNet)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Outstanding approved commitments</span><span className="font-semibold text-slate-800">{formatMoney(outstanding)}</span></div>
          </div>

          <input type="hidden" name="eventId" value={eventId} />
          <label className="mt-4 block text-sm font-medium text-slate-700">
            Approved amount
            <input
              name="approved_amount"
              type="number"
              min="0"
              step="0.01"
              defaultValue={boardTotal ?? estTotal ?? ''}
              className={`mt-1 ${CONTROL}`}
            />
          </label>
          <label className="mt-4 block text-sm font-medium text-slate-700">
            Cash-position / decision note
            <textarea name="note" rows={3} placeholder="Approved against July cash position" className={`mt-1 ${CONTROL}`} />
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="submit" name="action" value="approve" variant="primary" loading={pending}>
              Approve funds
            </Button>
            <Button type="submit" name="action" value="hold" variant="ghost" disabled={pending}>
              Hold
            </Button>
            <Button type="submit" name="action" value="request_changes" variant="ghost" disabled={pending}>
              Request changes
            </Button>
            <Button type="submit" name="action" value="decline" variant="ghost" disabled={pending}>
              Decline
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
