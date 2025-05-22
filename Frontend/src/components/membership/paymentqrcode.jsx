import { useState } from "react";

export default function QRPaymentPage({ price }) {
  const [showSuccess, setShowSuccess] = useState(false);

  const bankInfo = {
    bank: "Vietcombank",
    accountNumber: "1016944997",
    accountName: "DAO TRUNG TIN",
    amount: price,
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handlePaymentComplete = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="flex justify-center mb-4">
          <div className="text-2xl font-bold text-blue-600">Thanh Toán QR</div>
        </div>

        <div className="flex justify-center mb-6">
          <div className="border-4 border-blue-500 rounded-lg p-2 bg-white">
            <img
              src="https://img.vietqr.io/image/VCB-1016944997-compact.png"
              alt="QR Payment Code"
              className="w-64 h-64"
            />
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="flex justify-between">
              <div className="text-gray-600">Ngân hàng:</div>
              <div className="font-semibold">{bankInfo.bank}</div>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-md">
            <div className="flex justify-between items-center">
              <div className="text-gray-600">Số tài khoản:</div>
              <div className="flex items-center">
                <div className="font-semibold mr-2">
                  {bankInfo.accountNumber}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-md">
            <div className="flex justify-between">
              <div className="text-gray-600">Chủ tài khoản:</div>
              <div className="font-semibold">{bankInfo.accountName}</div>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-md">
            <div className="flex justify-between">
              <div className="text-gray-600">Số tiền:</div>
              <div className="font-semibold text-red-600">
                {formatCurrency(bankInfo.amount)}
              </div>
            </div>
          </div>
        </div>

        {showSuccess && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-xl text-center">
              <div className="text-green-500 text-5xl mb-4">✓</div>
              <div className="text-xl font-bold mb-2">
                Thanh toán thành công
              </div>
              <div className="text-gray-600 mb-4">
                Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi
              </div>
              <button
                onClick={() => setShowSuccess(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
