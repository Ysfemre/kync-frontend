import Link from "next/link";

export default function Iletisim() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] font-sans relative selection:bg-slate-800 selection:text-[#D4AF37]">
      {/* SOL ÜST VİTRİNE DÖN BUTONU */}
      <div className="absolute top-8 left-8 lg:top-12 lg:left-12">
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-full text-[10px] lg:text-xs font-semibold uppercase tracking-widest hover:bg-[#D4AF37] hover:text-slate-900 transition-colors duration-300 shadow-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          VİTRİNE DÖN
        </Link>
      </div>

      {/* MERKEZ İÇERİK */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        {/* ÜST ETİKET */}
        <div className="mb-6 px-4 py-1.5 bg-slate-100 rounded-full">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            BİZE ULAŞIN
          </span>
        </div>

        {/* BAŞLIK */}
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight text-center mb-12">
          İLETİŞİM <span className="text-[#D4AF37]">BİLGİLERİ</span>
        </h1>

        {/* İLETİŞİM LİNKLERİ (Gerçek İkonlarla) */}
        <div className="flex flex-col gap-8 items-center">
          {/* E-Posta */}
          <a
            href="mailto:info@kync.com"
            className="group flex items-center gap-4 text-lg md:text-xl font-medium text-slate-600 hover:text-[#D4AF37] transition-all"
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-200/50 group-hover:bg-[#D4AF37]/10 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-slate-700 group-hover:text-[#D4AF37] transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            info@kync.com
          </a>

          {/* Instagram */}
          <a
            href="https://instagram.com/kyncemlak"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 text-lg md:text-xl font-medium text-slate-600 hover:text-[#D4AF37] transition-all"
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-200/50 group-hover:bg-[#D4AF37]/10 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-slate-700 group-hover:text-[#D4AF37] transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </div>
            @kyncemlak
          </a>
        </div>
      </main>
    </div>
  );
}
