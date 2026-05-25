import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function RechargePage() {
  const [, setLocation] = useLocation();
  const [inputType, setInputType] = useState("msisdn_fdn");
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
        <div className="py-10 bg-white">
          <div className="ooredoo-container">
            <div className="mb-8">
              <h2 className="ooredoo-header-text">سداد فاتورة أو إعادة شحن</h2>
              <p className="ooredoo-sub-text">
                ادخل رقم Ooredoo أو رقم الخط الثابت أو رقم السجل التجاري لتتمكن من إعادة شحن رصيدك أو لسداد فاتورتك الشهرية. للأرقام التي تم إنهاؤها يمكنك استخدام رقم الحساب.
              </p>
            </div>

            <div className="py-8">
              {/* Radio Options Section */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="mobile-fixedline-no" 
                    name="type" 
                    value="msisdn_fdn"
                    checked={inputType === "msisdn_fdn"}
                    onChange={() => setInputType("msisdn_fdn")}
                    className="w-4 h-4 accent-red-600"
                  />
                  <label htmlFor="mobile-fixedline-no" className="ooredoo-radio-label">رقم الهاتف النقال / الهاتف الثابت</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="account-no" 
                    name="type" 
                    value="account_number"
                    checked={inputType === "account_number"}
                    onChange={() => setInputType("account_number")}
                    className="w-4 h-4 accent-red-600"
                  />
                  <label htmlFor="account-no" className="ooredoo-radio-label">رقم الحساب</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="b2b-account" 
                    name="type" 
                    value="b2b_account"
                    checked={inputType === "b2b_account"}
                    onChange={() => setInputType("b2b_account")}
                    className="w-4 h-4 accent-red-600"
                  />
                  <label htmlFor="b2b-account" className="ooredoo-radio-label">ادخل رقم السجل التجاري</label>
                </div>
              </div>

              {/* Input Section */}
              <div className="flex flex-col gap-4">
                <label className="text-xs font-bold text-gray-400 hidden">رقم الهاتف النقال / الهاتف الثابت / رقم الحساب *</label>
                <input 
                  type="text" 
                  className="ooredoo-input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder=""
                />
                <div className="mt-4">
                  <button 
                    onClick={handleContinue}
                    className="ooredoo-btn-red"
                  >
                    تابع
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
