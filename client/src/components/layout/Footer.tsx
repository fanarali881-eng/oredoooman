export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white py-12 mt-auto" dir="rtl">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Column 1 */}
          <div>
            <h3 className="text-lg font-bold mb-6">النقال</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="hover:text-white cursor-pointer">هلا (مسبق الدفع)</li>
              <li className="hover:text-white cursor-pointer">O Plus (آجل الدفع)</li>
              <li className="hover:text-white cursor-pointer">قم بالترقية إلى O Plus(آجل الدفع)</li>
            </ul>
          </div>
          {/* Column 2 */}
          <div>
            <h3 className="text-lg font-bold mb-6">باقات منزلي</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="hover:text-white cursor-pointer">الإنترنت المنزلي</li>
            </ul>
          </div>
          {/* Column 3 */}
          <div>
            <h3 className="text-lg font-bold mb-6">الأجهزة</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="hover:text-white cursor-pointer">الهواتف الذكية والأجهزة اللوحية</li>
              <li className="hover:text-white cursor-pointer">الإكسسوارات والأجهزة</li>
            </ul>
          </div>
          {/* Column 4 */}
          <div>
            <h3 className="text-lg font-bold mb-6">الدعم</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="hover:text-white cursor-pointer">صالات Ooredoo</li>
              <li className="hover:text-white cursor-pointer">تتبع الطلب</li>
              <li className="hover:text-white cursor-pointer">Profile details</li>
              <li className="hover:text-white cursor-pointer">Reset password</li>
              <li className="hover:text-white cursor-pointer">Orders</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-6 text-sm text-gray-400">
            <span className="hover:text-white cursor-pointer">الشروط والأحكام</span>
            <span className="hover:text-white cursor-pointer">سياسة الخصوصية</span>
          </div>
          <div className="text-sm text-gray-400">
            Ooredoo عمان © 2026 جميع الحقوق محفوظة
          </div>
        </div>
      </div>
    </footer>
  );
}
