import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [pass, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn chặn hành vi mặc định của form
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:3000/auth/login", {
        email: name,
        password: pass,
      });

      // Lưu token vào localStorage
      const token = response.data.access_token; // Giả sử API trả về token trong `response.data.token`
      localStorage.setItem("userToken", token);

      console.log("Đăng nhập thành công:", response);
      navigate("/"); // Di chuyển đến trang chủ sau khi đăng nhập thành công
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      setError("Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md mx-auto">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-800">Đăng Nhập</h1>
            <div className="mt-2 h-1 w-16 bg-orange-500 mx-auto rounded-full"></div>
          </div>

          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="email"
              >
                Email
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                id="email"
                type="email"
                placeholder="Nhập email của bạn"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="password"
              >
                Mật khẩu
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={pass}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
                <label
                  htmlFor="remember"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Ghi nhớ đăng nhập
                </label>
              </div>
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-orange-500 hover:text-orange-700"
              >
                Quên mật khẩu?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 ${
                loading ? "bg-orange-300" : "bg-orange-500 hover:bg-orange-600"
              } text-white font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition-colors`}
            >
              {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="ml-1 text-orange-500 hover:text-orange-700 focus:outline-none"
              >
                Đăng ký ngay
              </button>
            </p>
          </div>

          {/* Các nút đăng nhập xã hội */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Hoặc đăng nhập với
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <button
                type="button"
                className="w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
              >
                <div className="flex items-center justify-center">
                  <span className="text-gray-700">Google</span>
                </div>
              </button>
              <button
                type="button"
                className="w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
              >
                <div className="flex items-center justify-center">
                  <span className="text-gray-700">Facebook</span>
                </div>
              </button>
              <button
                type="button"
                className="w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
              >
                <div className="flex items-center justify-center">
                  <span className="text-gray-700">Github</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
