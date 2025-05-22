import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  User,
  Settings,
  Calendar,
  Activity,
  TrendingUp,
  Award,
  Clock,
  Plus,
  Camera,
  Upload,
} from "lucide-react";

export default function GymMemberProfile() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isUploadMenuOpen, setIsUploadMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState("/api/placeholder/150/150");
  const [isDragging, setIsDragging] = useState(false);
  const [memberData, setMemberData] = useState(null); // State để lưu dữ liệu từ API
  const fileInputRef = useRef(null);

  // Lấy userId từ token
  const userId = getUserIdFromToken();
  // console.log("User ID:", userId);

  // Gọi API để lấy thông tin người dùng
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        console.error("No userId found");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:3000/users/${userId}`
        );
        console.log("User data:", response.data.status);

        if (response.data.status == 200) {
          setMemberData(response.data.data); // Lưu dữ liệu người dùng vào state
          if (response.data.data.profileImage) {
            setProfileImage(response.data.data.profileImage); // Cập nhật ảnh đại diện
          }
        } else {
          console.error("Error fetching user data:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userId]);

  // Xử lý lỗi ảnh
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
  };

  // Xử lý kéo thả ảnh
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      await uploadProfileImage(file); // Gọi hàm upload ảnh
    }
  };

  // Hàm upload ảnh lên server
  const uploadProfileImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:3000/users/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const imageUrl = response.data.imageUrl;
      setProfileImage(imageUrl);

      // Cập nhật URL ảnh vào thông tin người dùng
      await axios.patch(
        `http://localhost:3000/users/${userId}`,
        { profileImage: imageUrl },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  // Xử lý chọn ảnh từ input
  const handleFileInputChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadProfileImage(file); // Gọi hàm upload ảnh
      setIsUploadMenuOpen(false);
    }
  };

  // Dữ liệu mẫu (sẽ được thay thế bằng dữ liệu từ API)
  const defaultMemberData = {
    name: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    membershipType: "Premium",
    memberSince: "05/02/2024",
    profileImage: profileImage,
    stats: {
      height: "175 cm",
      weight: "70 kg",
      bodyFat: "18%",
      bmi: "22.9",
    },
    fitnessGoals: ["Tăng cơ bắp", "Giảm mỡ bụng", "Cải thiện sức bền"],
    upcomingClasses: [
      { name: "Yoga Flow", date: "03/05/2025", time: "08:00 - 09:00" },
      { name: "HIIT", date: "05/05/2025", time: "17:30 - 18:30" },
    ],
    recentWorkouts: [
      {
        date: "01/05/2025",
        type: "Cardio",
        duration: "45 phút",
        calories: "320",
      },
      {
        date: "29/04/2025",
        type: "Tập lưng/vai",
        duration: "60 phút",
        calories: "450",
      },
      {
        date: "27/04/2025",
        type: "Tập chân",
        duration: "50 phút",
        calories: "380",
      },
    ],
    achievements: [
      { name: "100 buổi tập", date: "12/03/2025", icon: "Award" },
      { name: "Giảm 5kg", date: "03/02/2025", icon: "TrendingUp" },
      {
        name: "Hoàn thành thử thách 30 ngày",
        date: "15/01/2025",
        icon: "Activity",
      },
    ],
  };

  // Sử dụng memberData từ API hoặc dữ liệu mẫu nếu chưa có
  const displayData = defaultMemberData;
  const userInf = memberData;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">FitLife Gym</h1>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-blue-700">
              <Settings size={20} />
            </button>
            <div className="bg-blue-800 px-3 py-1 rounded-lg text-sm hidden md:block">
              <div className="flex items-center">
                <Upload size={14} className="mr-1" />
                <span>Bạn có thể kéo thả ảnh vào avatar</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto flex flex-col md:flex-row p-4 gap-6 flex-grow">
        {/* Profile sidebar */}
        <aside className="w-full md:w-1/3 lg:w-1/4">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col items-center mb-6">
              <div
                className="relative mb-4"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div
                  className={`relative ${
                    isDragging ? "ring-4 ring-blue-300 rounded-full" : ""
                  }`}
                >
                  <img
                    src={profileImage}
                    alt="Profile"
                    className={`w-32 h-32 rounded-full object-cover border-4 ${
                      isDragging
                        ? "border-blue-300 opacity-70"
                        : "border-blue-500"
                    }`}
                    onError={handleImageError}
                  />
                  {isDragging && (
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-500 bg-opacity-30 rounded-full">
                      <Upload size={24} className="text-white" />
                    </div>
                  )}
                </div>
                <button
                  className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full hover:bg-blue-600 transition-colors"
                  onClick={() => setIsUploadMenuOpen(!isUploadMenuOpen)}
                >
                  <Camera size={16} className="text-white" />
                </button>

                {isUploadMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                    style={{ top: "100%" }}
                  >
                    <div
                      className="py-1"
                      role="menu"
                      aria-orientation="vertical"
                    >
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="mr-2" size={16} />
                        Tải ảnh lên
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => {
                          setProfileImage("/api/placeholder/150/150");
                          setIsUploadMenuOpen(false);
                        }}
                      >
                        <User className="mr-2" size={16} />
                        Xóa ảnh
                      </button>
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileInputChange}
                />
              </div>
              <h2 className="text-xl font-bold text-center">
                {userInf?.full_name || ""}
              </h2>
              <p className="text-gray-600 text-center">
                {userInf?.email || ""}
              </p>
              <div className="mt-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {displayData.membershipType}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Thành viên từ:</span>
                <span className="font-medium">{displayData.memberSince}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Chiều cao:</span>
                <span className="font-medium">
                  {userInf?.health.height + " cm" || ""}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Cân nặng:</span>
                <span className="font-medium">
                  {userInf?.health.weight + " kg" || ""}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Tỷ lệ mỡ:</span>
                <span className="font-medium">
                  {userInf?.health.bodyFatPercentage + " %" || ""}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">BMI:</span>
                <span className="font-medium">
                  {" "}
                  {userInf?.health.bmi || ""}
                </span>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium mb-2">Mục tiêu tập luyện</h3>
              <ul className="space-y-2">
                {userInf?.health.trainingGoals.map((goal, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-gray-700"
                  >
                    <TrendingUp size={16} className="text-blue-500" />
                    {goal}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Main content area */}
        <div className="flex-1">
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-3 px-8 font-bold  ${
                  activeTab === "overview"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 "
                }`}
              >
                Tổng quan
              </button>
              <button
                onClick={() => setActiveTab("workouts")}
                className={`py-3 px-8 font-bold ${
                  activeTab === "workouts"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600"
                }`}
              >
                Buổi tập
              </button>
              <button
                onClick={() => setActiveTab("achievements")}
                className={`py-3 px-8 font-bold ${
                  activeTab === "achievements"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600"
                }`}
              >
                Thành tích
              </button>
            </div>

            {/* Tab content */}
            <div className="p-6">
              {activeTab === "overview" && (
                <div>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Lớp học sắp tới</h3>
                      <button className="text-blue-600 flex items-center text-sm">
                        <Plus size={16} className="mr-1" />
                        Đăng ký lớp
                      </button>
                    </div>
                    <div className="space-y-4">
                      {displayData.upcomingClasses.map((classItem, index) => (
                        <div
                          key={index}
                          className="flex items-center bg-blue-50 p-4 rounded-lg"
                        >
                          <div className="bg-blue-100 text-blue-600 p-3 rounded-lg mr-4">
                            <Calendar size={24} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{classItem.name}</h4>
                            <p className="text-sm text-gray-600">
                              {classItem.date} • {classItem.time}
                            </p>
                          </div>
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                            Chi tiết
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">
                        Buổi tập gần đây
                      </h3>
                      <button className="text-blue-600 flex items-center text-sm">
                        Xem tất cả
                      </button>
                    </div>
                    <div className="space-y-3">
                      {displayData.recentWorkouts.map((workout, index) => (
                        <div
                          key={index}
                          className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div className="bg-gray-100 text-gray-600 p-2 rounded-lg mr-3">
                            <Activity size={20} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{workout.type}</h4>
                            <div className="text-sm text-gray-600 flex items-center gap-4">
                              <span className="flex items-center">
                                <Calendar size={14} className="mr-1" />{" "}
                                {workout.date}
                              </span>
                              <span className="flex items-center">
                                <Clock size={14} className="mr-1" />{" "}
                                {workout.duration}
                              </span>
                              <span>{workout.calories} calo</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "workouts" && (
                <div>
                  <div className="flex justify-between mb-6">
                    <h3 className="text-lg font-semibold">Lịch sử tập luyện</h3>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center">
                      <Plus size={16} className="mr-1" />
                      Thêm buổi tập
                    </button>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-center text-gray-500">
                      Chức năng đang được phát triển. Bạn sẽ có thể xem lịch sử
                      tập luyện chi tiết tại đây.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "achievements" && (
                <div>
                  <h3 className="text-lg font-semibold mb-6">
                    Thành tích đạt được
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayData.achievements.map((achievement, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 flex items-center"
                      >
                        <div className="bg-yellow-100 text-yellow-600 p-3 rounded-lg mr-4">
                          <Award size={24} />
                        </div>
                        <div>
                          <h4 className="font-medium">{achievement.name}</h4>
                          <p className="text-sm text-gray-600">
                            Đạt được vào: {achievement.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Membership status card */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-md text-white p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  Gói hội viên {displayData.membershipType}
                </h3>
                <p>Hết hạn: 05/02/2026</p>
              </div>
              <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium">
                Gia hạn
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4 mt-auto">
        <div className="container mx-auto text-center">
          <p>© 2025 FitLife Gym - Hỗ trợ: 1900 1234</p>
        </div>
      </footer>
    </div>
  );
}

// Hàm lấy userId từ token
const getUserIdFromToken = () => {
  const token = localStorage.getItem("userToken");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      return decoded.sub;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }
  return null;
};
