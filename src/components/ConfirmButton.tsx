'use client'

/**
 * Submit button that asks for confirmation before allowing the surrounding
 * <form> to submit. Use inside a server-action <form> to guard destructive or
 * hard-to-reverse actions (e.g. sending a "waiting list" email to a parent).
 */
export default function ConfirmButton({
  message,
  className,
  title,
  children,
}: {
  message: string
  className?: string
  title?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="submit"
      title={title}
      onClick={(e) => {
        if (!window.confirm(message)) {
          e.preventDefault()
        }
      }}
      className={className}
    >
      {children}
    </button>
  )
}
