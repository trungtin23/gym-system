import { useState, useEffect, useContext } from "react";
import {
  Star,
  Filter,
  Search,
  Phone,
  Mail,
  Award,
  Clock,
  Dumbbell,
  Calendar,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthProvider";
import { jwtDecode } from "jwt-decode";

export default function ListPTComponent() {
  const [trainers, setTrainers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    notes: "",
    selectedDay: undefined,
    selectedSlot: undefined,
  });
  const [timeSlots, setTimeSlots] = useState([]);
  const [trainerSchedule, setTrainerSchedule] = useState({});
  const [bookedSlots, setBookedSlots] = useState([]);
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/trainers");

      const formattedTrainers = response.data.map((trainer) => ({
        id: trainer.id,
        name: trainer.user.full_name,
        specialty: trainer.specialization,
        experience: trainer.experience + " năm",
        certifications: trainer.certifications
          ? trainer.certifications.split(",").map((c) => c.trim())
          : [],
        email: trainer.user?.email || "Không có",
        phone: trainer.user?.phone || "Không có",
        availability: "Linh hoạt",
        bio: trainer.bio || "Không có thông tin",
        story: trainer.story || "Không có thông tin",
        rating: 4.8,
        image:
          trainer.user?.profileImage || "/assets/img/placeholder-trainer.jpg",
      }));

      setTrainers(formattedTrainers);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách huấn luyện viên:", err);
      setError(
        "Không thể tải danh sách huấn luyện viên. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  const specialties = [
    ...new Set(trainers.map((trainer) => trainer.specialty)),
  ];

  const filteredTrainers = trainers.filter((trainer) => {
    const matchesSearch =
      trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty =
      selectedSpecialty === "" || trainer.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const handleBookAppointment = async (trainer) => {
    if (!isLoggedIn) {
      navigate("/login", {
        state: {
          from: location.pathname,
          message: "Vui lòng đăng nhập để đặt lịch với huấn luyện viên.",
        },
      });
      return;
    }

    try {
      // Lấy danh sách ca tập
      const timeSlotsResponse = await axios.get(
        "http://localhost:3000/training-time-slots"
      );

      if (timeSlotsResponse.data.status === "SUCCESS") {
        setTimeSlots(timeSlotsResponse.data.data);
      }

      // Lấy token để xác thực người dùng hiện tại
      const token = localStorage.getItem("userToken");
      let userId;

      if (token) {
        const decoded = jwtDecode(token);
        userId = decoded.userId || decoded.sub || decoded.id;
      }

      // Lấy danh sách lịch đã đặt cho trainer này
      if (userId) {
        try {
          const bookedResponse = await axios.get(
            `http://localhost:3000/appointments/user/${userId}/trainer/${trainer.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          console.log("Lịch đã đặt:", bookedResponse.data);

          // Lưu danh sách các ca đã đặt
          if (bookedResponse.data && bookedResponse.data.data) {
            setBookedSlots(bookedResponse.data.data);
          }
        } catch (error) {
          console.error("Lỗi khi lấy lịch đã đặt:", error);
          // Nếu lỗi, ta vẫn cho phép hiển thị modal nhưng không có thông tin về lịch đã đặt
          setBookedSlots([]);
        }
      }

      // Thay đổi đoạn xử lý dữ liệu từ API response
      const scheduleResponse = await axios.get(
        `http://localhost:3000/trainer-schedules/${trainer.id}/weekly`
      );
      console.log("API Response:", scheduleResponse.data);
      console.log("Trainer ID:", trainer.id);

      // Thay đổi từ 'SUCCESS' sang 200 hoặc kiểm tra thành công
      if (scheduleResponse.data.status === 200) {
        // Tổ chức lịch theo ngày trong tuần
        const scheduleByDay = {};

        // Kiểm tra và log cấu trúc dữ liệu để debug
        console.log("First item structure:", scheduleResponse.data.data[0]);

        scheduleResponse.data.data.forEach((schedule) => {
          if (!scheduleByDay[schedule.dayOfWeek]) {
            scheduleByDay[schedule.dayOfWeek] = [];
          }

          // Sửa lại dựa trên cấu trúc thực tế của dữ liệu JSON trả về
          scheduleByDay[schedule.dayOfWeek].push({
            id: schedule.timeSlot?.id || schedule.time_slot_id, // Thử cả hai trường hợp
            startTime:
              schedule.timeSlot?.startTime || schedule.startTime || "00:00:00",
            endTime:
              schedule.timeSlot?.endTime || schedule.endTime || "00:00:00",
            isAvailable: schedule.isAvailable,
          });
        });

        console.log("Processed schedule by day:", scheduleByDay);
        setTrainerSchedule(scheduleByDay);
      }

      setSelectedTrainer(trainer);
      setShowBookingModal(true);
    } catch (error) {
      console.error("Lỗi khi lấy lịch làm việc:", error);
      alert(
        "Không thể tải lịch làm việc của huấn luyện viên. Vui lòng thử lại sau."
      );
    }
  };
  const checkSlotAvailability = async (trainerId, date, timeSlotId) => {
    try {
      console.log("Kiểm tra khả dụng:", { trainerId, date, timeSlotId });

      const response = await axios.get(
        `http://localhost:3000/trainer-schedules/${trainerId}/check-availability`,
        {
          params: { date, timeSlotId },
        }
      );

      console.log("API trả về:", response.data);

      // Kiểm tra các trạng thái có thể có từ API
      if (
        response.data.status === "SUCCESS" ||
        response.data.status === 200 ||
        (response.data.data && response.data.data.available === true)
      ) {
        return true;
      }

      return false;
    } catch (error) {
      console.error("Lỗi khi kiểm tra ca tập:", error);
      return false;
    }
  };

  const handleSubmitBooking = async () => {
    try {
      const { date, notes, selectedSlot } = bookingData;

      // Kiểm tra dữ liệu
      if (!date || !selectedSlot) {
        alert("Vui lòng chọn ngày và ca tập");
        return;
      }

      // Lấy token và giải mã
      const token = localStorage.getItem("userToken");
      if (!token) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục");
        navigate("/login");
        return;
      }

      // Giải mã token để lấy userId
      let userId;
      try {
        const decoded = jwtDecode(token);
        userId = decoded.userId || decoded.sub || decoded.id;

        // Kiểm tra userId trước khi gửi
        if (!userId) {
          throw new Error("Không tìm thấy ID người dùng trong token");
        }

        console.log("Thông tin token giải mã:", decoded);
      } catch (tokenError) {
        console.error("Lỗi giải mã token:", tokenError);
        alert("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại");
        navigate("/login");
        return;
      }

      // Khai báo biến response ở phạm vi rộng hơn
      let response;
      let timeSlotId = selectedSlot;

      // Đảm bảo selectedSlot là một UUID hợp lệ
      if (selectedSlot && selectedSlot.includes("ts-")) {
        // Nếu selectedSlot có tiền tố 'ts-', cần loại bỏ nó
        timeSlotId = selectedSlot.replace("ts-", "");
      }

      // Log dữ liệu gửi đi để kiểm tra
      console.log("Dữ liệu đặt lịch:", {
        trainerId: selectedTrainer.id,
        userId,
        date,
        timeSlotId,
        notes: notes || "",
      });

      // Gửi request đến API
      response = await axios.post(
        "http://localhost:3000/appointments",
        {
          trainerId: selectedTrainer.id,
          userId,
          date,
          timeSlotId,
          notes: notes || "",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Trong hàm handleSubmitBooking, sau khi đặt thành công
      if (
        response &&
        (response.status === 200 || response.status === 201 || response.data)
      ) {
        // Thêm lịch mới vào danh sách đã đặt
        setBookedSlots([
          ...bookedSlots,
          {
            date: bookingData.date,
            timeSlotId: bookingData.selectedSlot,
            status: "PENDING",
          },
        ]);

        alert(
          "Đặt lịch thành công! Chúng tôi sẽ thông báo khi huấn luyện viên xác nhận."
        );
        setShowBookingModal(false);
        setBookingData({
          date: "",
          startTime: "",
          endTime: "",
          notes: "",
          selectedDay: undefined,
          selectedSlot: undefined,
        });
      }
    } catch (error) {
      console.error("Lỗi khi đặt lịch:", error.response?.data || error);

      // Hiển thị thông tin lỗi chi tiết hơn để debug
      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          alert(`Đặt lịch thất bại: ${error.response.data.message.join(", ")}`);
        } else {
          alert(`Đặt lịch thất bại: ${error.response.data.message}`);
        }
      } else {
        alert("Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại sau.");
      }
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen pt-15">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Đội ngũ huấn luyện viên</h1>
          <p className="text-xl text-white">
            Gặp gỡ những chuyên gia sẽ đồng hành cùng bạn trên hành trình rèn
            luyện sức khỏe
          </p>
        </div>
      </header>

      {/* Search and Filter */}
      <div className="container mx-auto px-4 -mt-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-20 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo tên hoặc chuyên môn..."
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <select
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
              >
                <option value="">Tất cả chuyên môn</option>
                {specialties.map((specialty, index) => (
                  <option key={index} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Trainers List */}
      <div className="container mx-auto px-4 py-10">
        <h2 className="text-2xl font-semibold mb-6 flex items-center">
          Danh sách huấn luyện viên
          <span className="ml-2 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
            {filteredTrainers.length}
          </span>
        </h2>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center">
            {error}
          </div>
        ) : filteredTrainers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">
              Không tìm thấy huấn luyện viên phù hợp với tiêu chí của bạn.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrainers.map((trainer) => (
              <div
                key={trainer.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="h-60 overflow-hidden relative">
                  <img
                    src={trainer.image}
                    alt={trainer.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/assets/img/placeholder-trainer.jpg";
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full flex items-center">
                    <Star
                      className="h-4 w-4 text-yellow-500 mr-1"
                      fill="#EAB308"
                    />
                    <span className="font-semibold text-gray-800">
                      {trainer.rating}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {trainer.name}
                  </h3>
                  <p className="text-blue-600 font-medium">
                    {trainer.specialty}
                  </p>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-gray-600">
                      <Award className="h-4 w-4 mr-2" />
                      <span>{trainer.experience} kinh nghiệm</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Dumbbell className="h-4 w-4 mr-2" />
                      <span>{trainer.certifications[0]}</span>
                    </div>
                  </div>

                  <p className="mt-4 text-gray-600 line-clamp-2">
                    {trainer.bio}
                  </p>

                  <div className="mt-6 flex justify-between">
                    <button
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                      onClick={() => setSelectedTrainer(trainer)}
                    >
                      Xem chi tiết
                    </button>
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-300 flex items-center"
                      onClick={() => handleBookAppointment(trainer)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Đặt lịch
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trainer Detail Modal */}
      {selectedTrainer && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <div className="h-64 w-full overflow-hidden">
                <img
                  src={selectedTrainer.image}
                  alt={selectedTrainer.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/assets/img/placeholder-trainer.jpg";
                  }}
                />
              </div>
              <button
                className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full text-gray-700 hover:text-gray-900 hover:bg-white"
                onClick={() => setSelectedTrainer(null)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900">
                  {selectedTrainer.name}
                </h2>
                <p className="text-blue-600 font-medium text-xl">
                  {selectedTrainer.specialty}
                </p>

                <div className="flex items-center mt-2">
                  <Star
                    className="h-5 w-5 text-yellow-500 mr-1"
                    fill="#EAB308"
                  />
                  <span className="font-semibold">
                    {selectedTrainer.rating}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">
                        Liên hệ
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Phone className="h-5 w-5 text-gray-500 mr-3" />
                          <span>{selectedTrainer.phone}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-5 w-5 text-gray-500 mr-3" />
                          <span>{selectedTrainer.email}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">
                        Thông tin
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Award className="h-5 w-5 text-gray-500 mr-3" />
                          <span>{selectedTrainer.experience} kinh nghiệm</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 text-gray-500 mr-3" />
                          <span>{selectedTrainer.availability}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center"
                        onClick={() => {
                          setShowBookingModal(true);
                          // Đóng modal chi tiết nếu muốn
                          // setSelectedTrainer(null);
                        }}
                      >
                        <Calendar className="h-5 w-5 mr-2" />
                        Đặt lịch ngay
                      </button>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Tiểu sử</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {selectedTrainer.story}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Chuyên môn</h3>
                      <p className="text-gray-700">{selectedTrainer.bio}</p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Chứng chỉ</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {selectedTrainer.certifications.map((cert, index) => (
                          <li key={index} className="text-gray-700">
                            {cert}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal - Redesigned */}
      {showBookingModal && selectedTrainer && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full overflow-hidden">
            {/* Header section với ảnh cover */}
            <div className="relative h-32 bg-gradient-to-r from-blue-700 to-blue-500">
              <img
                src="/assets/img/booking-pattern.png"
                alt="Pattern"
                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-20"
              />
              <button
                className="absolute top-4 right-4 bg-white/30 backdrop-blur-sm p-2 rounded-full text-white hover:bg-white/50 transition-colors"
                onClick={() => setShowBookingModal(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div className="absolute -bottom-16 left-8">
                <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                  <img
                    src={selectedTrainer.image}
                    alt={selectedTrainer.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/assets/img/placeholder-trainer.jpg";
                    }}
                  />
                </div>
              </div>
              <div className="absolute bottom-4 left-48 text-white">
                <h2 className="text-2xl font-bold">Đặt lịch tập</h2>
              </div>
            </div>

            {/* Trainer info */}
            <div className="pt-20 px-8 pb-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {selectedTrainer.name}
                  </h3>
                  <p className="text-blue-600 font-medium">
                    {selectedTrainer.specialty}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-1 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {selectedTrainer.experience}
                    </span>
                  </div>
                  <span className="text-gray-300">|</span>
                  <div className="flex items-center">
                    <Star
                      className="h-4 w-4 text-yellow-500 mr-1"
                      fill="#EAB308"
                    />
                    <span className="text-sm font-medium">
                      {selectedTrainer.rating}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 max-h-[calc(100vh-300px)] overflow-y-auto">
              {/* Booking steps */}
              <div className="flex mb-8">
                <div className="flex-1 relative">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mb-2 mx-auto z-10 relative">
                    1
                  </div>
                  <div className="text-center text-sm font-medium">
                    Chọn ngày
                  </div>
                  <div className="absolute top-4 h-0.5 bg-blue-600 w-full z-0"></div>
                </div>
                <div className="flex-1 relative">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 mx-auto z-10 relative
                    ${
                      bookingData.selectedDay !== undefined
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    2
                  </div>
                  <div className="text-center text-sm font-medium">
                    Chọn giờ
                  </div>
                  <div
                    className={`absolute top-4 h-0.5 w-full z-0 ${
                      bookingData.selectedDay !== undefined
                        ? "bg-blue-600"
                        : "bg-gray-200"
                    }`}
                  ></div>
                </div>
                <div className="flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 mx-auto
                    ${
                      bookingData.selectedSlot
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    3
                  </div>
                  <div className="text-center text-sm font-medium">
                    Xác nhận
                  </div>
                </div>
              </div>

              {/* Calendar selection */}
              <div className="mb-8">
                <div className="bg-white rounded-lg border shadow-sm p-4">
                  <h4 className="font-medium text-gray-800 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                    Chọn ngày tập luyện
                  </h4>

                  <div className="flex overflow-x-auto pb-2 -mx-2">
                    {Array.from({ length: 14 }).map((_, index) => {
                      const date = new Date();
                      date.setDate(date.getDate() + index);

                      const dayName = [
                        "SUNDAY",
                        "MONDAY",
                        "TUESDAY",
                        "WEDNESDAY",
                        "THURSDAY",
                        "FRIDAY",
                        "SATURDAY",
                      ][date.getDay()];

                      const dayDisplay = [
                        "CN",
                        "T2",
                        "T3",
                        "T4",
                        "T5",
                        "T6",
                        "T7",
                      ][date.getDay()];

                      const formattedDate = date.toISOString().split("T")[0];

                      const hasSchedules =
                        trainerSchedule[dayName] &&
                        trainerSchedule[dayName].length > 0;

                      // Đếm số ca có thể đặt trong ngày
                      const availableSlots = hasSchedules
                        ? trainerSchedule[dayName].filter((slot) => {
                            const isBooked = bookedSlots.some(
                              (booking) =>
                                booking.date === formattedDate &&
                                booking.timeSlotId === slot.id &&
                                ["CONFIRMED", "PENDING"].includes(
                                  booking.status?.toUpperCase() || ""
                                )
                            );
                            return !isBooked;
                          }).length
                        : 0;

                      return (
                        <div
                          key={index}
                          className={`flex-shrink-0 mx-2 w-16 rounded-lg border-2 transition-all cursor-pointer
                            ${
                              bookingData.selectedDay === index
                                ? "border-blue-600 bg-blue-50"
                                : hasSchedules
                                ? "border-gray-200 hover:border-blue-300"
                                : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                            }`}
                          onClick={() => {
                            if (hasSchedules) {
                              setBookingData({
                                ...bookingData,
                                selectedDay: index,
                                date: formattedDate,
                                selectedSlot: undefined,
                                startTime: "",
                                endTime: "",
                              });
                            }
                          }}
                        >
                          <div
                            className={`text-center py-2 px-1
                            ${!hasSchedules && "text-gray-400"}
                          `}
                          >
                            <div className="text-sm font-medium">
                              {dayDisplay}
                            </div>
                            <div className="text-lg font-bold my-1">
                              {date.getDate()}
                            </div>
                            <div className="text-xs">
                              {hasSchedules ? (
                                availableSlots > 0 ? (
                                  <span className="text-green-600 font-medium">
                                    {availableSlots} ca
                                  </span>
                                ) : (
                                  <span className="text-red-500">Đã đầy</span>
                                )
                              ) : (
                                "Không có"
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Time slot selection */}
              {bookingData.selectedDay !== undefined && (
                <div className="mb-8">
                  <div className="bg-white rounded-lg border shadow-sm p-4">
                    <h4 className="font-medium text-gray-800 mb-4 flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-blue-600" />
                      Chọn giờ tập luyện
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        {(() => {
                          try {
                            const date = new Date();
                            date.setDate(
                              date.getDate() + bookingData.selectedDay
                            );
                            return date.toLocaleDateString("vi-VN", {
                              weekday: "long",
                              day: "numeric",
                              month: "numeric",
                            });
                          } catch (error) {
                            return "";
                          }
                        })()}
                      </span>
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {(() => {
                        const date = new Date();
                        date.setDate(date.getDate() + bookingData.selectedDay);
                        const dayName = [
                          "SUNDAY",
                          "MONDAY",
                          "TUESDAY",
                          "WEDNESDAY",
                          "THURSDAY",
                          "FRIDAY",
                          "SATURDAY",
                        ][date.getDay()];

                        const daySchedules = trainerSchedule[dayName] || [];
                        const formattedDate = date.toISOString().split("T")[0];

                        if (daySchedules.length === 0) {
                          return (
                            <div className="col-span-full py-8 text-center text-gray-500">
                              Không có ca tập nào vào ngày này
                            </div>
                          );
                        }

                        // Sắp xếp các ca tập theo thời gian
                        const sortedSchedules = [...daySchedules].sort(
                          (a, b) => {
                            return a.startTime.localeCompare(b.startTime);
                          }
                        );

                        return sortedSchedules.map((slot) => {
                          const startTime =
                            slot.startTime?.substring(0, 5) || "";
                          const endTime = slot.endTime?.substring(0, 5) || "";

                          const isAlreadyBooked = bookedSlots.some(
                            (booking) =>
                              booking.date === formattedDate &&
                              booking.timeSlotId === slot.id &&
                              ["CONFIRMED", "PENDING"].includes(
                                booking.status?.toUpperCase() || ""
                              )
                          );

                          return (
                            <div
                              key={slot.id}
                              onClick={() => {
                                if (!isAlreadyBooked) {
                                  setBookingData({
                                    ...bookingData,
                                    selectedSlot: slot.id,
                                    startTime: slot.startTime,
                                    endTime: slot.endTime,
                                  });
                                }
                              }}
                              className={`relative rounded-lg transition-all overflow-hidden
                                ${
                                  isAlreadyBooked
                                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                    : bookingData.selectedSlot === slot.id
                                    ? "ring-2 ring-blue-600 bg-blue-50"
                                    : "bg-white border hover:border-blue-300 cursor-pointer"
                                }
                              `}
                            >
                              {bookingData.selectedSlot === slot.id && (
                                <div className="absolute top-2 right-2">
                                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                    <svg
                                      className="w-3 h-3 text-white"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="3"
                                        d="M5 13l4 4L19 7"
                                      ></path>
                                    </svg>
                                  </div>
                                </div>
                              )}

                              <div className="p-3 text-center">
                                <div className="font-medium text-lg">
                                  {startTime}
                                </div>
                                <div className="text-xs text-gray-500">
                                  đến {endTime}
                                </div>

                                {isAlreadyBooked ? (
                                  <div className="mt-2 text-amber-600 text-xs font-medium flex items-center justify-center">
                                    <svg
                                      className="w-3 h-3 mr-1"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                        clipRule="evenodd"
                                      ></path>
                                    </svg>
                                    Đã đặt
                                  </div>
                                ) : (
                                  <div
                                    className={`mt-2 text-xs font-medium ${
                                      bookingData.selectedSlot === slot.id
                                        ? "text-blue-600"
                                        : "text-green-600"
                                    }`}
                                  >
                                    Có thể đặt
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* Notes and confirmation */}
              {bookingData.selectedSlot && (
                <div className="mb-4">
                  <div className="bg-white rounded-lg border shadow-sm p-4">
                    <h4 className="font-medium text-gray-800 mb-4 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        ></path>
                      </svg>
                      Ghi chú & xác nhận
                    </h4>

                    <div className="mb-4 bg-blue-50 rounded-lg p-3 border border-blue-100">
                      <div className="flex flex-wrap gap-2 text-sm">
                        <div className="bg-white px-3 py-1 rounded-full border border-blue-200 flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-blue-600" />
                          <span className="font-medium">
                            {(() => {
                              try {
                                const date = new Date();
                                date.setDate(
                                  date.getDate() + bookingData.selectedDay
                                );
                                return date.toLocaleDateString("vi-VN", {
                                  weekday: "long",
                                  day: "numeric",
                                  month: "numeric",
                                });
                              } catch (error) {
                                return "";
                              }
                            })()}
                          </span>
                        </div>
                        <div className="bg-white px-3 py-1 rounded-full border border-blue-200 flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-blue-600" />
                          <span className="font-medium">
                            {bookingData.startTime?.substring(0, 5)} -{" "}
                            {bookingData.endTime?.substring(0, 5)}
                          </span>
                        </div>
                        <div className="bg-white px-3 py-1 rounded-full border border-blue-200 flex items-center">
                          <svg
                            className="w-4 h-4 mr-1 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            ></path>
                          </svg>
                          <span className="font-medium">
                            {selectedTrainer.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label
                        className="block text-sm font-medium text-gray-700 mb-1"
                        htmlFor="notes"
                      >
                        Ghi chú cho huấn luyện viên
                      </label>
                      <textarea
                        id="notes"
                        className="w-full border rounded-lg px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Mục tiêu tập luyện, yêu cầu đặc biệt, tình trạng sức khỏe..."
                        value={bookingData.notes}
                        onChange={(e) =>
                          setBookingData({
                            ...bookingData,
                            notes: e.target.value,
                          })
                        }
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer with action buttons */}
            <div className="px-8 py-4 bg-gray-50 border-t flex justify-between items-center">
              <button
                className="px-4 py-2 text-gray-700 font-medium hover:text-gray-900 transition-colors flex items-center"
                onClick={() => setShowBookingModal(false)}
              >
                <svg
                  className="w-5 h-5 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
                Hủy
              </button>
              <button
                className={`px-6 py-2.5 rounded-lg font-medium flex items-center transition-colors duration-300 ${
                  bookingData.selectedSlot
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                onClick={handleSubmitBooking}
                disabled={!bookingData.selectedSlot}
              >
                {bookingData.selectedSlot ? (
                  <>
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    Xác nhận đặt lịch
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    Vui lòng chọn ngày và giờ
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
