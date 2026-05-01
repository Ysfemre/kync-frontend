"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Harita bileşenlerini dinamik yüklüyoruz (Next.js'in çökmesini engellemek için)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);

export default function IlanDetay() {
  const params = useParams();
  const ilanId = params?.id;

  const [ilan, setIlan] = useState<any>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [aktifIndeks, setAktifIndeks] = useState(0);
  const [tamEkran, setTamEkran] = useState(false);

  // Görünmez iğne (marker) sorununu çözen fonksiyon
  const getCustomIcon = () => {
    if (typeof window === "undefined") return null;
    const L = require("leaflet");
    return new L.Icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
  };

  // İlan verisini çekme
  useEffect(() => {
    if (!ilanId) return;
    const ilanGetir = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/ilanlar/${ilanId}`);
        const data = await res.json();
        if (data.ilan_detayi) {
          setIlan(data.ilan_detayi);
        }
      } catch (error) {
        console.error("Hata:", error);
      } finally {
        setYukleniyor(false);
      }
    };
    ilanGetir();
  }, [ilanId]);

  // Fotoğraf geçiş fonksiyonları
  const sonrakiResim = useCallback(() => {
    if (ilan?.galeri) {
      setAktifIndeks((prev) =>
        prev === ilan.galeri.length - 1 ? 0 : prev + 1,
      );
    }
  }, [ilan]);

  const oncekiResim = useCallback(() => {
    if (ilan?.galeri) {
      setAktifIndeks((prev) =>
        prev === 0 ? ilan.galeri.length - 1 : prev - 1,
      );
    }
  }, [ilan]);

  // Klavye ok tuşları ve ESC ile kontrol
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") sonrakiResim();
      if (e.key === "ArrowLeft") oncekiResim();
      if (e.key === "Escape" && tamEkran) setTamEkran(false);
    };

    if (tamEkran) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [sonrakiResim, oncekiResim, tamEkran]);

  // WhatsApp'a yönlendirme
  const handleWhatsAppClick = () => {
    const url = window.location.href;
    const mesaj = `${url}\nİlan hakkında daha fazla bilgi alabilir miyim?`;
    const encodedMesaj = encodeURIComponent(mesaj);
    window.open(`https://wa.me/905316156480?text=${encodedMesaj}`, "_blank");
  };

  if (yukleniyor)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] text-gray-500 font-medium tracking-wide">
        Portföy yükleniyor, lütfen bekleyin...
      </div>
    );

  if (!ilan)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] text-gray-800 font-bold tracking-widest text-xl">
        PORTFÖY BULUNAMADI
      </div>
    );

  // --- KRİTİK GÜNCELLEME: AKILLI ÖZELLİK LİSTESİ ---

  // 1. Temel Özellikler (Tüm ilan tiplerinde ortak olanlar)
  const ilanOzellikleri: any[] = [
    { etiket: "İlan No", deger: ilan.id ? `#${ilan.id}` : null },
    {
      etiket: "İlan Tarihi",
      deger: ilan.ilan_tarihi
        ? new Date(ilan.ilan_tarihi).toLocaleDateString("tr-TR")
        : null,
    },
    // YENİ EKLENEN KISIM: İL VE İLÇE
    {
      etiket: "Konum",
      deger: ilan.il && ilan.ilce ? `${ilan.il} / ${ilan.ilce}` : null,
    },
    {
      etiket: ilan.ilan_turu === "otomotiv" ? "Kilometre" : "Büyüklük",
      deger: ilan.m2,
      birim: ilan.ilan_turu === "otomotiv" ? "KM" : "m²",
    },
  ];

  // 2. İlan türüne göre listeye dinamik ekleme yapıyoruz
  if (ilan.ilan_turu === "konut") {
    ilanOzellikleri.push(
      { etiket: "Oda Sayısı", deger: ilan.oda_sayisi },
      { etiket: "Banyo Sayısı", deger: ilan.banyo_sayisi },
      { etiket: "Kat Sayısı", deger: ilan.kat_sayisi },
      { etiket: "Bulunduğu Kat", deger: ilan.bulundugu_kat },
      { etiket: "Bina Yaşı", deger: ilan.bina_yasi },
      { etiket: "Isınma Tipi", deger: ilan.isinma_tipi },
      { etiket: "Eşya Durumu", deger: ilan.esya_durumu },
      { etiket: "Cephe", deger: ilan.cephe },
      { etiket: "Tapu Durumu", deger: ilan.tapu_durumu },
      
      {
        etiket: "Asansör",
        deger:
          ilan.asansor !== null && ilan.asansor !== undefined
            ? ilan.asansor == 1
              ? "Var"
              : "Yok"
            : null,
      },
    );
  } else if (ilan.ilan_turu === "arsa") {
    ilanOzellikleri.push(
      { etiket: "Tapu Durumu", deger: ilan.tapu_durumu },
      { etiket: "İmar Durumu", deger: ilan.imar_durumu },
    );
  }
  // Otomotiv için şu an ekstra alan göndermediğimizden otomatik olarak sadece temel özellikler (KM vb.) görünecektir.

  const customIcon = getCustomIcon();

  return (
    <div className="flex flex-col min-h-screen lg:h-screen bg-[#FAFAFA] text-slate-800 font-sans selection:bg-slate-800 selection:text-[#D4AF37]">
      {/* HEADER */}
      <header className="sticky top-0 flex-shrink-0 h-20 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-6 lg:px-16 flex items-center justify-between z-40">
        <Link
          href="/"
          className="flex items-center gap-3 transition-transform hover:opacity-80"
        >
          <div className="w-11 h-11 relative bg-slate-900 rounded-lg flex items-center justify-center shadow-md">
            <Image
              src="/logo.png"
              alt="KYNC Logo"
              fill
              className="object-contain p-1.5"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-[0.25em] leading-none text-slate-900">
              KYNC
            </span>
          </div>
        </Link>
        <Link
          href="/"
          className="group flex items-center gap-2 px-5 py-2.5 lg:px-6 bg-slate-900 text-white rounded-full text-[10px] lg:text-xs font-semibold uppercase tracking-widest hover:bg-[#D4AF37] hover:text-slate-900 transition-colors duration-300 shadow-sm"
        >
          <svg
            className="w-4 h-4 transition-transform group-hover:-translate-x-1"
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
          <span className="hidden sm:inline">Vitrine Dön</span>
        </Link>
      </header>

      {/* ANA İÇERİK */}
      <main className="flex-1 flex flex-col lg:flex-row w-full lg:overflow-hidden">
        {/* SOL: GALERİ ALANI */}
        <div className="w-full lg:w-[60%] h-[60vh] lg:h-full flex flex-col bg-[#F3F4F6] relative p-4 lg:p-8">
          <div
            className="flex-1 w-full relative bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden flex items-center justify-center mb-4 cursor-zoom-in group"
            onClick={() => setTamEkran(true)}
            title="Büyütmek için tıklayın"
          >
            {ilan.galeri && ilan.galeri.length > 0 ? (
              <>
                <Image
                  key={aktifIndeks}
                  src={`http://127.0.0.1:8000${ilan.galeri[aktifIndeks]}`}
                  alt={`${ilan.baslik} - Görsel ${aktifIndeks + 1}`}
                  fill
                  className="object-contain p-2 lg:p-4 transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors duration-300 flex items-center justify-center">
                  <div className="bg-white/80 backdrop-blur-sm p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 shadow-lg">
                    <svg
                      className="w-6 h-6 text-slate-800"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                      />
                    </svg>
                  </div>
                </div>
              </>
            ) : (
              <span className="text-sm font-medium text-slate-400 tracking-widest uppercase">
                Görsel Bulunmuyor
              </span>
            )}
          </div>

          {ilan.galeri && ilan.galeri.length > 1 && (
            <div className="flex items-center justify-between w-full h-16 px-1 lg:px-2">
              <button
                onClick={oncekiResim}
                className="w-10 h-10 lg:w-12 lg:h-12 flex-shrink-0 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-sm text-slate-600 hover:text-slate-900 hover:border-slate-400 hover:scale-105 transition-all focus:outline-none"
              >
                <svg
                  className="w-4 h-4 lg:w-5 lg:h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div className="flex gap-2 lg:gap-3 overflow-x-auto scrollbar-hide px-4">
                {ilan.galeri.map((_: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setAktifIndeks(i)}
                    className={`relative w-12 h-12 lg:w-14 lg:h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      aktifIndeks === i
                        ? "border-slate-800 opacity-100 scale-100"
                        : "border-transparent opacity-50 hover:opacity-100 scale-95"
                    }`}
                  >
                    <Image
                      src={`http://127.0.0.1:8000${ilan.galeri[i]}`}
                      alt={`Mini ${i}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>

              <button
                onClick={sonrakiResim}
                className="w-10 h-10 lg:w-12 lg:h-12 flex-shrink-0 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-sm text-slate-600 hover:text-slate-900 hover:border-slate-400 hover:scale-105 transition-all focus:outline-none"
              >
                <svg
                  className="w-4 h-4 lg:w-5 lg:h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* SAĞ: BİLGİ PANELİ */}
        <div className="w-full lg:w-[40%] h-auto lg:h-full bg-white px-6 py-8 lg:px-10 lg:py-10 flex flex-col lg:overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-slate-100 text-slate-800 text-[10px] font-bold uppercase tracking-widest rounded-md border border-slate-200">
              {ilan.ilan_durumu}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">
              {ilan.ilan_turu}
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2 tracking-tight leading-snug">
            {ilan.baslik}
          </h1>

          <div className="text-2xl font-semibold text-[#D4AF37] mb-6 flex items-center gap-1.5">
            <span className="text-lg font-medium">₺</span>
            {ilan.fiyat?.toLocaleString("tr-TR")}
          </div>

          {/* İLAN ÖZELLİKLERİ LİSTESİ - DİNAMİK */}
          <div className="flex flex-col mb-6 border-t border-slate-900">
            {ilanOzellikleri
              .filter(
                (ozellik) =>
                  ozellik.deger !== null &&
                  ozellik.deger !== undefined &&
                  ozellik.deger !== "",
              )
              .map((ozellik, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2.5 border-b border-slate-900"
                >
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                    {ozellik.etiket}
                  </span>
                  <span className="text-base font-bold text-slate-900 text-right max-w-[60%]">
                    {ozellik.deger}
                    {ozellik.birim && (
                      <span className="text-xs font-semibold text-slate-500 ml-1">
                        {ozellik.birim}
                      </span>
                    )}
                  </span>
                </div>
              ))}
          </div>

          <div className="flex-1 mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-2">
              Açıklama
            </h3>
            <p className="text-sm font-medium leading-relaxed text-slate-600 whitespace-pre-wrap">
              {ilan.aciklama || "Bu mülk için henüz bir açıklama eklenmemiş."}
            </p>
          </div>

          {/* HARİTA GÖSTERİMİ */}
          {ilan.enlem && ilan.boylam && (
            <div className="mb-8 flex-shrink-0">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">
                Haritada Konum
              </h3>
              <div className="h-[250px] w-full rounded-2xl overflow-hidden shadow-inner border border-gray-200 relative z-10">
                {/* @ts-ignore */}
                <MapContainer
                  key="{ilan.id}"
                  center={[ilan.enlem, ilan.boylam]}
                  zoom={15}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={false}
                >
                  {/* @ts-ignore */}
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {/* @ts-ignore */}
                  {customIcon && (
                    <Marker
                      position={[ilan.enlem, ilan.boylam]}
                      icon={customIcon}
                    />
                  )}
                </MapContainer>
              </div>
            </div>
          )}

          <button
            onClick={handleWhatsAppClick}
            className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-white py-3.5 lg:py-4 rounded-xl font-bold text-xs uppercase tracking-[0.15em] hover:bg-[#128C7E] transition-colors duration-300 shadow-md shadow-[#25D366]/20 focus:outline-none focus:ring-4 focus:ring-green-100 mt-auto flex-shrink-0"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            İletişime Geç
          </button>
        </div>
      </main>

      {/* TAM EKRAN LIGHTBOX */}
      {tamEkran && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-xl flex flex-col items-center justify-center transition-all duration-500">
          <button
            onClick={() => setTamEkran(false)}
            className="absolute top-6 right-6 lg:top-10 lg:right-10 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div
            className="relative w-full max-w-6xl h-[70vh] lg:h-[85vh] flex items-center justify-center px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={`http://127.0.0.1:8000${ilan.galeri[aktifIndeks]}`}
              alt={`${ilan.baslik} - Tam Ekran`}
              fill
              className="object-contain"
              quality={100}
            />
          </div>

          {ilan.galeri && ilan.galeri.length > 1 && (
            <div className="absolute bottom-8 lg:bottom-12 flex items-center gap-8 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
              <button
                onClick={oncekiResim}
                className="text-white/70 hover:text-white transition-colors p-2"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <span className="text-white text-sm font-medium tracking-widest">
                {aktifIndeks + 1} / {ilan.galeri.length}
              </span>
              <button
                onClick={sonrakiResim}
                className="text-white/70 hover:text-white transition-colors p-2"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
