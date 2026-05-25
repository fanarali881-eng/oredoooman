export default function Footer() {
  return (
    <footer className="bg-[#333333] text-white py-16 mt-auto" dir="rtl">
      <div className="ooredoo-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Column 1: Mobile */}
          <div>
            <h3 className="text-xl font-bold mb-8 border-b border-gray-600 pb-2 inline-block">النقال</h3>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="hover:text-red-600 cursor-pointer transition-colors">هلا (مسبق الدفع)</li>
              <li className="hover:text-red-600 cursor-pointer transition-colors">O Plus (آجل الدفع)</li>
              <li className="hover:text-red-600 cursor-pointer transition-colors">قم بالترقية إلى O Plus(آجل الدفع)</li>
            </ul>
          </div>

          {/* Column 2: Home Services */}
          <div>
            <h3 className="text-xl font-bold mb-8 border-b border-gray-600 pb-2 inline-block">باقات منزلي</h3>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="hover:text-red-600 cursor-pointer transition-colors">الإنترنت المنزلي</li>
            </ul>
          </div>

          {/* Column 3: Devices */}
          <div>
            <h3 className="text-xl font-bold mb-8 border-b border-gray-600 pb-2 inline-block">الأجهزة</h3>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="hover:text-red-600 cursor-pointer transition-colors">الهواتف الذكية والأجهزة اللوحية</li>
              <li className="hover:text-red-600 cursor-pointer transition-colors">الإكسسوارات والأجهزة</li>
            </ul>
          </div>

          {/* Column 4: Support */}
          <div>
            <h3 className="text-xl font-bold mb-8 border-b border-gray-600 pb-2 inline-block">الدعم</h3>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="hover:text-red-600 cursor-pointer transition-colors">صالات Ooredoo</li>
              <li className="hover:text-red-600 cursor-pointer transition-colors">تتبع الطلب</li>
              <li className="hover:text-red-600 cursor-pointer transition-colors">Profile details</li>
              <li className="hover:text-red-600 cursor-pointer transition-colors">Reset password</li>
              <li className="hover:text-red-600 cursor-pointer transition-colors">Orders</li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex gap-8 text-sm text-gray-400">
            <span className="hover:text-white cursor-pointer transition-colors">الشروط والأحكام</span>
            <span className="hover:text-white cursor-pointer transition-colors">سياسة الخصوصية</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex gap-4">
              {/* Social Icons Placeholder */}
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-red-600 cursor-pointer transition-all">f</div>
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-red-600 cursor-pointer transition-all">𝕏</div>
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-red-600 cursor-pointer transition-all">ig</div>
            </div>
          </div>

          <div className="text-sm text-gray-400 font-bold">
            Ooredoo عمان © 2026 جميع الحقوق محفوظة
          </div>
        </div>
      </div>
    </footer>
  );
}
