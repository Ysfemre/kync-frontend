"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [ilanlar, setIlanlar] = useState<any[]>([]);
  const [filtrelenmisIlanlar, setFiltrelenmisIlanlar] = useState<any[]>([]);
  const [anaKategori, setAnaKategori] = useState("konut");
  const [mobilFiltreAcik, setMobilFiltreAcik] = useState(false);
  const [aramaMetni, setAramaMetni] = useState("");

  const [sayfa, setSayfa] = useState(1);
  const sayfaBasiIlan = 10;

  const [filtreler, setFiltreler] = useState({
    ilan_durumu: "",
    oda_sayisi: "",
    minFiyat: "",
    maxFiyat: "",
    minM2: "",
    maxM2: "",
    il: "",
    ilce: "",
  });

  useEffect(() => {
    if (mobilFiltreAcik) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobilFiltreAcik]);

  useEffect(() => {
    const veriCek = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/ilanlar");
        const data = await res.json();
        setIlanlar(data.ilanlar);
      } catch (error) {
        console.error("Veri çekilemedi kanka:", error);
      }
    };
    veriCek();
  }, []);

  useEffect(() => {
    let sonuc = ilanlar.filter((ilan) => ilan.ilan_turu === anaKategori);

    if (aramaMetni.trim() !== "") {
      const aranan = aramaMetni.toLocaleLowerCase("tr-TR");
      sonuc = sonuc.filter(
        (ilan) =>
          (ilan.baslik &&
            ilan.baslik.toLocaleLowerCase("tr-TR").includes(aranan)) ||
          (ilan.aciklama &&
            ilan.aciklama.toLocaleLowerCase("tr-TR").includes(aranan)) ||
          (ilan.il || "Türkiye").toLocaleLowerCase("tr-TR").includes(aranan) ||
          (ilan.ilce || "Türkiye").toLocaleLowerCase("tr-TR").includes(aranan),
      );
    }

    if (filtreler.ilan_durumu) {
      sonuc = sonuc.filter(
        (ilan) => ilan.ilan_durumu === filtreler.ilan_durumu,
      );
    }
    if (anaKategori === "konut" && filtreler.oda_sayisi) {
      sonuc = sonuc.filter((ilan) => ilan.oda_sayisi === filtreler.oda_sayisi);
    }
    if (filtreler.minFiyat) {
      sonuc = sonuc.filter((ilan) => ilan.fiyat >= Number(filtreler.minFiyat));
    }
    if (filtreler.maxFiyat) {
      sonuc = sonuc.filter((ilan) => ilan.fiyat <= Number(filtreler.maxFiyat));
    }
    if (anaKategori === "arsa") {
      if (filtreler.minM2)
        sonuc = sonuc.filter((ilan) => ilan.m2 >= Number(filtreler.minM2));
      if (filtreler.maxM2)
        sonuc = sonuc.filter((ilan) => ilan.m2 <= Number(filtreler.maxM2));
    }

    // YENİ: İl ve İlçe aramasını akıllı metin kutusuna geri çevirdik
    if (filtreler.il.trim() !== "") {
      const arananIl = filtreler.il.toLocaleLowerCase("tr-TR").trim();
      sonuc = sonuc.filter((ilan) =>
        (ilan.il || "Türkiye").toLocaleLowerCase("tr-TR").includes(arananIl),
      );
    }
    if (filtreler.ilce.trim() !== "") {
      const arananIlce = filtreler.ilce.toLocaleLowerCase("tr-TR").trim();
      sonuc = sonuc.filter((ilan) =>
        (ilan.ilce || "Türkiye")
          .toLocaleLowerCase("tr-TR")
          .includes(arananIlce),
      );
    }

    sonuc.sort((a, b) => b.id - a.id);
    setFiltrelenmisIlanlar(sonuc);
    setSayfa(1);
  }, [filtreler, ilanlar, anaKategori, aramaMetni]);

  const filtreDegistir = (e: any) => {
    setFiltreler({ ...filtreler, [e.target.name]: e.target.value });
  };

  const kategoriSec = (kategori: string) => {
    setAnaKategori(kategori);
    setFiltreler({
      ilan_durumu: "",
      oda_sayisi: "",
      minFiyat: "",
      maxFiyat: "",
      minM2: "",
      maxM2: "",
      il: "",
      ilce: "",
    });
    setAramaMetni("");
  };

  const sonIlanIndex = sayfa * sayfaBasiIlan;
  const ilkIlanIndex = sonIlanIndex - sayfaBasiIlan;
  const gosterilenIlanlar = filtrelenmisIlanlar.slice(
    ilkIlanIndex,
    sonIlanIndex,
  );
  const toplamSayfa = Math.ceil(filtrelenmisIlanlar.length / sayfaBasiIlan);

  const tarihiBicimlendir = (tarihString: string) => {
    if (!tarihString) return <span className="text-gray-400">-</span>;
    try {
      const date = new Date(tarihString);
      const aylar = [
        "Ocak",
        "Şubat",
        "Mart",
        "Nisan",
        "Mayıs",
        "Haziran",
        "Temmuz",
        "Ağustos",
        "Eylül",
        "Ekim",
        "Kasım",
        "Aralık",
      ];
      const gun = date.getDate().toString().padStart(2, "0");
      const ay = aylar[date.getMonth()];
      const yil = date.getFullYear();
      return (
        <>
          {gun} {ay}
          <br />
          {yil}
        </>
      );
    } catch {
      return <span className="text-gray-400">-</span>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm py-4 px-6 md:px-8 transition-all">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 relative bg-[#111827] rounded-xl p-1.5 shadow-md flex items-center justify-center group-hover:shadow-lg transition-all">
              <Image
                src="/logo.png"
                alt="KYNC Logo"
                fill
                sizes="44px"
                className="object-contain p-1"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-extrabold tracking-widest text-[#111827] leading-none">
                KYNC
              </h1>
              <span className="text-[9px] font-bold tracking-[0.2em] text-black mt-1">
                EMLAK & OTOMOTİV
              </span>
            </div>
          </Link>
          <nav className="hidden md:flex gap-8 text-sm font-bold text-black">
            <Link
              href="/"
              className="text-[#111827] relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-[#111827] after:rounded-full"
            >
              Vitrin
            </Link>
            <Link
              href="/hakkimizda"
              className="hover:text-[#111827] transition-colors"
            >
              Hakkımızda
            </Link>
            <Link
              href="/iletisim"
              className="hover:text-[#111827] transition-colors"
            >
              İletişim
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 md:px-8 pt-8 pb-16 w-full">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-5 border-b border-slate-200 pb-6 w-full">
          <div className="relative w-full md:w-80 group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 text-slate-400 group-focus-within:text-slate-800 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="İlanlarda Ara..."
              value={aramaMetni}
              onChange={(e) => setAramaMetni(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition-all shadow-sm"
            />
          </div>
          <div className="bg-white p-1 rounded-lg border border-slate-300 flex w-full md:w-auto shadow-sm">
            {[
              { id: "konut", ad: "Konut" },
              { id: "arsa", ad: "Arsa & Arazi" },
              { id: "otomotiv", ad: "Otomotiv" },
            ].map((kat) => (
              <button
                key={kat.id}
                onClick={() => kategoriSec(kat.id)}
                className={`flex-1 md:flex-none whitespace-nowrap px-6 py-2 rounded-md text-sm font-bold transition-all duration-300 ${anaKategori === kat.id ? "bg-[#111827] text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                {kat.ad}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 relative">
          <button
            onClick={() => setMobilFiltreAcik(!mobilFiltreAcik)}
            className="lg:hidden w-full bg-white border border-slate-300 text-slate-900 py-3 rounded-lg font-bold shadow-sm flex justify-between items-center px-4 mb-2"
          >
            <span className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filtrele
            </span>
            <span className="text-slate-500 text-xl font-medium">
              {mobilFiltreAcik ? "−" : "+"}
            </span>
          </button>

          {mobilFiltreAcik && (
            <div
              className="fixed inset-0 bg-slate-900/60 z-[60] lg:hidden backdrop-blur-sm transition-opacity"
              onClick={() => setMobilFiltreAcik(false)}
            ></div>
          )}

          <aside
            className={`${
              mobilFiltreAcik
                ? "fixed inset-y-0 left-0 z-[70] w-[85%] max-w-sm overflow-y-auto bg-white p-5 shadow-2xl transition-transform duration-300 transform translate-x-0"
                : "hidden lg:block w-full lg:w-[240px] flex-shrink-0 h-fit sticky top-28"
            }`}
          >
            {mobilFiltreAcik && (
              <div className="flex justify-between items-center mb-6 lg:hidden border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-800">Filtreler</h2>
                <button
                  onClick={() => setMobilFiltreAcik(false)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="bg-white lg:p-5 lg:rounded-xl lg:border lg:border-slate-200 lg:shadow-sm">
              <h2 className="hidden lg:block text-xs font-bold mb-4 text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">
                Kriterler
              </h2>
              <div className="space-y-4">
                {/* YENİ: İl ve İlçe tekrar akıllı serbest metin kutusu oldu */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                    İl
                  </label>
                  <input
                    type="text"
                    name="il"
                    value={filtreler.il}
                    onChange={filtreDegistir}
                    placeholder="Örn: Ankara"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:border-slate-400 placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                    İlçe
                  </label>
                  <input
                    type="text"
                    name="ilce"
                    value={filtreler.ilce}
                    onChange={filtreDegistir}
                    placeholder="Örn: Çankaya"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:border-slate-400 placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                    İşlem Türü
                  </label>
                  <select
                    name="ilan_durumu"
                    value={filtreler.ilan_durumu}
                    onChange={filtreDegistir}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:border-slate-400"
                  >
                    <option value="">Tümü</option>
                    <option value="satilik">Satılık</option>
                    <option value="kiralik">Kiralık</option>
                  </select>
                </div>

                {anaKategori === "konut" && (
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                      Oda Sayısı
                    </label>
                    <select
                      name="oda_sayisi"
                      value={filtreler.oda_sayisi}
                      onChange={filtreDegistir}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:border-slate-400"
                    >
                      <option value="">Tümü</option>
                      <option value="1+0">1+0</option>
                      <option value="1+1">1+1</option>
                      <option value="2+1">2+1</option>
                      <option value="3+1">3+1</option>
                      <option value="4+1">4+1</option>
                    </select>
                  </div>
                )}

                {anaKategori === "arsa" && (
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                      Büyüklük (m²)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        name="minM2"
                        value={filtreler.minM2}
                        onChange={filtreDegistir}
                        placeholder="Min"
                        className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:border-slate-400"
                      />
                      <input
                        type="number"
                        name="maxM2"
                        value={filtreler.maxM2}
                        onChange={filtreDegistir}
                        placeholder="Max"
                        className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:border-slate-400"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                    Fiyat Aralığı (₺)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="minFiyat"
                      value={filtreler.minFiyat}
                      onChange={filtreDegistir}
                      placeholder="Min"
                      className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:border-slate-400"
                    />
                    <input
                      type="number"
                      name="maxFiyat"
                      value={filtreler.maxFiyat}
                      onChange={filtreDegistir}
                      placeholder="Max"
                      className="w-1/2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:border-slate-400"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setFiltreler({
                      ilan_durumu: "",
                      oda_sayisi: "",
                      minFiyat: "",
                      maxFiyat: "",
                      minM2: "",
                      maxM2: "",
                      il: "",
                      ilce: "",
                    });
                    setAramaMetni("");
                    if (mobilFiltreAcik) setMobilFiltreAcik(false);
                  }}
                  className="mt-4 w-full bg-slate-100 border border-slate-200 text-slate-600 py-3 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Filtreleri Sıfırla
                </button>

                {mobilFiltreAcik && (
                  <button
                    onClick={() => setMobilFiltreAcik(false)}
                    className="mt-2 w-full bg-slate-900 text-white py-3 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-slate-800 transition-all"
                  >
                    Sonuçları Göster
                  </button>
                )}
              </div>
            </div>
          </aside>

          <section className="flex-1 min-w-0">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
              <div className="hidden md:flex items-center bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-widest py-3 px-4">
                <div className="w-[140px] flex-shrink-0"></div>
                <div className="flex-1 pl-4">İlan Başlığı</div>
                <div className="w-16 text-center">m²</div>
                <div className="w-16 text-center">Oda</div>
                <div className="w-36 text-center">Fiyat</div>
                <div className="w-24 text-center">Tarih</div>
                <div className="w-32 text-center pr-2">İl / İlçe</div>
              </div>

              {gosterilenIlanlar.length > 0 ? (
                gosterilenIlanlar.map((ilan, index) => (
                  <Link
                    href={`/ilan/${ilan.id || 1}`}
                    key={index}
                    className={`flex flex-row items-center border-b border-slate-200 last:border-0 transition-colors hover:bg-yellow-50/50 cursor-pointer p-2.5 sm:p-3 gap-3 sm:gap-4 ${index % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}
                  >
                    <div className="w-[100px] sm:w-[140px] h-[75px] sm:h-[105px] relative flex-shrink-0 bg-slate-100 rounded-md border border-slate-200 overflow-hidden">
                      {ilan.kapak_resmi ? (
                        <Image
                          src={`http://127.0.0.1:8000${ilan.kapak_resmi}`}
                          alt={ilan.baslik}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-slate-300 tracking-widest text-center">
                          GÖRSEL YOK
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col md:flex-row md:items-center min-w-0 overflow-hidden">
                      <div className="flex-1 md:pl-2 min-w-0 pr-2">
                        <h3 className="text-[13px] sm:text-[15px] font-bold text-[#0056b3] truncate hover:underline">
                          {ilan.baslik}
                        </h3>

                        <div className="md:hidden flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-slate-500 font-medium">
                          <span className="truncate max-w-full">
                            {ilan.m2} m²
                            {anaKategori === "konut" &&
                              ilan.oda_sayisi &&
                              ` • ${ilan.oda_sayisi}`}
                            {` • ${ilan.il || "Türkiye"} / ${ilan.ilce || "Türkiye"}`}
                          </span>
                        </div>

                        <div className="md:hidden mt-1 text-[13px] sm:text-[15px] font-black text-[#e00000]">
                          {ilan.fiyat.toLocaleString("tr-TR")} TL
                        </div>
                      </div>

                      <div className="hidden md:flex items-center text-sm font-semibold text-slate-700 flex-shrink-0">
                        <div className="w-16 text-center">{ilan.m2}</div>
                        <div className="w-16 text-center">
                          {anaKategori === "konut"
                            ? ilan.oda_sayisi || "-"
                            : "-"}
                        </div>
                        <div className="w-36 text-center text-[#e00000] font-black text-[16px] whitespace-nowrap">
                          {ilan.fiyat.toLocaleString("tr-TR")} TL
                        </div>
                        <div className="w-24 text-center text-xs text-slate-600 leading-tight">
                          {tarihiBicimlendir(ilan.ilan_tarihi)}
                        </div>
                        <div className="w-32 text-center text-xs text-slate-700 pr-2 overflow-hidden text-ellipsis whitespace-nowrap">
                          {ilan.il || "Türkiye"}
                          <br />
                          {ilan.ilce || "Türkiye"}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="py-20 text-center px-4">
                  <h3 className="text-lg font-bold text-slate-900">
                    Sonuç Bulunamadı
                  </h3>
                  <p className="text-sm text-slate-500 mt-2">
                    Kriterlerinize uygun bir ilan mevcut değil.
                  </p>
                </div>
              )}
            </div>

            {toplamSayfa > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setSayfa(sayfa - 1)}
                  disabled={sayfa === 1}
                  className="px-3 py-1.5 rounded-md border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Önceki
                </button>

                {[...Array(toplamSayfa)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSayfa(i + 1)}
                    className={`w-8 h-8 rounded-md text-sm font-bold transition-colors ${sayfa === i + 1 ? "bg-[#111827] text-white border border-[#111827]" : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"}`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setSayfa(sayfa + 1)}
                  disabled={sayfa === toplamSayfa}
                  className="px-3 py-1.5 rounded-md border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sonraki
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="bg-[#111827] text-[#D4AF37] py-8 border-t-[3px] border-[#D4AF37] mt-auto">
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative bg-white rounded-lg p-1">
              <Image
                src="/logo.png"
                alt="KYNC Logo"
                fill
                sizes="40px"
                className="object-contain"
              />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-widest text-[#D4AF37] leading-none">
                KYNC
              </h2>
              <span className="text-[9px] text-[#D4AF37] tracking-[0.2em] font-medium">
                EMLAK & OTOMOTİV
              </span>
            </div>
          </div>
          <p className="text-[#D4AF37] text-xs font-medium text-center md:text-right">
            © {new Date().getFullYear()} KYNC Emlak & Otomotiv. Tüm hakları
            saklıdır.
            <br />
            <span className="text-[#D4AF37]">
              Güven, kalite ve prestijin adresi.
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}
