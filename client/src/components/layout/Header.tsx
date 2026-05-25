import { Link } from "wouter";

export default function Header() {
  return (
    <header className="w-full bg-white" dir="rtl">
      {/* Top Bar */}
      <div className="ooredoo-top-bar">
        <div className="ooredoo-container flex justify-between items-center">
          <div className="flex gap-6">
            <span className="font-bold text-red-600 border-b-2 border-red-600 pb-1 cursor-pointer">Personal</span>
            <span className="hover:text-red-600 cursor-pointer">Business</span>
          </div>
          <div className="flex gap-6 items-center">
            <span className="hover:text-red-600 cursor-pointer">Ooredoo website &gt;</span>
            <div className="flex items-center gap-2 cursor-pointer hover:text-red-600">
              <span className="font-bold">English</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="ooredoo-container py-4 flex justify-between items-center">
        <div className="flex items-center gap-10">
          <Link href="/">
            <img src="/ooredoo/ooredoo-logo.svg" alt="Ooredoo" className="h-12 cursor-pointer" />
          </Link>
          <nav className="hidden lg:flex gap-8">
            <span className="ooredoo-nav-item">O Plus (آجل الدفع)</span>
            <span className="ooredoo-nav-item">هلا (مسبق الدفع)</span>
            <span className="ooredoo-nav-item">باقات زائر</span>
            <span className="ooredoo-nav-item">باقات منزلي</span>
            <span className="ooredoo-nav-item">الأجهزة</span>
            <span className="ooredoo-nav-item active">الدفع السريع</span>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-red-600 text-white px-6 py-2 rounded-full text-sm font-bold cursor-pointer hover:bg-white hover:text-red-600 border-2 border-red-600 transition-all">
            MY OOREDOO
          </div>
        </div>
      </div>
      
      {/* Red Sub-Header */}
      <div className="bg-red-600 py-2 text-white text-sm font-bold">
        <div className="ooredoo-container">
          تسوق /إعادة شحن الرصيد / دفع الفواتير
        </div>
      </div>
    </header>
  );
}
