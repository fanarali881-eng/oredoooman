import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function RechargePage() {
  const [, setLocation] = useLocation();
  const [inputType, setInputType] = useState("msisdn");
  const [inputValue, setInputValue] = useState("");

  const handleContinue = () => {
    if (inputValue.length >= 8) {
      setLocation("/summary-payment");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col" dir="rtl">
      <Header />
      
      <main className="flex-grow py-16">
        <div className="ooredoo-container max-w-4xl text-center">
          <h1 className="ooredoo-header-text">سداد فاتورة أو إعادة شحن</h1>
          <p className="ooredoo-sub-text mb-12 max-w-3xl mx-auto">
            ادخل رقم Ooredoo أو رقم الخط الثابت أو رقم السجل التجاري لتتمكن من إعادة شحن رصيدك أو لسداد فاتورتك الشهرية. للأرقام التي تم إنهاؤها يمكنك استخدام رقم الحساب.
          </p>

          <div className="bg-white p-10 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.05)] border border-gray-50">
            {/* Radio Options */}
            <div className="flex flex-wrap justify-center gap-10 mb-10">
              <label className="ooredoo-radio-label">
                <input 
                  type="radio" 
                  name="type" 
                  checked={inputType === "msisdn"} 
                  onChange={() => setInputType("msisdn")}
                  className="ooredoo-radio-input"
                />
                <span>رقم الهاتف النقال / الهاتف الثابت</span>
              </label>
              <label className="ooredoo-radio-label">
                <input 
                  type="radio" 
                  name="type" 
                  checked={inputType === "account"} 
                  onChange={() => setInputType("account")}
                  className="ooredoo-radio-input"
                />
                <span>رقم الحساب</span>
              </label>
              <label className="ooredoo-radio-label">
                <input 
                  type="radio" 
                  name="type" 
                  checked={inputType === "cr"} 
                  onChange={() => setInputType("cr")}
                  className="ooredoo-radio-input"
                />
                <span>ادخل رقم السجل التجاري</span>
              </label>
            </div>

            {/* Input Field */}
            <div className="max-w-md mx-auto space-y-10">
              <input 
                type="text" 
                placeholder={inputType === "msisdn" ? "أدخل الرقم" : inputType === "account" ? "أدخل رقم الحساب" : "أدخل رقم السجل التجاري"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="ooredoo-input"
              />
              
              <button 
                onClick={handleContinue}
                disabled={inputValue.length < 8}
                className="ooredoo-btn-red w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                تابع
              </button>
            </div>
          </div>

          {/* Quick Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 hover:border-red-600 transition-all cursor-pointer group">
              <span className="text-red-600 font-bold group-hover:text-red-700">هلا (مسبق الدفع)</span>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 hover:border-red-600 transition-all cursor-pointer group">
              <span className="text-red-600 font-bold group-hover:text-red-700">O Plus (آجل الدفع)</span>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 hover:border-red-600 transition-all cursor-pointer group">
              <span className="text-red-600 font-bold group-hover:text-red-700">الإنترنت المنزلي</span>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 hover:border-red-600 transition-all cursor-pointer group">
              <span className="text-red-600 font-bold group-hover:text-red-700">تتبع الطلب</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
