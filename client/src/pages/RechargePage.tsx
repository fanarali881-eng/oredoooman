import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function RechargePage() {
  return (
    <div id="page-container" className="et-animated-content" dir="rtl">
      <Header />
      
      <div id="et-main-area">
        <div id="main-content">
          <article id="post-123" className="post-123 page type-page status-publish hentry">
            <div className="entry-content">
              <div className="et-l et-l--post">
                <div className="et_builder_inner_content et_pb_gutters3">
                  
                  <div className="et_pb_section et_pb_section_19 prepaid-top-section et_section_regular">
                    <div className="et_pb_row et_pb_row_90">
                      <div className="et_pb_column et_pb_column_4_4 et_pb_column_115 et_pb_css_mix_blend_mode_passthrough et-last-child">
                        <div id="plans_offer_text" className="et_pb_module et_pb_text et_pb_text_119 et_pb_text_align_right et_pb_bg_layout_light">
                          <div className="et_pb_text_inner">
                            <h2 className="plan-header-section">سداد فاتورة أو إعادة شحن</h2>
                            <p className="plan-header-text">ادخل رقم Ooredoo أو رقم الخط الثابت أو رقم السجل التجاري لتتمكن من إعادة شحن رصيدك أو لسداد فاتورتك الشهرية. للأرقام التي تم إنهاؤها يمكنك استخدام رقم الحساب.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="et_pb_section et_pb_section_20 shahry_plans_section postpaid_plans_section pdp_toggle_section et_section_regular">
                    <div className="et_pb_row et_pb_row_91">
                      <div className="et_pb_column et_pb_column_4_4 et_pb_column_116 et_pb_css_mix_blend_mode_passthrough et-last-child">
                        
                        <div className="et_pb_module et_pb_code et_pb_code_3 type-radio-btn-section-et_pb_module">
                          <div className="et_pb_code_inner">
                            <div className="type-radio-btn-section">
                              <div className="radio-item" style={{ display: "inline-block", marginLeft: "20px" }}>
                                <input type="radio" id="msisdn_fdn" name="recharge_type" value="msisdn_fdn" defaultChecked style={{ accentColor: "#ed1c24" }} />
                                <label htmlFor="msisdn_fdn" style={{ fontWeight: "bold", marginRight: "5px" }}>رقم الهاتف النقال / الهاتف الثابت</label>
                              </div>
                              <div className="radio-item" style={{ display: "inline-block", marginLeft: "20px" }}>
                                <input type="radio" id="account_number" name="recharge_type" value="account_number" style={{ accentColor: "#ed1c24" }} />
                                <label htmlFor="account_number" style={{ fontWeight: "bold", marginRight: "5px" }}>رقم الحساب</label>
                              </div>
                              <div className="radio-item" style={{ display: "inline-block" }}>
                                <input type="radio" id="b2b_account" name="recharge_type" value="b2b_account" style={{ accentColor: "#ed1c24" }} />
                                <label htmlFor="b2b_account" style={{ fontWeight: "bold", marginRight: "5px" }}>ادخل رقم السجل التجاري</label>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="et_pb_module et_pb_code et_pb_code_4 mobile-number-input-section">
                          <div className="et_pb_code_inner">
                            <div className="input-wrapper" style={{ marginTop: "20px" }}>
                              <label style={{ display: "block", fontSize: "12px", color: "#666", marginBottom: "5px" }}>رقم الهاتف النقال / الهاتف الثابت / رقم الحساب *</label>
                              <input type="text" className="customer-number" style={{ width: "100%", maxWidth: "400px", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }} />
                            </div>
                          </div>
                        </div>

                        <div className="et_pb_module et_pb_code et_pb_code_5 recharge-btn-section">
                          <div className="et_pb_code_inner">
                            <div style={{ marginTop: "20px" }}>
                              <a href="#" className="recharge-btn" style={{ backgroundColor: "#ed1c24", color: "#fff", padding: "10px 30px", borderRadius: "25px", textDecoration: "none", fontWeight: "bold", display: "inline-block" }}>تابع</a>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </article>
        </div>
        <Footer />
      </div>
    </div>
  );
}
