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
      
      <main className="flex-grow">
        {/* Red Banner */}
        <div className="bg-red-600 py-2 text-white text-center text-sm font-bold">
          تسوق /إعادة شحن الرصيد / دفع الفواتير
        </div>

        <div className="container py-12 max-w-4xl">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">سداد فاتورة أو إعادة شحن</h1>
          <p className="text-center text-gray-600 mb-12 text-sm leading-relaxed">
            ادخل رقم Ooredoo أو رقم الخط الثابت أو رقم السجل التجاري لتتمكن من إعادة شحن رصيدك أو لسداد فاتورتك الشهرية. للأرقام التي تم إنهاؤها يمكنك استخدام رقم الحساب.
          </p>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            {/* Radio Options */}
            <div className="flex flex-wrap justify-center gap-8 mb-8">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="radio" 
                  name="type" 
                  checked={inputType === "msisdn"} 
                  onChange={() => setInputType("msisdn")}
                  className="w-5 h-5 accent-red-600"
                />
                <span className="text-sm font-bold text-gray-700 group-hover:text-red-600 transition-colors">رقم الهاتف النقال / الهاتف الثابت</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="radio" 
                  name="type" 
                  checked={inputType === "account"} 
                  onChange={() => setInputType("account")}
                  className="w-5 h-5 accent-red-600"
                />
                <span className="text-sm font-bold text-gray-700 group-hover:text-red-600 transition-colors">رقم الحساب</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="radio" 
                  name="type" 
                  checked={inputType === "cr"} 
                  onChange={() => setInputType("cr")}
                  className="w-5 h-5 accent-red-600"
                />
                <span className="text-sm font-bold text-gray-700 group-hover:text-red-600 transition-colors">ادخل رقم السجل التجاري</span>
              </label>
            </div>

            {/* Input Field */}
            <div className="max-w-md mx-auto">
              <input 
                type="text" 
                placeholder={inputType === "msisdn" ? "أدخل الرقم" : inputType === "account" ? "أدخل رقم الحساب" : "أدخل رقم السجل التجاري"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full border-b-2 border-gray-200 py-3 px-2 text-center text-xl focus:outline-none focus:border-red-600 transition-colors placeholder:text-gray-300"
              />
              
              <button 
                onClick={handleContinue}
                disabled={inputValue.length < 8}
                className="w-full mt-8 bg-red-600 text-white py-4 rounded-full text-lg font-bold hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                تابع
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            <div className="bg-gray-50 p-4 rounded-lg text-center cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="text-red-600 font-bold text-sm mb-1">هلا (مسبق الدفع)</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="text-red-600 font-bold text-sm mb-1">O Plus (آجل الدفع)</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="text-red-600 font-bold text-sm mb-1">الإنترنت المنزلي</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="text-red-600 font-bold text-sm mb-1">تتبع الطلب</div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
