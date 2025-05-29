// src/components/Header.js
import React, { useState, useContext } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthProvider";

export default function Header() {
  const { isLoggedIn, setIsLoggedIn, setUser, isLoading, user } =
    useContext(AuthContext);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    setIsLoggedIn(false);
    setUser(null);
    setShowMenu(false);
    navigate("/login");
  };

  if (isLoading) {
    return <div className="text-center py-4">Đang xác thực...</div>;
  }

  return (
    <div className="">
      <div>
        <link rel="stylesheet" href="assets/css/tailwindcss.css" />
        <header id="header-wrap" className="relative ">
          {/* Navbar Start */}
          <div className="navigation fixed top-0 left-0 w-full z-30 duration-300 bg-gradient-to-r from-slate-200 to-slate-200">
            <div className="container px-4">
              <nav className="navbar py-2 navbar-expand-lg flex justify-between items-center relative duration-300">
                <a className="navbar-brand text-5xl font-bold" href="/">
                  <span className="text-orange-500">MAX</span>
                  <span className="text-black">GYM</span>
                </a>

                <div className="" id="navbarSupportedContent">
                  <ul className="navbar-nav mr-auto justify-center items-center lg:flex">
                    <li className="nav-item font-bold ">
                      <a className="page-scroll nav-link " href="#hero-area">
                        Dịch Vụ
                      </a>
                    </li>
                    <li className="nav-item font-bold">
                      <a className="page-scroll nav-link" href="/membership">
                        Bảng Giá
                      </a>
                    </li>
                    <li className="nav-item font-bold">
                      <a 
                        className="page-scroll nav-link" 
                        href={isLoggedIn && user && user.data && user.data.role === 'TRAINER' ? "/schedule" : "/memberschedule"}
                      >
                        Lịch Tập
                      </a>
                    </li>
                    <li className="nav-item font-bold">
                      <a className="page-scroll nav-link" href="/listPT">
                        Huấn Luyện Viên
                      </a>
                    </li>
                    <li className="nav-item font-bold">
                      <a className="nav-link" href="">
                        Sản phẩm
                      </a>
                    </li>

                    <li className="nav-item font-bold">
                      <a className="page-scroll nav-link" href="#contact">
                        Liên Hệ
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="header-btn hidden sm:block sm:absolute sm:right-0 sm:mr-16 lg:static lg:mr-0">
                  {isLoggedIn ? (
                    <div className="relative">
                      <button
                        className="flex items-center focus:outline-none"
                        onClick={() => setShowMenu(!showMenu)}
                      >
                        <img
                          src="avt.png"
                          alt="Avatar"
                          className="w-10 h-10 rounded-full"
                        />
                      </button>
                      {showMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                          <a
                            href="/profile"
                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                          >
                            Xem Hồ Sơ
                          </a>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                          >
                            Đăng Xuất
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <a
                      className="text-black-600 border border-black px-10 py-3 square-full duration-300 hover:bg-orange-500 hover:text-white"
                      href="/login"
                    >
                      Đăng Nhập
                    </a>
                  )}
                </div>
              </nav>
            </div>
          </div>
          {/* Navbar End */}
        </header>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  );
}
