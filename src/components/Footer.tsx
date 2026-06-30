import Link from "next/link";
import Image from "next/image";
import NewsletterForm from "./NewsletterForm";

const explore = [
  ["Home", "/"], ["About Us", "/about"], ["Programs", "/programs"],
  ["Admissions", "/admissions"], ["Events", "/events"],
  ["Coffee Page", "/coffee"], ["Contact", "/contact"],
] as const;

const programs = [
  ["Evening Qur'an Classes", "/programs#evening-quran"],
  ["Weekend School", "/programs#weekend-school"],
  ["Vocational Programs", "/programs#vocational"],
  ["Youth Activities", "/programs#youth"],
  ["Hifz Program (Coming Soon)", "/programs#hifz"],
  ["K-12 Homeschool Academic Support", "/programs#k12"],
] as const;

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 1.62c-3.15 0-3.52.01-4.76.07-.9.04-1.39.19-1.71.32-.43.17-.74.37-1.06.69-.32.32-.52.63-.69 1.06-.13.32-.28.81-.32 1.71-.06 1.24-.07 1.61-.07 4.76s.01 3.52.07 4.76c.04.9.19 1.39.32 1.71.17.43.37.74.69 1.06.32.32.63.52 1.06.69.32.13.81.28 1.71.32 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c.9-.04 1.39-.19 1.71-.32.43-.17.74-.37 1.06-.69.32-.32.52-.63.69-1.06.13-.32.28-.81.32-1.71.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.04-.9-.19-1.39-.32-1.71a2.86 2.86 0 0 0-.69-1.06 2.86 2.86 0 0 0-1.06-.69c-.32-.13-.81-.28-1.71-.32-1.24-.06-1.61-.07-4.76-.07Zm0 2.76a5.3 5.3 0 1 1 0 10.6 5.3 5.3 0 0 1 0-10.6Zm0 1.62a3.68 3.68 0 1 0 0 7.36 3.68 3.68 0 0 0 0-7.36Zm5.48-2.9a1.24 1.24 0 1 1 0 2.48 1.24 1.24 0 0 1 0-2.48Z"/>
    </svg>
  );
}
function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
    </svg>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer role="contentinfo" className="bg-green text-cream border-t-[6px] border-gold">
      <div className="mx-auto max-w-7xl px-6 py-14 grid gap-10 md:grid-cols-4">

        {/* Brand */}
        <div>
          <div className="inline-block rounded-xl bg-white p-4">
            <Image src="/brand/logo-color.png" alt="SoCal Academy of Knowledge"
                   width={120} height={238} className="h-28 w-auto" />
          </div>
          <p className="mt-4 font-display italic text-cream/90">Nurturing Faith &amp; Knowledge</p>
          <ul className="mt-4 space-y-3">
            <li>
              <a href="https://instagram.com/SoCalAoK" target="_blank" rel="noopener noreferrer"
                 aria-label="SoCal AoK on Instagram" className="flex items-center gap-3 hover:text-gold">
                <InstagramIcon /> <span>@SoCalAoK</span>
              </a>
            </li>
            <li>
              <a href="https://tiktok.com/@SoCalAoK" target="_blank" rel="noopener noreferrer"
                 aria-label="SoCal AoK on TikTok" className="flex items-center gap-3 hover:text-gold">
                <TikTokIcon /> <span>@SoCalAoK</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Explore */}
        <nav aria-label="Footer — Explore">
          <h2 className="font-display text-lg text-gold">Explore</h2>
          <span className="block mt-1 h-[3px] w-10 bg-gold-deep" aria-hidden="true" />
          <ul className="mt-4 space-y-2.5">
            {explore.map(([label, href]) => (
              <li key={href}><Link href={href} className="hover:text-gold">{label}</Link></li>
            ))}
          </ul>
        </nav>

        {/* Programs */}
        <nav aria-label="Footer — Programs">
          <h2 className="font-display text-lg text-gold">Programs</h2>
          <span className="block mt-1 h-[3px] w-10 bg-gold-deep" aria-hidden="true" />
          <ul className="mt-4 space-y-2.5">
            {programs.map(([label, href]) => (
              <li key={label}><Link href={href} className="hover:text-gold">{label}</Link></li>
            ))}
          </ul>
        </nav>

        {/* Get Involved + Contact */}
        <div>
          <nav aria-label="Footer — Get Involved">
            <h2 className="font-display text-lg text-gold">Get Involved</h2>
            <span className="block mt-1 h-[3px] w-10 bg-gold-deep" aria-hidden="true" />
            <ul className="mt-4 space-y-2.5">
              <li><Link href="/volunteers" className="hover:text-gold">Volunteer</Link></li>
              <li><Link href="/donate" className="hover:text-gold">Donate</Link></li>
              <li><a href="https://parent.socalaok.org" className="hover:text-gold">Parent Login</a></li>
              <li><a href="https://teacher.socalaok.org" className="hover:text-gold">Teacher Login</a></li>
            </ul>
          </nav>
          <h2 className="mt-8 font-display text-lg text-gold">Contact</h2>
          <span className="block mt-1 h-[3px] w-10 bg-gold-deep" aria-hidden="true" />
          <address className="mt-4 not-italic space-y-2.5">
            <div>
              <a href="https://maps.google.com/?q=8414+Tampa+Ave,+Northridge,+CA+91324"
                 target="_blank" rel="noopener noreferrer" className="hover:text-gold">
                8414 Tampa Ave, Northridge, CA 91324
              </a>
            </div>
            <div><a href="tel:+18184525237" className="hover:text-gold">818-452-5237</a></div>
            <div><a href="mailto:info@socalaok.org" className="text-gold hover:underline">info@socalaok.org</a></div>
          </address>
        </div>
      </div>

      {/* Newsletter */}
      <div className="mx-auto max-w-7xl px-6 border-t border-white/15 py-8
                      flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-display text-xl text-cream">Stay updated</div>
          <div className="text-cream/70 text-sm">Monthly news &amp; events</div>
        </div>
        <NewsletterForm />
      </div>

      {/* Bottom bar */}
      <div className="bg-green-900">
        <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col gap-2 text-sm text-cream/70
                        sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} SoCal Academy of Knowledge, Inc. · All rights reserved.</span>
          <span className="flex gap-4">
            <Link href="/privacy" className="hover:text-gold">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gold">Terms of Use</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
