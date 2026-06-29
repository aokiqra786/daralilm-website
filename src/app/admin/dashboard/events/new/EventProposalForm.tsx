'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Plus } from 'lucide-react'
import { Input, Textarea, Select, Button, Card, Alert } from '@/components/ui'
import {
  EVENT_TYPES,
  BUDGET_CATEGORIES,
  formatMoney,
  estimatedNet,
} from '@/lib/eventsWorkflow'
import { createEventProposal } from '../actions'

type BudgetRow = { key: number; category: string; amount: string; note: string }

const CONTROL =
  'w-full rounded-md border border-line bg-white px-3 py-2 text-ink placeholder-muted outline-none focus:border-green focus:ring-2 focus:ring-gold/40'

export default function EventProposalForm() {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const [rows, setRows] = useState<BudgetRow[]>([{ key: 1, category: '', amount: '', note: '' }])
  const [fee, setFee] = useState('0')
  const [expected, setExpected] = useState('')

  const expensesTotal = useMemo(
    () => rows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0),
    [rows]
  )
  const { revenue, net } = useMemo(
    () => estimatedNet(parseFloat(fee) || 0, parseInt(expected, 10) || 0, expensesTotal),
    [fee, expected, expensesTotal]
  )

  function addRow() {
    setRows((r) => [...r, { key: Date.now(), category: '', amount: '', note: '' }])
  }
  function removeRow(key: number) {
    setRows((r) => (r.length > 1 ? r.filter((x) => x.key !== key) : r))
  }
  function updateRow(key: number, field: keyof BudgetRow, value: string) {
    setRows((r) => r.map((x) => (x.key === key ? { ...x, [field]: value } : x)))
  }

  async function onSubmit(formData: FormData) {
    setPending(true)
    setResult(null)
    const res = await createEventProposal(formData)
    setResult(res)
    setPending(false)
    if (res.success && res.eventId) {
      router.push(`/admin/dashboard/events/${res.eventId}`)
    }
  }

  return (
    <form action={onSubmit} className="max-w-3xl space-y-6">
      {/* Section: Details */}
      <Card>
        <h2 className="font-serif text-lg font-bold text-green">Event details</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="Title" name="title" required placeholder="Open House" />
          <Select label="Event type" name="event_type" required defaultValue="">
            <option value="" disabled>
              Select a type…
            </option>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t} className="capitalize">
                {t}
              </option>
            ))}
          </Select>
          <Input label="Date & start time" name="event_date" type="datetime-local" required />
          <Input label="End time (optional)" name="event_end" type="datetime-local" />
          <Input label="Location" name="location" required placeholder="Main Hall" />
        </div>
        <div className="mt-4">
          <Input label="Public summary (1–2 lines)" name="summary" required maxLength={180} placeholder="A morning to meet our teachers and tour the academy." />
        </div>
        <div className="mt-4">
          <Textarea label="Full description (optional)" name="description" rows={4} />
        </div>
      </Card>

      {/* Section: Attendance & fee */}
      <Card>
        <h2 className="font-serif text-lg font-bold text-green">Attendance &amp; fee</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            label="Attendee fee ($, 0 = free)"
            name="attendee_fee"
            type="number"
            min="0"
            step="0.01"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
          />
          <Input label="Capacity (max attendees)" name="capacity" type="number" min="0" />
          <Input
            label="Expected attendees"
            name="expected_attendees"
            type="number"
            min="0"
            value={expected}
            onChange={(e) => setExpected(e.target.value)}
          />
        </div>
      </Card>

      {/* Section: Staffing needs */}
      <Card>
        <h2 className="font-serif text-lg font-bold text-green">Teacher &amp; volunteer needs</h2>
        <p className="mt-1 text-sm text-muted">
          Who&apos;s needed and when. Used later to send RSVP invites (no budget shown to them).
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Textarea
            label="Teachers required (roles, count, time window)"
            name="teacher_needs"
            rows={3}
            placeholder="2 Qur'an teachers, 9–11 AM"
          />
          <Textarea
            label="Volunteers needed (roles + count)"
            name="volunteer_needs"
            rows={3}
            placeholder="4 setup volunteers; 2 registration desk"
          />
        </div>
      </Card>

      {/* Section: Budget */}
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-green">Estimated expenses</h2>
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-1 text-sm font-semibold text-green hover:underline"
          >
            <Plus className="h-4 w-4" /> Add line
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {rows.map((row) => (
            <div key={row.key} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_120px_1fr_auto] sm:items-center">
              <select
                name="budget_category"
                aria-label="Category"
                className={CONTROL}
                value={row.category}
                onChange={(e) => updateRow(row.key, 'category', e.target.value)}
              >
                <option value="">Category…</option>
                {BUDGET_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                name="budget_amount"
                aria-label="Amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className={CONTROL}
                value={row.amount}
                onChange={(e) => updateRow(row.key, 'amount', e.target.value)}
              />
              <input
                name="budget_note"
                aria-label="Note"
                placeholder="Note (optional)"
                className={CONTROL}
                value={row.note}
                onChange={(e) => updateRow(row.key, 'note', e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeRow(row.key)}
                aria-label="Remove line"
                className="justify-self-start rounded-md p-2 text-muted hover:bg-parchment hover:text-danger"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Running totals (submitter/board/treasurer only — never shown to teachers/volunteers) */}
        <div className="mt-5 grid grid-cols-1 gap-3 rounded-lg bg-parchment p-4 sm:grid-cols-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted">Estimated expenses</div>
            <div className="text-lg font-bold text-ink">{formatMoney(expensesTotal)}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-muted">Estimated revenue</div>
            <div className="text-lg font-bold text-ink">{formatMoney(revenue)}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-muted">Estimated net</div>
            <div className={`text-lg font-bold ${net < 0 ? 'text-danger' : 'text-green'}`}>
              {formatMoney(net)}
            </div>
          </div>
        </div>
      </Card>

      {result && (
        <Alert tone={result.success ? 'success' : 'error'}>{result.message}</Alert>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" name="intent" value="submit" variant="primary" loading={pending}>
          Submit for board review
        </Button>
        <Button type="submit" name="intent" value="draft" variant="ghost" disabled={pending}>
          Save draft
        </Button>
      </div>
    </form>
  )
}
