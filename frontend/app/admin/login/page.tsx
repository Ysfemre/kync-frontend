import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ hata?: string }> | { hata?: string };
}) {
  const params = await searchParams;

  async function girisYap(formData: FormData) {
    "use server";

    const sifre = formData.get("sifre");
    const beniHatirla = formData.get("beni_hatirla"); // Kutucuk işaretli mi?
    const dogruSifre = "Kync2026!";

    if (sifre === dogruSifre) {
      const cookieStore = await cookies();

      // Beni hatırla seçiliyse 30 gün, değilse undefined (Tarayıcı kapanana kadar)
      const gecerlilikSuresi =
        beniHatirla === "evet" ? 60 * 60 * 24 * 30 : undefined;

      cookieStore.set("kync_admin_yetki", "onaylandi", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: gecerlilikSuresi,
        path: "/",
      });
      redirect("/admin");
    } else {
      redirect("/admin/login?hata=1");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans text-slate-800">
      <div className="bg-white p-8 border border-slate-200 rounded-xl shadow-sm w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-slate-900 tracking-widest">
            KYNC
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
            Yönetim Paneli
          </p>
        </div>

        {params?.hata && (
          <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-lg text-center mb-5 border border-red-100">
            Hatalı şifre girdiniz!
          </div>
        )}

        <form action={girisYap} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1">
              Yönetici Şifresi
            </label>
            <input
              type="password"
              name="sifre"
              required
              autoFocus
              placeholder="••••••••"
              className="w-full border border-slate-300 p-3 rounded-lg outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all text-sm font-medium"
            />
          </div>

          {/* Beni Hatırla Kutucuğu */}
          <div className="flex items-center gap-2 ml-1">
            <input
              type="checkbox"
              id="beni_hatirla"
              name="beni_hatirla"
              value="evet"
              className="w-4 h-4 text-slate-900 bg-slate-100 border-slate-300 rounded focus:ring-slate-900 cursor-pointer"
            />
            <label
              htmlFor="beni_hatirla"
              className="text-xs font-medium text-slate-500 cursor-pointer"
            >
              Oturumumu açık tut
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white p-3 rounded-lg font-bold text-sm tracking-wide hover:bg-slate-800 transition-colors mt-2"
          >
            Sisteme Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
}
