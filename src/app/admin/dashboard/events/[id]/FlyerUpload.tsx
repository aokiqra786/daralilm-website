'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { uploadEventFlyer } from '../actions'

const isPdf = (url: string) => url.split('?')[0].toLowerCase().endsWith('.pdf')

export default function FlyerUpload({
  eventId,
  currentUrl,
}: {
  eventId: string
  currentUrl: string | null
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  async function onSubmit(formData: FormData) {
    setPending(true)
    setResult(null)
    const res = await uploadEventFlyer(formData)
    setResult(res)
    setPending(false)
    if (res.success) router.refresh()
  }

  return (
    <form action={onSubmit} className="rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="font-serif text-lg font-bold text-green">Flyer (image)</h3>
      {currentUrl ? (
        isPdf(currentUrl) ? (
          <p className="mt-1 text-sm text-slate-600">
            Current flyer is a PDF —{' '}
            <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="text-green underline">
              view it
            </a>
            . Upload an image below so it displays on the website.
          </p>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentUrl}
            alt="Current flyer"
            className="mt-2 max-h-64 w-auto rounded-md border border-slate-200"
          />
        )
      ) : (
        <p className="mt-1 text-sm text-slate-500">No flyer yet (recommended).</p>
      )}
      <input type="hidden" name="eventId" value={eventId} />
      <input
        type="file"
        name="flyer"
        accept="image/png,image/jpeg,image/webp"
        className="mt-3 block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-green file:px-3 file:py-1.5 file:font-semibold file:text-white hover:file:bg-green-700"
      />
      <p className="mt-1 text-xs text-slate-500">PNG, JPG, or WebP — up to 10 MB.</p>
      {result && (
        <p className={`mt-2 text-sm ${result.success ? 'text-green' : 'text-red-700'}`}>{result.message}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-3 rounded-md bg-green px-4 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
      >
        {pending ? 'Uploading…' : currentUrl ? 'Replace flyer' : 'Upload flyer'}
      </button>
    </form>
  )
}
