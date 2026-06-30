import { redirect } from 'next/navigation'

// The public portal-chooser was retired for security: it enumerated every portal
// (admin / teacher / parent / event-uploader) on an unauthenticated page. Each
// portal is now reached via its own subdomain / login. Parent + Teacher logins
// live in the site footer; admin + event-uploader are reached by their known URLs.
// On admin.socalaok.org the proxy already sends /admin → /admin/dashboard; on the
// apex this lands on the public homepage.
export default function AdminIndexPage() {
  redirect('/')
}
