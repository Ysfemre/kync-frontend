import Link from "next/link";

export default function Hakkimizda() {
  return (
    <div className="min-h-screen bg-white flex flex-col relative selection:bg-black selection:text-[#D4AF37]">
      {/* SOL ÜST VİTRİNE DÖN BUTONU (İletişim sayfasıyla birebir aynı) */}
      <div className="absolute top-8 left-8 lg:top-12 lg:left-12 z-10">
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

      {/* Merkez İçerik */}
      <div className="flex-1 flex items-center justify-center p-6 mt-20 md:mt-0">
        <div className="max-w-3xl text-center space-y-12">
          {/* Başlık Alanı */}
          <div className="space-y-4">
            <div className="inline-block px-4 py-1 bg-gray-100 rounded-full">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                Biz Kimiz?
              </span>
            </div>
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-[#0f172a]">
              KYNC <span className="text-[#D4AF37]">EMLAK VE OTOMOTİV</span>
            </h1>
          </div>

          {/* Açıklama */}
          <p className="text-lg md:text-2xl text-gray-600 font-medium leading-relaxed max-w-2xl mx-auto">
            Güven, kalite ve prestijin kesiştiği noktadayız. Yılların getirdiği
            tecrübeyle;
            <span className="text-black font-bold"> gayrimenkul</span>,
            <span className="text-black font-bold"> değerli arsa</span> ve
            <span className="text-black font-bold"> otomotiv</span>{" "}
            sektörlerinde en doğru yatırımı en şeffaf şekilde sizinle
            buluşturuyoruz.
          </p>

          {/* Bilgi Etiketleri */}
          <div className="flex flex-wrap justify-center gap-6 pt-6">
            <div className="flex items-center gap-2 text-gray-400 border-r border-gray-200 pr-6 last:border-0 last:pr-0">
              <span className="text-xl">🏢</span>
              <span className="text-xs font-bold uppercase tracking-widest">
                Konut & Ticari
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 border-r border-gray-200 pr-6 last:border-0 last:pr-0">
              <span className="text-xl">🌍</span>
              <span className="text-xs font-bold uppercase tracking-widest">
                Arsa & Arazi
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-xl">🚗</span>
              <span className="text-xs font-bold uppercase tracking-widest">
                Otomotiv
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
