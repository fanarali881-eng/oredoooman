import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function RechargePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col" dir="rtl">
      <Header />
      
      <main className="flex-grow">
        <div className="et_pb_section et_pb_section_19 prepaid-top-section et_section_regular py-10">
          <div className="ooredoo-container">
            <div className="et_pb_row et_pb_row_90">
              <div className="et_pb_column et_pb_column_4_4">
                <div id="plans_offer_text" className="et_pb_module et_pb_text et_pb_text_119 et_pb_text_align_right">
                  <div className="et_pb_text_inner">
                    <h2 className="text-[24px] font-medium text-[#221e20] mb-2">سداد فاتورة أو إعادة شحن</h2>
                    <p className="text-[14px] font-medium text-[#221e20] leading-[20px]">
                      ادخل رقم Ooredoo أو رقم الخط الثابت أو رقم السجل التجاري لتتمكن من إعادة شحن رصيدك أو لسداد فاتورتك الشهرية. للأرقام التي تم إنهاؤها يمكنك استخدام رقم الحساب.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="et_pb_section et_pb_section_20 shahry_plans_section postpaid_plans_section pdp_toggle_section et_section_regular pb-20">
          <div className="ooredoo-container">
            <div className="et_pb_row et_pb_row_91">
              <div className="et_pb_column et_pb_column_3_4">
                <div className="et_pb_module et_pb_code et_pb_code_3 type-radio-btn-section-et_pb_module mb-8">
                  <div className="et_pb_code_inner">
                    <div className="flex flex-wrap gap-8 justify-start">
                      <div className="flex items-center gap-2">
                        <input type="radio" className="w-4 h-4 accent-[#ed1c24]" defaultChecked id="mobile-fixedline-no" name="type" value="msisdn_fdn" />
                        <label htmlFor="mobile-fixedline-no" className="text-[14px] font-bold text-[#221e20] cursor-pointer">رقم الهاتف النقال / الهاتف الثابت</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="radio" className="w-4 h-4 accent-[#ed1c24]" id="account-no" name="type" value="account_number" />
                        <label htmlFor="account-no" className="text-[14px] font-bold text-[#221e20] cursor-pointer">رقم الحساب</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="radio" className="w-4 h-4 accent-[#ed1c24]" id="b2b-account" name="type" value="b2b_account" />
                        <label htmlFor="b2b-account" className="text-[14px] font-bold text-[#221e20] cursor-pointer">ادخل رقم السجل التجاري</label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="et_pb_module et_pb_code et_pb_code_4 mobile-number-input-section mb-6">
                  <div className="et_pb_code_inner">
                    <label className="block text-[12px] font-bold text-gray-400 mb-2">رقم الهاتف النقال / الهاتف الثابت / رقم الحساب *</label>
                    <input className="w-full max-w-[300px] border border-[#ccc] p-2 rounded-[4px] text-[14px] outline-none focus:border-[#ed1c24]" type="text" />
                  </div>
                </div>

                <div className="et_pb_module et_pb_code et_pb_code_5 recharge-btn-section">
                  <div className="et_pb_code_inner">
                    <a href="#" className="bg-[#ed1c24] text-white text-[14px] font-bold px-[14px] py-[4.2px] rounded-[25px] inline-block min-w-[120px] text-center leading-[30px] hover:opacity-90 transition-opacity">تابع</a>
                  </div>
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
