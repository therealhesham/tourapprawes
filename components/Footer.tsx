import Image from "next/image";
import Link from "next/link";

const socialLinks = [
  {
    label: "X",
    href: "https://x.com/",
    bg: "bg-black",
    iconColor: "text-white",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com/",
    bg: "bg-[radial-gradient(circle_at_30%_107%,#fdf497_0%,#fdf497_5%,#fd5949_45%,#d6249f_60%,#285AEB_90%)]",
    iconColor: "text-white",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.311.975.975 1.249 2.242 1.311 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.336 2.633-1.311 3.608-.975.975-2.242 1.249-3.608 1.311-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.336-3.608-1.311-.975-.975-1.249-2.242-1.311-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.062-1.366.336-2.633 1.311-3.608.975-.975 2.242-1.249 3.608-1.311 1.266-.058 1.646-.07 4.85-.07zm0 1.802c-3.15 0-3.523.012-4.766.069-1.023.047-1.578.218-1.948.362-.49.19-.84.417-1.207.784-.367.367-.594.717-.784 1.207-.144.37-.315.925-.362 1.948-.057 1.243-.069 1.616-.069 4.766s.012 3.523.069 4.766c.047 1.023.218 1.578.362 1.948.19.49.417.84.784 1.207.367.367.717.594 1.207.784.37.144.925.315 1.948.362 1.243.057 1.616.069 4.766.069s3.523-.012 4.766-.069c1.023-.047 1.578-.218 1.948-.362.49-.19.84-.417 1.207-.784.367-.367.594-.717.784-1.207.144-.37.315-.925.362-1.948.057-1.243.069-1.616.069-4.766s-.012-3.523-.069-4.766c-.047-1.023-.218-1.578-.362-1.948-.19-.49-.417-.84-.784-1.207-.367-.367-.717-.594-1.207-.784-.37-.144-.925-.315-1.948-.362-1.243-.057-1.616-.069-4.766-.069zm0 3.063a5.135 5.135 0 1 1 0 10.27 5.135 5.135 0 0 1 0-10.27zm0 8.468a3.333 3.333 0 1 0 0-6.666 3.333 3.333 0 0 0 0 6.666zm5.338-9.87a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z" />
      </svg>
    ),
  },
  {
    label: "Snapchat",
    href: "https://snapchat.com/",
    bg: "bg-[#FFFC00]",
    iconColor: "text-black",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]" aria-hidden="true">
        <path d="M12.03 2c1.99 0 4.42 1.1 5.35 4.03.28.9.21 2.28.15 3.4l-.01.4c0 .12.11.23.31.23.15 0 .35-.05.58-.15a.9.9 0 0 1 .38-.08c.36 0 .74.17.8.5.05.28-.14.62-.87.91-.09.04-.2.07-.32.11-.44.14-1.1.35-1.28.78-.09.22-.05.5.12.83l.01.02c.06.13 1.4 3.06 4.38 3.55.23.04.4.24.39.48 0 .07-.02.14-.05.21-.22.52-1.16.9-2.87 1.17-.06.08-.11.34-.15.52-.03.17-.07.34-.12.52-.06.24-.24.36-.5.36h-.03c-.14 0-.32-.02-.55-.07a6.4 6.4 0 0 0-1.3-.14c-.31 0-.63.02-.95.08-.62.1-1.15.48-1.76.91-.87.62-1.86 1.32-3.36 1.32l-.15-.01-.13.01c-1.5 0-2.48-.7-3.35-1.32-.61-.43-1.14-.8-1.76-.91a5.9 5.9 0 0 0-.95-.08c-.55 0-.99.09-1.3.15-.22.04-.4.07-.54.07-.35 0-.48-.21-.53-.38-.05-.17-.08-.35-.12-.52-.04-.18-.1-.45-.15-.52-1.71-.27-2.66-.65-2.87-1.18a.56.56 0 0 1-.05-.2c-.01-.24.16-.45.39-.49 2.98-.49 4.32-3.42 4.38-3.55l.01-.02c.16-.33.2-.6.12-.83-.17-.42-.84-.64-1.28-.78-.11-.04-.22-.07-.31-.11-.98-.39-.9-.87-.86-1 .08-.28.44-.46.76-.46.1 0 .18.02.26.05.27.13.51.19.72.19.28 0 .4-.12.42-.24l-.02-.4c-.06-1.11-.13-2.5.15-3.39C7.6 3.1 10.03 2.01 12.02 2z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://tiktok.com/",
    bg: "bg-black",
    iconColor: "text-white",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.9 2.9 0 0 1-5.2 1.74 2.9 2.9 0 0 1 2.31-4.64c.3 0 .58.04.86.13V9.4a6.33 6.33 0 0 0-5.39 10.69 6.33 6.33 0 0 0 10.86-4.43V8.56a8.16 8.16 0 0 0 4.77 1.52V6.69z" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/",
    bg: "bg-[#25D366]",
    iconColor: "text-white",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]" aria-hidden="true">
        <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.91-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.11.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.18-1.42-.08-.12-.28-.2-.57-.35zM12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88a9.82 9.82 0 0 1 6.99 2.9 9.82 9.82 0 0 1 2.9 7c0 5.44-4.44 9.87-9.9 9.87zm8.42-18.3A11.8 11.8 0 0 0 12.05 0C5.5 0 .17 5.33.17 11.89c0 2.1.55 4.14 1.59 5.94L.07 24l6.31-1.65a11.87 11.87 0 0 0 5.67 1.44h.01c6.54 0 11.87-5.33 11.87-11.89 0-3.18-1.24-6.16-3.48-8.4z" />
      </svg>
    ),
  },
];

const quickLinks = [
  { label: "الرئيسية", href: "/" },
  { label: "الباقات", href: "/packages" },
  { label: "حجوزاتي", href: "/booking" },
  { label: "صمم باقتك", href: "/booking/wizard" },
];

export default function Footer() {
  return (
    <footer className="relative mt-auto flex-shrink-0 bg-white border-t border-gray-100 text-on-surface">
      <div className="relative max-w-[1400px] mx-auto px-6 md:px-12 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-right">
            <Link href="/" className="inline-flex">
              <Image
                src="/Untitled-3.png"
                alt="Rawaes Logo"
                width={450}
                height={153}
                className="h-[54px] w-auto object-contain opacity-95 hover:opacity-100 transition-opacity"
              />
            </Link>
            <p className="text-sm leading-relaxed text-gray-500 max-w-xs">
              باقات سياحية فاخرة مصممة بعناية لتمنحك تجربة سفر استثنائية، من التخطيط حتى العودة.
            </p>
          </div>

          {/* Quick links */}
          <div className="flex flex-col items-center gap-4">
            <h3 className="text-sm font-bold tracking-widest text-primary">روابط سريعة</h3>
            <ul className="flex flex-col items-center gap-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div className="flex flex-col items-center md:items-end gap-4">
            <h3 className="text-sm font-bold tracking-widest text-primary">تابعنا</h3>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={`flex h-10 w-10 items-center justify-center rounded-full shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${social.bg} ${social.iconColor}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
            <p className="text-sm text-gray-500 text-center md:text-left">
              تواصل معنا عبر منصاتنا لأحدث العروض والوجهات
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 h-px w-full bg-gradient-to-l from-transparent via-gray-200 to-transparent" />

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <span>© {new Date().getFullYear()} معاون MOAWEN - جميع الحقوق محفوظة</span>

        </div>
      </div>
    </footer>
  );
}
