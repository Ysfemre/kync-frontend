"use client";

import { useState, useEffect } from "react";
import { useMapEvents } from "react-leaflet";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

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

export default function AdminPaneli() {
  const [aktifSekme, setAktifSekme] = useState("liste");
  const [ilanlar, setIlanlar] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [mesaj, setMesaj] = useState("");
  const [duzenlenecekId, setDuzenlenecekId] = useState<number | null>(null);
  const [mobilMenuAcik, setMobilMenuAcik] = useState(false);
  const [secilenDosyalar, setSecilenDosyalar] = useState<File[]>([]);
  const [mevcutFotograflar, setMevcutFotograflar] = useState<string[]>([]);

  const [form, setForm] = useState({
    ilan_turu: "konut",
    baslik: "",
    aciklama: "",
    fiyat: "",
    m2: "",
    il: "",
    ilce: "",
    enlem: 39.9334, // YENİ: Ankara Merkez Enlem
    boylam: 32.8597, // YENİ: Ankara Merkez Boylam
    tapu_durumu: "",
    imar_durumu: "",
    ilan_durumu: "satilik",
    oda_sayisi: "",
    banyo_sayisi: "",
    kat_sayisi: "",
    bulundugu_kat: "",
    bina_yasi: "",
    isinma_tipi: "",
    esya_durumu: "",
    cephe: "",
    asansor: "0",
  });

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

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setForm((prev) => ({
          ...prev,
          enlem: e.latlng.lat,
          boylam: e.latlng.lng,
        }));
      },
    });

    const customIcon = getCustomIcon();

    // @ts-ignore
    return form.enlem && customIcon ? (
      // @ts-ignore
      <Marker position={[form.enlem, form.boylam]} icon={customIcon} />
    ) : null;
  }

  useEffect(() => {
    if (aktifSekme === "liste") ilanlariGetir();
  }, [aktifSekme]);

  const ilanlariGetir = async () => {
    try {
      const res = await fetch("https://kync-api.onrender.com/ilanlar");
      const data = await res.json();

      const siraliIlanlar = data.ilanlar.sort((a: any, b: any) => {
        const tarihA = a.ilan_tarihi ? new Date(a.ilan_tarihi).getTime() : a.id;
        const tarihB = b.ilan_tarihi ? new Date(b.ilan_tarihi).getTime() : b.id;
        return tarihB - tarihA;
      });

      setIlanlar(siraliIlanlar);
    } catch (error) {
      console.error("İlanlar çekilemedi", error);
    }
  };

  const ilanSil = async (id: number) => {
    const onay = window.confirm(
      "Bu ilanı sistemden kalıcı olarak silmek istediğinize emin misiniz?",
    );
    if (!onay) return;
    try {
      const res = await fetch(`https://kync-api.onrender.com/ilanlar/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMesaj("İlan başarıyla silindi.");
        ilanlariGetir();
      }
    } catch (error) {
      setMesaj("Silme başarısız.");
    }
    setTimeout(() => setMesaj(""), 3000);
  };

  const ilanGuncelleModunaGec = async (ilan: any) => {
    setDuzenlenecekId(ilan.id);
    setForm({
      ilan_turu: ilan.ilan_turu || "konut",
      baslik: ilan.baslik || "",
      aciklama: ilan.aciklama || "",
      fiyat: ilan.fiyat?.toString() || "",
      m2: ilan.m2?.toString() || "",
      il: ilan.il || "",
      ilce: ilan.ilce || "",
      enlem: ilan.enlem || 39.9334,
      boylam: ilan.boylam || 32.8597,
      tapu_durumu: ilan.tapu_durumu || "",
      imar_durumu: ilan.imar_durumu || "",
      ilan_durumu: ilan.ilan_durumu || "satilik",
      oda_sayisi: ilan.oda_sayisi || "",
      banyo_sayisi: ilan.banyo_sayisi?.toString() || "",
      kat_sayisi: ilan.kat_sayisi?.toString() || "",
      bulundugu_kat: ilan.bulundugu_kat?.toString() || "",
      bina_yasi: ilan.bina_yasi?.toString() || "",
      isinma_tipi: ilan.isinma_tipi || "",
      esya_durumu: ilan.esya_durumu || "",
      cephe: ilan.cephe || "",
      asansor: ilan.asansor?.toString() || "0",
    });

    setSecilenDosyalar([]);
    setAktifSekme("ekle");

    if (ilan.kapak_resmi) {
      setMevcutFotograflar([ilan.kapak_resmi]);
    } else {
      setMevcutFotograflar([]);
    }

    try {
      const res = await fetch(`https://kync-api.onrender.com/ilanlar/${ilan.id}`);
      if (res.ok) {
        const detayliIlan = await res.json();

        let gelenGaleri =
          detayliIlan.fotograflar ||
          detayliIlan.resimler ||
          detayliIlan.galeri ||
          detayliIlan.images ||
          [];
        if (typeof gelenGaleri === "string") {
          try {
            gelenGaleri = JSON.parse(gelenGaleri);
          } catch (e) {
            gelenGaleri = [];
          }
        }

        const galeriUrls = gelenGaleri
          .map((f: any) =>
            typeof f === "object"
              ? f.fotograf_url ||
                f.url ||
                f.resim_url ||
                f.dosya_yolu ||
                f.image ||
                Object.values(f)[0]
              : f,
          )
          .filter(Boolean);

        let kapakDizisi = detayliIlan.kapak_resmi
          ? [detayliIlan.kapak_resmi]
          : [];
        const tumResimler = Array.from(
          new Set([...kapakDizisi, ...galeriUrls]),
        );

        setMevcutFotograflar(tumResimler as string[]);
      }
    } catch (error) {
      console.error("Detay fotoğrafları çekilirken hata oluştu:", error);
    }
  };

  const formSifirla = () => {
    setDuzenlenecekId(null);
    setForm({
      ilan_turu: "konut",
      baslik: "",
      aciklama: "",
      fiyat: "",
      m2: "",
      il: "",
      ilce: "",
      enlem: 39.9334, // YENİ: Sıfırlanınca Ankara'ya döner
      boylam: 32.8597, // YENİ: Sıfırlanınca Ankara'ya döner
      tapu_durumu: "",
      imar_durumu: "",
      ilan_durumu: "satilik",
      oda_sayisi: "",
      banyo_sayisi: "",
      kat_sayisi: "",
      bulundugu_kat: "",
      bina_yasi: "",
      isinma_tipi: "",
      esya_durumu: "",
      cephe: "",
      asansor: "0",
    });
    setSecilenDosyalar([]);
    setMevcutFotograflar([]);
  };

  const mevcutFotografiSil = (silinecekIndex: number) => {
    setMevcutFotograflar((prev) =>
      prev.filter((_, index) => index !== silinecekIndex),
    );
  };

  const ilanKaydet = async (e: React.FormEvent) => {
    e.preventDefault();
    setYukleniyor(true);

    if (!duzenlenecekId && secilenDosyalar.length < 1) {
      setMesaj("Lütfen yeni ilan eklerken en az 1 fotoğraf seçin.");
      setYukleniyor(false);
      setTimeout(() => setMesaj(""), 4000);
      return;
    }

    const temizForm = { ...form } as any;

    if (temizForm.ilan_turu === "arsa") {
      const konutAlanlari = [
        "oda_sayisi",
        "banyo_sayisi",
        "kat_sayisi",
        "bulundugu_kat",
        "bina_yasi",
        "isinma_tipi",
        "esya_durumu",
        "cephe",
        "asansor",
      ];
      konutAlanlari.forEach((alan) => delete temizForm[alan]);
    } else if (temizForm.ilan_turu === "konut") {
      delete temizForm.imar_durumu;
    } else if (temizForm.ilan_turu === "otomotiv") {
      const emlakAlanlari = [
        "oda_sayisi",
        "banyo_sayisi",
        "kat_sayisi",
        "bulundugu_kat",
        "bina_yasi",
        "isinma_tipi",
        "esya_durumu",
        "cephe",
        "asansor",
        "tapu_durumu",
        "imar_durumu",
      ];
      emlakAlanlari.forEach((alan) => delete temizForm[alan]);
    }

    const gercekSayisalAlanlar = ["fiyat", "m2", "enlem", "boylam"];

    for (const key in temizForm) {
      if (temizForm[key] === "") {
        temizForm[key] = null;
      } else if (
        temizForm[key] !== null &&
        !gercekSayisalAlanlar.includes(key)
      ) {
        temizForm[key] = String(temizForm[key]);
      } else if (
        temizForm[key] !== null &&
        gercekSayisalAlanlar.includes(key)
      ) {
        temizForm[key] = Number(temizForm[key]);
      }
    }

    if (duzenlenecekId) {
      temizForm.galeri = mevcutFotograflar;
    }

    try {
      const method = duzenlenecekId ? "PUT" : "POST";
      const url = duzenlenecekId
        ? `https://kync-api.onrender.com/ilanlar/${duzenlenecekId}`
        : "https://kync-api.onrender.com/ilan-ekle";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(temizForm),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Backend Hata Detayı:", errorData);
        setMesaj(`Hata: Lütfen alanları kontrol edin. İşlem başarısız.`);
        setYukleniyor(false);
        return;
      }

      const veri = await res.json();
      const guncelIlanId = duzenlenecekId || veri.ilan_id;

      if (secilenDosyalar.length > 0 && guncelIlanId) {
        const formData = new FormData();
        secilenDosyalar.forEach((dosya) => formData.append("dosyalar", dosya));
        await fetch(`https://kync-api.onrender.com/ilanlar/${guncelIlanId}/fotograf`, {
          method: "POST",
          body: formData,
        });
      }

      setMesaj(
        duzenlenecekId
          ? "İlan başarıyla güncellendi."
          : "İlan ve fotoğraflar eklendi.",
      );
      formSifirla();
      setAktifSekme("liste");
      ilanlariGetir();
    } catch (error) {
      setMesaj("Sunucu ile iletişimde hata oluştu.");
    }
    setYukleniyor(false);
    setTimeout(() => setMesaj(""), 4000);
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // YENİ: Admin paneli için Saat bilgisini de içeren detaylı tarih çevirici
  const formatiTarihSaat = (tarihString: string) => {
    if (!tarihString) return "Tarih Yok";
    try {
      const date = new Date(tarihString);
      return date.toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Geçersiz Tarih";
    }
  };

  const konutOzellikleri = [
    {
      label: "Oda Sayısı",
      name: "oda_sayisi",
      type: "text",
      placeholder: "3+1",
    },
    { label: "Banyo Sayısı", name: "banyo_sayisi", type: "number" },
    { label: "Bina Yaşı", name: "bina_yasi", type: "text" },
    { label: "Kat Sayısı", name: "kat_sayisi", type: "number" },
    { label: "Bulunduğu Kat", name: "bulundugu_kat", type: "text" },
    { label: "Isınma Tipi", name: "isinma_tipi", type: "text" },
    { label: "Cephe", name: "cephe", type: "text" },
    { label: "Eşya Durumu", name: "esya_durumu", type: "text" },
    { label: "Tapu Durumu", name: "tapu_durumu", type: "text" },
  ];

  const arsaOzellikleri = [
    { label: "Tapu Durumu", name: "tapu_durumu", type: "text" },
    { label: "İmar Durumu", name: "imar_durumu", type: "text" },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans">
      {mobilMenuAcik && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobilMenuAcik(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col ${mobilMenuAcik ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <span className="text-xl font-bold text-slate-800 tracking-tight">
            KYNC<span className="text-blue-600">Admin</span>
          </span>
          <button
            onClick={() => setMobilMenuAcik(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-slate-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4">
            Yönetim Paneli
          </p>
          <button
            onClick={() => {
              setAktifSekme("liste");
              formSifirla();
              setMobilMenuAcik(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${aktifSekme === "liste" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>{" "}
            Tüm İlanlar
          </button>
          <button
            onClick={() => {
              setAktifSekme("ekle");
              formSifirla();
              setMobilMenuAcik(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${aktifSekme === "ekle" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>{" "}
            Yeni İlan Ekle
          </button>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>{" "}
            Siteye Dön
          </Link>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobilMenuAcik(true)}
              className="lg:hidden p-1.5 -ml-1.5 text-slate-500 hover:bg-slate-100 rounded-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-slate-800">
              {aktifSekme === "liste"
                ? "Portföy Yönetimi"
                : duzenlenecekId
                  ? "İlanı Düzenle"
                  : "Yeni İlan Oluştur"}
            </h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            {mesaj && (
              <div
                className={`mb-6 p-4 border rounded-lg text-sm font-medium text-center shadow-sm ${mesaj.includes("Hata") ? "bg-red-50 text-red-700 border-red-100" : "bg-blue-50 text-blue-700 border-blue-100"}`}
              >
                {mesaj}
              </div>
            )}

            {aktifSekme === "liste" && (
              <div className="flex flex-col gap-3 sm:gap-4">
                {ilanlar.length > 0 ? (
                  ilanlar.map((ilan) => (
                    <div
                      key={ilan.id}
                      className="flex flex-row items-stretch bg-white border border-slate-200 rounded-xl p-3 sm:p-4 gap-3 sm:gap-5 hover:border-blue-300 hover:shadow-md transition-all duration-200 min-w-0"
                    >
                      <div className="w-20 h-20 sm:w-28 sm:h-24 relative flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden border border-slate-100">
                        {ilan.kapak_resmi ? (
                          <Image
                            src={`https://kync-api.onrender.com${ilan.kapak_resmi}`}
                            alt="İlan"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-[9px] sm:text-[11px] font-semibold tracking-widest text-slate-400 text-center px-1">
                            GÖRSEL
                            <br />
                            YOK
                          </div>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between min-w-0 gap-1 lg:gap-4">
                          <div className="flex-1 min-w-0">
                            <h3
                              className="text-sm sm:text-base font-bold text-slate-900 truncate"
                              title={ilan.baslik}
                            >
                              {ilan.baslik}
                            </h3>

                            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 mt-1 truncate">
                              <span className="uppercase font-bold tracking-widest text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                {ilan.ilan_durumu}
                              </span>
                              <span>•</span>
                              <span className="capitalize">
                                {ilan.ilan_turu}
                              </span>
                              <span className="hidden sm:inline">
                                {" "}
                                • {ilan.il || "Türkiye"} /{" "}
                                {ilan.ilce || "Türkiye"}
                              </span>
                            </div>

                            {/* YENİ: Saat bilgisini de içeren tarih gösterimi */}
                            <div className="text-[10px] sm:text-xs text-slate-400 mt-1.5 flex items-center gap-1 truncate font-medium">
                              <svg
                                className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Eklenme: {formatiTarihSaat(ilan.ilan_tarihi)}
                            </div>
                          </div>

                          <div className="flex-shrink-0 mt-1 lg:mt-0 text-left lg:text-right">
                            <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                              ₺{ilan.fiyat.toLocaleString("tr-TR")}
                            </div>
                            <div className="sm:hidden text-[10px] font-medium text-slate-400 mt-0.5 truncate max-w-[150px]">
                              {ilan.il || "Türkiye"} / {ilan.ilce || "Türkiye"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 mt-3 lg:mt-0">
                          <button
                            onClick={() => ilanGuncelleModunaGec(ilan)}
                            className="px-3 sm:px-4 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-md text-[11px] sm:text-xs font-bold uppercase tracking-wider hover:bg-slate-50 focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => ilanSil(ilan.id)}
                            className="px-3 sm:px-4 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-md text-[11px] sm:text-xs font-bold uppercase tracking-wider hover:bg-red-100 focus:ring-2 focus:ring-red-500 transition-all shadow-sm"
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
                    <svg
                      className="w-12 h-12 text-slate-300 mx-auto mb-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    <p className="text-slate-500 font-medium">
                      Henüz portföyde ilan bulunmuyor.
                    </p>
                  </div>
                )}
              </div>
            )}

            {aktifSekme === "ekle" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="mb-5 flex justify-start">
                  <button
                    onClick={() => {
                      setAktifSekme("liste");
                      formSifirla();
                    }}
                    className="group flex items-center gap-2.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:bg-slate-100 group-hover:border-slate-300 transition-all shadow-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                      </svg>
                    </div>
                    Listeye Geri Dön
                  </button>
                </div>

                <form onSubmit={ilanKaydet} className="space-y-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                      Temel Bilgiler
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      <div className="lg:col-span-2">
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">
                          İlan Başlığı
                        </label>
                        <input
                          required
                          type="text"
                          name="baslik"
                          value={form.baslik}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">
                          Fiyat (₺)
                        </label>
                        <input
                          required
                          type="number"
                          name="fiyat"
                          value={form.fiyat}
                          onChange={handleChange}
                          onWheel={(e) => e.currentTarget.blur()}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">
                          {form.ilan_turu === "otomotiv"
                            ? "Kilometre (KM)"
                            : "Büyüklük (m²)"}
                        </label>
                        <input
                          required
                          type="number"
                          name="m2"
                          value={form.m2}
                          onChange={handleChange}
                          onWheel={(e) => e.currentTarget.blur()}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">
                          İlan Türü
                        </label>
                        <select
                          name="ilan_turu"
                          value={form.ilan_turu}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        >
                          <option value="konut">Konut</option>
                          <option value="arsa">Arsa & Arazi</option>
                          <option value="otomotiv">Otomotiv</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">
                          Durum
                        </label>
                        <select
                          name="ilan_durumu"
                          value={form.ilan_durumu}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        >
                          <option value="satilik">Satılık</option>
                          <option value="kiralik">Kiralik</option>
                        </select>
                      </div>
                      <div className="lg:col-span-2">
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">
                          Detaylı Açıklama
                        </label>
                        <textarea
                          rows={4}
                          name="aciklama"
                          value={form.aciklama}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y"
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  {(form.ilan_turu === "konut" ||
                    form.ilan_turu === "arsa") && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                        Detaylı Özellikler (
                        {form.ilan_turu === "konut" ? "Konut" : "Arsa & Arazi"})
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {form.ilan_turu === "konut" && (
                          <>
                            {konutOzellikleri.map((field) => (
                              <div key={field.name}>
                                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                                  {field.label}
                                </label>
                                <input
                                  type={field.type}
                                  name={field.name}
                                  value={(form as any)[field.name]}
                                  onChange={handleChange}
                                  onWheel={(e) => e.currentTarget.blur()}
                                  placeholder={field.placeholder || ""}
                                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                              </div>
                            ))}
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                                Asansör
                              </label>
                              <select
                                name="asansor"
                                value={form.asansor}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                              >
                                <option value="0">Yok</option>
                                <option value="1">Var</option>
                              </select>
                            </div>
                          </>
                        )}
                        {form.ilan_turu === "arsa" && (
                          <>
                            {arsaOzellikleri.map((field) => (
                              <div key={field.name}>
                                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                                  {field.label}
                                </label>
                                <input
                                  type={field.type}
                                  name={field.name}
                                  value={(form as any)[field.name]}
                                  onChange={handleChange}
                                  onWheel={(e) => e.currentTarget.blur()}
                                  placeholder={(field as any).placeholder || ""}
                                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                      Konum Seçimi
                    </h3>

                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">
                          İl
                        </label>
                        <input
                          required
                          type="text"
                          name="il"
                          value={form.il}
                          onChange={handleChange}
                          placeholder="Örn: Ankara"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">
                          İlçe
                        </label>
                        <input
                          required
                          type="text"
                          name="ilce"
                          value={form.ilce}
                          onChange={handleChange}
                          placeholder="Örn: Çankaya"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="h-[350px] w-full rounded-lg overflow-hidden border border-slate-200 relative mb-4 z-0">
                      {/* @ts-ignore */}
                      <MapContainer
                        center={[form.enlem, form.boylam]}
                        zoom={13}
                        style={{ height: "100%", width: "100%" }}
                      >
                        {/* @ts-ignore */}
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <LocationMarker />
                      </MapContainer>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1 bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-100 text-sm">
                        <span className="text-slate-500 font-medium mr-2">
                          Enlem:
                        </span>
                        <span className="text-slate-900 font-mono">
                          {form.enlem.toFixed(6)}
                        </span>
                      </div>
                      <div className="flex-1 bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-100 text-sm">
                        <span className="text-slate-500 font-medium mr-2">
                          Boylam:
                        </span>
                        <span className="text-slate-900 font-mono">
                          {form.boylam.toFixed(6)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                      Görseller
                    </h3>

                    {duzenlenecekId && mevcutFotograflar.length > 0 && (
                      <div className="mb-6">
                        <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">
                          Mevcut Görseller
                        </p>
                        <div className="flex flex-wrap gap-4">
                          {mevcutFotograflar.map((foto, index) => {
                            const imgUrl = foto.startsWith("http")
                              ? foto
                              : `https://kync-api.onrender.com${foto}`;
                            return (
                              <div
                                key={index}
                                className="relative w-28 h-28 flex-shrink-0 rounded-lg border border-slate-200 shadow-sm group"
                              >
                                <Image
                                  src={imgUrl}
                                  alt={`Görsel ${index + 1}`}
                                  fill
                                  className="object-cover rounded-lg"
                                />
                                <button
                                  type="button"
                                  onClick={() => mevcutFotografiSil(index)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold shadow-md hover:bg-red-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none"
                                  title="Bu fotoğrafı kaldır"
                                >
                                  ✕
                                </button>
                                {index === 0 && (
                                  <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded shadow-sm font-medium tracking-wide">
                                    Kapak
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) =>
                          setSecilenDosyalar(Array.from(e.target.files || []))
                        }
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center justify-center pointer-events-none">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-10 w-10 text-slate-400 mb-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-sm font-medium text-slate-700">
                          Yeni dosyaları seçmek için tıklayın veya sürükleyin
                        </span>

                        {!duzenlenecekId && (
                          <span className="text-xs text-slate-500 mt-1">
                            İlk seçilen fotoğraf kapak fotoğrafı olarak kabul
                            edilir
                          </span>
                        )}

                        {secilenDosyalar.length > 0 && (
                          <span className="mt-3 inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold shadow-sm">
                            {secilenDosyalar.length} yeni dosya seçildi
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setAktifSekme("liste");
                        formSifirla();
                      }}
                      className="w-full sm:w-auto px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-50 focus:ring-2 focus:ring-slate-200 transition-all order-2 sm:order-1"
                    >
                      Vazgeç ve Geri Dön
                    </button>
                    <button
                      type="submit"
                      disabled={yukleniyor}
                      className="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-70 flex justify-center items-center order-1 sm:order-2"
                    >
                      {yukleniyor ? (
                        <span className="flex items-center gap-2">
                          <svg
                            className="animate-spin h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>{" "}
                          İşleniyor...
                        </span>
                      ) : duzenlenecekId ? (
                        "Değişiklikleri Kaydet"
                      ) : (
                        "İlanı Yayına Al"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
