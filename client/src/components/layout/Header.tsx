import { Link } from "wouter";

export default function Header() {
  return (
    <header className="w-full bg-white border-b border-gray-100" dir="rtl">
      {/* Top Bar */}
      <div className="bg-gray-50 py-2 text-xs text-gray-600">
        <div className="container flex justify-between items-center">
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-red-600">Personal</span>
            <span className="cursor-pointer hover:text-red-600">Business</span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="cursor-pointer hover:text-red-600">Ooredoo website &gt;</span>
            <span className="cursor-pointer hover:text-red-600 font-bold">English</span>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="container py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link href="/">
            <img src="/ooredoo/ooredoo-logo.svg" alt="Ooredoo" className="h-10 cursor-pointer" />
          </Link>
          <nav className="hidden lg:flex gap-6 text-sm font-bold text-gray-800">
            <span className="cursor-pointer hover:text-red-600">O Plus (آجل الدفع)</span>
            <span className="cursor-pointer hover:text-red-600">هلا (مسبق الدفع)</span>
            <span className="cursor-pointer hover:text-red-600">باقات زائر</span>
            <span className="cursor-pointer hover:text-red-600">باقات منزلي</span>
            <span className="cursor-pointer hover:text-red-600">الأجهزة</span>
            <span className="cursor-pointer hover:text-red-600 text-red-600">الدفع السريع</span>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold cursor-pointer hover:bg-red-700">
            MY OOREDOO
          </div>
        </div>
      </div>
    </header>
  );
}
