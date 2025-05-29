import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import moment from "moment";
import "moment/locale/vi";
import { toast } from "react-toastify";
// Adjust path as needed
import { jwtDecode } from "jwt-decode";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
  Dumbbell,
  CalendarDays,
  Search,
  Filter,
  X,
  Star,
} from "lucide-react";
import { AuthContext } from "../../contexts/AuthProvider";

moment.locale("vi");

// Component đánh giá sao
const StarRating = ({ rating, onRatingChange, readonly = false }) => {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onRatingChange && onRatingChange(star)}
          className={`focus:outline-none ${
            readonly ? "cursor-default" : "cursor-pointer"
          }`}
          disabled={readonly}
        >
          <Star
            className={`h-5 w-5 ${
              star <= rating
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

// Component form đánh giá
const RatingForm = ({ appointment, onClose, onSave }) => {
  const [rating, setRating] = useState(appointment.rating || 0);
  const [comment, setComment] = useState(appointment.ratingComment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.warning("Vui lòng chọn số sao đánh giá");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(appointment.id, { rating, comment });
      onClose();
    } catch (error) {
      console.error("Lỗi khi lưu đánh giá:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {appointment.rating ? "Cập nhật đánh giá" : "Đánh giá buổi tập"}
      </h3>
      
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-3">
          <p><strong>Huấn luyện viên:</strong> {appointment.trainer.name}</p>
          <p><strong>Thời gian:</strong> {moment(appointment.date).format("DD/MM/YYYY")}, {appointment.timeStart} - {appointment.timeEnd}</p>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Số sao đánh giá
        </label>
        <StarRating rating={rating} onRatingChange={setRating} />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nhận xét
        </label>
        <textarea
          className="w-full border rounded-lg px-3 py-2 min-h-[100px] focus:ring-blue-500 focus:border-blue-500"
          placeholder="Nhập nhận xét của bạn về buổi tập..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Hủy
        </button>
        <button
          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Đang lưu..." : (appointment.rating ? "Cập nhật đánh giá" : "Gửi đánh giá")}
        </button>
      </div>
    </div>
  );
};

export default function MemberScheduleComponent() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedAppointmentForRating, setSelectedAppointmentForRating] = useState(null);
  const { isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    if (isLoggedIn) {
      fetchAppointments();
    }
  }, [isLoggedIn, selectedDate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user ID from token
      const token = localStorage.getItem("userToken");
      if (!token) {
        setError("Bạn cần đăng nhập để xem lịch tập. Vui lòng đăng nhập và thử lại.");
        setLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const userId = decoded.sub;

        if (!userId) {
          setError("Không thể xác định người dùng. Vui lòng đăng nhập lại.");
          setLoading(false);
          return;
        }
      } catch (tokenError) {
        console.error("Lỗi khi giải mã token:", tokenError);
        setError("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
        setLoading(false);
        return;
      }

      // API call to get user's appointments
      const response = await axios.get(
        `http://localhost:3000/appointments/user/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.data) {
        // Transform the data to match the expected format
        const transformedData = response.data.data.map(appointment => {
          // Ensure all required fields are present with fallbacks
          return {
            id: appointment.id,
            date: appointment.date ? appointment.date.split('T')[0] : new Date().toISOString().split('T')[0], // Extract date part only with fallback
            timeStart: appointment.timeSlot?.startTime || "00:00",
            timeEnd: appointment.timeSlot?.endTime || "00:00",
            trainer: {
              id: appointment.trainer?.id || "unknown",
              name: appointment.trainer?.user?.full_name || appointment.trainer?.user?.username || "Huấn luyện viên không xác định",
              specialty: appointment.trainer?.specialization || "Personal Trainer",
              phone: appointment.trainer?.user?.phone || "Chưa có thông tin",
              email: appointment.trainer?.user?.email || "Chưa có thông tin",
              avatar: appointment.trainer?.user?.profileImage || "https://randomuser.me/api/portraits/men/32.jpg"
            },
            location: appointment.location || "Phòng tập chính",
            status: appointment.status || "PENDING",
            notes: appointment.notes || "",
            exercises: appointment.exercises || "",
            rating: appointment.rating?.rating || null,
            ratingComment: appointment.rating?.comment || ""
          };
        });

        setAppointments(transformedData);

        if (transformedData.length === 0) {
          toast.info("Bạn chưa có lịch tập nào. Vui lòng liên hệ huấn luyện viên để đặt lịch.");
        }
      } else {
        // If no data from API, set empty array and show message
        setAppointments([]);
        toast.info("Bạn chưa có lịch tập nào. Vui lòng liên hệ huấn luyện viên để đặt lịch.");
      }

      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi tải lịch tập:", error);

      // Provide more specific error messages based on the error type
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 401 || error.response.status === 403) {
          setError("Bạn không có quyền xem lịch tập này. Vui lòng đăng nhập lại.");
          toast.error("Bạn không có quyền xem lịch tập này. Vui lòng đăng nhập lại.");
        } else if (error.response.status === 404) {
          setError("Không tìm thấy API endpoint. Vui lòng liên hệ quản trị viên.");
          toast.error("Không tìm thấy API endpoint. Vui lòng liên hệ quản trị viên.");
        } else {
          setError(`Lỗi từ máy chủ: ${error.response.data?.message || 'Vui lòng thử lại sau'}`);
          toast.error(`Lỗi từ máy chủ: ${error.response.data?.message || 'Vui lòng thử lại sau'}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.");
        toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.");
      } else {
        // Something happened in setting up the request that triggered an Error
        setError("Lỗi khi tải dữ liệu: " + error.message);
        toast.error("Lỗi khi tải dữ liệu: " + error.message);
      }

      // Don't use mock data in production, just set empty array
      setAppointments([]);
      setLoading(false);
    }
  };

  const generateMockData = () => {
    const mockData = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 10);

    const trainers = [
      {
        id: "pt1",
        name: "Nguyễn Văn A",
        specialty: "Strength Training",
        phone: "0901234567",
        email: "trainera@example.com",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      },
      {
        id: "pt2",
        name: "Trần Thị B",
        specialty: "Yoga",
        phone: "0912345678",
        email: "trainerb@example.com",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      },
      {
        id: "pt3",
        name: "Lê Văn C",
        specialty: "Cardio",
        phone: "0923456789",
        email: "trainerc@example.com",
        avatar: "https://randomuser.me/api/portraits/men/68.jpg",
      },
    ];

    const locations = ["Phòng tập A", "Phòng tập B", "Khu vực ngoài trời"];
    const timeSlots = [
      { start: "08:00", end: "09:30" },
      { start: "10:00", end: "11:30" },
      { start: "13:30", end: "15:00" },
      { start: "15:30", end: "17:00" },
      { start: "17:30", end: "19:00" },
    ];

    // Generate 15 appointments across past, present, and future
    for (let i = 0; i < 15; i++) {
      const appointmentDate = new Date(startDate);
      appointmentDate.setDate(appointmentDate.getDate() + i);
      const dateString = appointmentDate.toISOString().split("T")[0];

      const trainer = trainers[Math.floor(Math.random() * trainers.length)];
      const timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];

      // Determine status based on date
      let status;
      const now = new Date();
      if (appointmentDate < now) {
        status = Math.random() > 0.2 ? "COMPLETED" : "CANCELLED";
      } else if (appointmentDate.getDate() === now.getDate()) {
        status = Math.random() > 0.5 ? "CONFIRMED" : "PENDING";
      } else {
        status = Math.random() > 0.6 ? "CONFIRMED" : "PENDING";
      }

      mockData.push({
        id: `app-${i}`,
        date: dateString,
        timeStart: timeSlot.start,
        timeEnd: timeSlot.end,
        trainer: trainer,
        location: location,
        status: status,
        notes: "Tập trung vào bài tập cơ vai và lưng.",
        exercises:
          status === "COMPLETED" || status === "CONFIRMED"
            ? "- Khởi động: 10 phút chạy nhẹ\n- Push-up: 3 hiệp x 15 lần\n- Pull-up: 3 hiệp x 8 lần\n- Plank: 3 hiệp x 45 giây\n- Squat: 3 hiệp x 20 lần"
            : "",
      });
    }

    return mockData;
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        toast.error("Bạn cần đăng nhập để hủy lịch tập. Vui lòng đăng nhập lại.");
        return;
      }

      // Validate appointment ID
      if (!appointmentId) {
        toast.error("Không tìm thấy thông tin buổi tập. Vui lòng thử lại.");
        return;
      }

      // Find the appointment to check if it can be cancelled
      const appointment = appointments.find(app => app.id === appointmentId);
      if (!appointment) {
        toast.error("Không tìm thấy buổi tập trong danh sách. Vui lòng làm mới trang.");
        return;
      }

      // Check if appointment is already cancelled or completed
      if (appointment.status === "CANCELLED") {
        toast.warning("Buổi tập này đã được hủy trước đó.");
        return;
      }

      if (appointment.status === "COMPLETED") {
        toast.warning("Không thể hủy buổi tập đã hoàn thành.");
        return;
      }

      // Check if appointment is in the past
      const appointmentDate = new Date(`${appointment.date}T${appointment.timeStart}`);
      if (appointmentDate < new Date()) {
        toast.warning("Không thể hủy buổi tập đã diễn ra.");
        return;
      }

      // Call the API to cancel the appointment
      const response = await axios.patch(
        `http://localhost:3000/appointments/${appointmentId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data && response.data.status === 'SUCCESS') {
        // Update local state
        setAppointments(
          appointments.map((app) =>
            app.id === appointmentId ? { ...app, status: "CANCELLED" } : app
          )
        );

        setShowDetailsModal(false);
        toast.success("Đã hủy lịch tập thành công!");
      } else {
        throw new Error("Hủy lịch tập không thành công");
      }
    } catch (error) {
      console.error("Lỗi khi hủy lịch tập:", error);

      // Provide more specific error messages based on the error type
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 401 || error.response.status === 403) {
          toast.error("Bạn không có quyền hủy buổi tập này. Vui lòng đăng nhập lại.");
        } else if (error.response.status === 404) {
          toast.error("Không tìm thấy buổi tập. Buổi tập có thể đã bị xóa.");
        } else if (error.response.status === 400) {
          toast.error(`Lỗi dữ liệu: ${error.response.data?.message || 'Không thể hủy buổi tập này'}`);
        } else {
          toast.error(`Lỗi từ máy chủ: ${error.response.data?.message || 'Vui lòng thử lại sau'}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.");
      } else {
        // Something happened in setting up the request that triggered an Error
        toast.error("Lỗi khi hủy lịch tập: " + error.message);
      }
    }
  };

  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day); // Get to Sunday

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }

    return dates;
  };

  // Thêm function để kiểm tra ngày có lịch tập không
  const hasAppointmentsOnDate = (date) => {
    const dateString = date.toISOString().split("T")[0];
    return appointments.some(appointment => 
      appointment.date === dateString && 
      appointment.status !== "CANCELLED"
    );
  };

  // Thêm function để đếm số lịch tập trong ngày
  const getAppointmentCountOnDate = (date) => {
    const dateString = date.toISOString().split("T")[0];
    return appointments.filter(appointment => 
      appointment.date === dateString && 
      appointment.status !== "CANCELLED"
    ).length;
  };

  // Thêm function để lấy thông tin chi tiết lịch tập trong ngày
  const getAppointmentInfoOnDate = (date) => {
    const dateString = date.toISOString().split("T")[0];
    const dayAppointments = appointments.filter(appointment => 
      appointment.date === dateString && 
      appointment.status !== "CANCELLED"
    );
    
    const statusCounts = {
      confirmed: dayAppointments.filter(app => app.status === "CONFIRMED").length,
      pending: dayAppointments.filter(app => app.status === "PENDING").length,
      completed: dayAppointments.filter(app => app.status === "COMPLETED").length,
    };
    
    return {
      total: dayAppointments.length,
      statusCounts,
      hasConfirmed: statusCounts.confirmed > 0,
      hasPending: statusCounts.pending > 0,
      hasCompleted: statusCounts.completed > 0,
      appointments: dayAppointments,
    };
  };

  // Thêm function để tạo tooltip text
  const getTooltipText = (appointmentInfo) => {
    if (appointmentInfo.total === 0) return "";
    
    let tooltipText = `${appointmentInfo.total} buổi tập:\n`;
    if (appointmentInfo.statusCounts.confirmed > 0) {
      tooltipText += `• ${appointmentInfo.statusCounts.confirmed} đã xác nhận\n`;
    }
    if (appointmentInfo.statusCounts.pending > 0) {
      tooltipText += `• ${appointmentInfo.statusCounts.pending} chờ xác nhận\n`;
    }
    if (appointmentInfo.statusCounts.completed > 0) {
      tooltipText += `• ${appointmentInfo.statusCounts.completed} hoàn thành\n`;
    }
    return tooltipText.trim();
  };

  // Thêm function để xử lý việc chọn ngày
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    
    // Nếu ngày được chọn có lịch tập, scroll đến phần lịch tập
    const hasAppointments = hasAppointmentsOnDate(date);
    if (hasAppointments) {
      // Delay một chút để component re-render trước khi scroll
      setTimeout(() => {
        const scheduleSection = document.querySelector('#schedule-section');
        if (scheduleSection) {
          scheduleSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
    }
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction * 7);
    setSelectedDate(newDate);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            Đã xác nhận
          </span>
        );
      case "PENDING":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            Chờ xác nhận
          </span>
        );
      case "COMPLETED":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            Hoàn thành
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            Đã hủy
          </span>
        );
      default:
        return null;
    }
  };

  const getFilteredAppointments = () => {
    return appointments.filter((appointment) => {
      const matchesFilter =
        filterStatus === "all" || appointment.status === filterStatus;
      const matchesSearch =
        searchTerm === "" ||
        appointment.trainer.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        appointment.location.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  };

  const getTodayAppointments = () => {
    const today = new Date().toISOString().split("T")[0];
    return appointments.filter(
      (appointment) =>
        appointment.date === today &&
        (appointment.status === "CONFIRMED" || appointment.status === "PENDING")
    );
  };

  const getUpcomingAppointments = () => {
    const today = new Date().toISOString().split("T")[0];
    return appointments
      .filter(
        (appointment) =>
          appointment.date > today && appointment.status !== "CANCELLED"
      )
      .sort(
        (a, b) =>
          new Date(`${a.date}T${a.timeStart}`) -
          new Date(`${b.date}T${b.timeStart}`)
      );
  };

  // Hàm xử lý lưu đánh giá
  const handleSaveRating = async (appointmentId, ratingData) => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        return;
      }

      console.log("Sending rating data:", { appointmentId, ratingData });

      const response = await axios.post(
        `http://localhost:3000/appointments/${appointmentId}/rating`,
        ratingData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Rating API Response:", response.data);

      // More flexible response handling
      if (response.data) {
        // Update local state
        setAppointments(
          appointments.map((appointment) =>
            appointment.id === appointmentId
              ? {
                  ...appointment,
                  rating: ratingData.rating,
                  ratingComment: ratingData.comment,
                }
              : appointment
          )
        );

        toast.success("Cảm ơn bạn đã đánh giá buổi tập!");
      } else {
        console.error("Empty response from rating API");
        throw new Error("Không nhận được phản hồi từ máy chủ");
      }
    } catch (error) {
      console.error("Lỗi khi lưu đánh giá:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        appointmentId,
        ratingData
      });
      
      // Provide more specific error messages based on the error type
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 401 || error.response.status === 403) {
          toast.error("Bạn không có quyền đánh giá buổi tập này. Vui lòng đăng nhập lại.");
        } else if (error.response.status === 404) {
          toast.error("Không tìm thấy buổi tập để đánh giá.");
        } else if (error.response.status === 400) {
          toast.error(`Lỗi dữ liệu: ${error.response.data?.message || 'Dữ liệu đánh giá không hợp lệ'}`);
        } else {
          toast.error(`Lỗi từ máy chủ: ${error.response.data?.message || 'Vui lòng thử lại sau'}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.");
      } else {
        // Something happened in setting up the request that triggered an Error
        toast.error("Lỗi khi lưu đánh giá: " + error.message);
      }
      throw error;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="p-6 max-w-sm bg-white rounded-lg shadow-md">
          <h2 className="text-lg font-medium text-red-600 mb-2">{error}</h2>
          <p className="text-gray-600 mb-4">
            Vui lòng đăng nhập để xem lịch tập của bạn.
          </p>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => (window.location.href = "/login")}
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Lịch tập cá nhân
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Thông tin nhanh */}
              <div className="bg-white rounded-lg shadow p-5">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Tổng quan
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-gray-600">Hôm nay</span>
                    </div>
                    <span className="font-semibold">
                      {getTodayAppointments().length} buổi tập
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <CalendarDays className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-gray-600">Sắp tới</span>
                    </div>
                    <span className="font-semibold">
                      {getUpcomingAppointments().length} buổi tập
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <Dumbbell className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-gray-600">Tổng buổi tập</span>
                    </div>
                    <span className="font-semibold">
                      {
                        appointments.filter((app) => app.status !== "CANCELLED")
                          .length
                      }{" "}
                      buổi
                    </span>
                  </div>
                </div>
              </div>

              {/* Buổi tập hôm nay */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-5 py-4 border-b">
                  <h2 className="text-lg font-medium text-gray-900">
                    Buổi tập hôm nay
                  </h2>
                </div>
                <div className="p-3">
                  {loading ? (
                    <div className="py-4 flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : getTodayAppointments().length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>Không có buổi tập nào hôm nay</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {getTodayAppointments().map((appointment) => (
                        <div
                          key={appointment.id}
                          className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer"
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowDetailsModal(true);
                          }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-medium">
                              PT: {appointment.trainer.name}
                            </p>
                            {getStatusBadge(appointment.status)}
                          </div>
                          <div className="flex items-center text-sm text-gray-600 mb-1">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            <span>
                              {appointment.timeStart} - {appointment.timeEnd}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-3.5 w-3.5 mr-1" />
                            <span>{appointment.location}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sắp tới */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-5 py-4 border-b">
                  <h2 className="text-lg font-medium text-gray-900">Sắp tới</h2>
                </div>
                <div className="p-3">
                  {loading ? (
                    <div className="py-4 flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : getUpcomingAppointments().length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>Không có buổi tập nào sắp tới</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {getUpcomingAppointments()
                        .slice(0, 3)
                        .map((appointment) => (
                          <div
                            key={appointment.id}
                            className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer"
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setShowDetailsModal(true);
                            }}
                          >
                            <div className="text-xs text-gray-500 mb-1">
                              {moment(appointment.date).format("dddd, DD/MM")}
                            </div>
                            <p className="font-medium mb-1">
                              PT: {appointment.trainer.name}
                            </p>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              <span>
                                {appointment.timeStart} - {appointment.timeEnd}
                              </span>
                            </div>
                          </div>
                        ))}

                      {getUpcomingAppointments().length > 3 && (
                        <div className="text-center pt-2">
                          <button className="text-blue-600 text-sm hover:text-blue-800">
                            Xem thêm {getUpcomingAppointments().length - 3} buổi
                            tập
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Date navigation */}
              <div className="px-6 py-4 flex justify-between items-center border-b">
                <div className="flex items-center space-x-4">
                  <button
                    className="p-1.5 rounded-full hover:bg-gray-100"
                    onClick={() => navigateWeek(-1)}
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>

                  <h2 className="text-lg font-medium">
                    {moment(getWeekDates()[0]).format("DD/MM")} -{" "}
                    {moment(getWeekDates()[6]).format("DD/MM/YYYY")}
                  </h2>

                  <button
                    className="p-1.5 rounded-full hover:bg-gray-100"
                    onClick={() => navigateWeek(1)}
                  >
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  </button>

                  <button
                    className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                    onClick={() => setSelectedDate(new Date())}
                  >
                    Hôm nay
                  </button>

                  {/* Legend cho highlighting */}
                  <div className="flex items-center space-x-4 ml-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                      <span className="text-gray-600">Hôm nay</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                      <span className="text-gray-600">Đã xác nhận</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                      <span className="text-gray-600">Chờ xác nhận</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                      <span className="text-gray-600">Hoàn thành</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Tìm PT hoặc địa điểm..."
                      className="pl-9 pr-4 py-2 border rounded-lg text-sm w-48"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>

                  <div className="relative">
                    <select
                      className="pl-9 pr-4 py-2 border rounded-lg text-sm appearance-none bg-white"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">Tất cả</option>
                      <option value="PENDING">Chờ xác nhận</option>
                      <option value="CONFIRMED">Đã xác nhận</option>
                      <option value="COMPLETED">Hoàn thành</option>
                      <option value="CANCELLED">Đã hủy</option>
                    </select>
                    <Filter className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                </div>
              </div>

              {/* Week view */}
              <div className="grid grid-cols-7 border-b">
                {getWeekDates().map((date, index) => {
                  const isToday =
                    new Date().toDateString() === date.toDateString();
                  const isSelected =
                    selectedDate.toDateString() === date.toDateString();
                  const hasAppointments = hasAppointmentsOnDate(date);
                  const appointmentInfo = getAppointmentInfoOnDate(date);

                  return (
                    <div
                      key={index}
                      className={`text-center py-3 border-r last:border-r-0 cursor-pointer relative
                        ${isToday ? "bg-blue-50" : ""} 
                        ${isSelected ? "border-t-2 border-t-blue-500" : ""}
                        ${hasAppointments ? "bg-green-50" : ""}
                        hover:bg-gray-100 transition-colors duration-200`}
                      onClick={() => handleDateSelect(date)}
                      title={hasAppointments ? getTooltipText(appointmentInfo) : ""}
                    >
                      <div className="text-xs text-gray-500">
                        {moment(date).format("dd").toUpperCase()}
                      </div>
                      <div
                        className={`text-lg font-medium ${
                          isToday ? "text-blue-600" : ""
                        } ${hasAppointments && !isToday ? "text-green-600" : ""}`}
                      >
                        {date.getDate()}
                      </div>
                      
                      {/* Hiển thị indicator cho ngày có lịch tập */}
                      {hasAppointments && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                          <div className="flex items-center justify-center space-x-1">
                            {/* Hiển thị dots cho các trạng thái khác nhau */}
                            {appointmentInfo.hasConfirmed && (
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            )}
                            {appointmentInfo.hasPending && (
                              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            )}
                            {appointmentInfo.hasCompleted && (
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            )}
                            
                            {/* Hiển thị số lượng nếu có nhiều hơn 1 */}
                            {appointmentInfo.total > 1 && (
                              <span className="text-xs font-medium text-gray-600 ml-1">
                                {appointmentInfo.total}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Schedule for selected date */}
              <div className="p-6" id="schedule-section">
                <h3 className="text-lg font-medium mb-4">
                  Lịch tập ngày {moment(selectedDate).format("DD/MM/YYYY")}
                </h3>

                {loading ? (
                  <div className="py-16 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : getFilteredAppointments().filter(
                    (appointment) =>
                      appointment.date ===
                      selectedDate.toISOString().split("T")[0]
                  ).length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-700 mb-1">
                      Không có buổi tập nào
                    </h3>
                    <p>Bạn không có lịch tập nào vào ngày này.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getFilteredAppointments()
                      .filter(
                        (appointment) =>
                          appointment.date ===
                          selectedDate.toISOString().split("T")[0]
                      )
                      .sort((a, b) => a.timeStart.localeCompare(b.timeStart))
                      .map((appointment) => (
                        <div
                          key={appointment.id}
                          className="bg-white border rounded-lg shadow-sm hover:shadow transition-shadow overflow-hidden"
                        >
                          <div className="flex">
                            {/* Time sidebar */}
                            <div className="w-24 bg-gray-50 py-4 px-3 flex flex-col items-center justify-center border-r">
                              <div className="text-lg font-medium text-gray-900">
                                {appointment.timeStart}
                              </div>
                              <div className="text-xs text-gray-500">đến</div>
                              <div className="text-lg font-medium text-gray-900">
                                {appointment.timeEnd}
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={
                                        appointment.trainer.avatar ||
                                        "https://via.placeholder.com/40"
                                      }
                                      alt={appointment.trainer.name}
                                      className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                      <h4 className="font-medium text-lg text-gray-900">
                                        {appointment.trainer.name}
                                      </h4>
                                      <div className="text-sm text-gray-600">
                                        {appointment.trainer.specialty}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div>{getStatusBadge(appointment.status)}</div>
                              </div>

                              <div className="flex items-center text-sm text-gray-600 mb-3">
                                <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                                <span>{appointment.location}</span>
                              </div>

                              {appointment.exercises && (
                                <div className="bg-blue-50 rounded-lg p-3 mb-3">
                                  <div className="flex items-center mb-2">
                                    <Dumbbell className="h-4 w-4 text-blue-600 mr-1" />
                                    <span className="text-sm font-medium text-blue-600">
                                      Bài tập của bạn
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-700 whitespace-pre-line line-clamp-2">
                                    {appointment.exercises}
                                  </div>
                                  <button
                                    className="text-blue-600 text-xs mt-1 hover:underline"
                                    onClick={() => {
                                      setSelectedAppointment(appointment);
                                      setShowDetailsModal(true);
                                    }}
                                  >
                                    Xem chi tiết
                                  </button>
                                </div>
                              )}

                              <div className="flex justify-end items-center mt-3 pt-3 border-t">
                                {appointment.status === "COMPLETED" && (
                                  <div className="flex items-center space-x-2">
                                    {appointment.rating ? (
                                      <button
                                        className="px-3 py-1.5 bg-yellow-50 text-yellow-600 text-sm rounded-lg border border-yellow-100 hover:bg-yellow-100 flex items-center"
                                        onClick={() => {
                                          setSelectedAppointmentForRating(appointment);
                                          setShowRatingModal(true);
                                        }}
                                      >
                                        <Star className="h-4 w-4 mr-1" />
                                        Cập nhật đánh giá ({appointment.rating} sao)
                                      </button>
                                    ) : (
                                      <button
                                        className="px-3 py-1.5 bg-blue-50 text-blue-600 text-sm rounded-lg border border-blue-100 hover:bg-blue-100 flex items-center"
                                        onClick={() => {
                                          setSelectedAppointmentForRating(appointment);
                                          setShowRatingModal(true);
                                        }}
                                      >
                                        <Star className="h-4 w-4 mr-1" />
                                        Đánh giá buổi tập
                                      </button>
                                    )}
                                  </div>
                                )}

                                {(appointment.status === "PENDING" ||
                                  appointment.status === "CONFIRMED") && (
                                  <button
                                    className="px-3 py-1.5 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 hover:bg-red-100"
                                    onClick={() => {
                                      setSelectedAppointment(appointment);
                                      setShowDetailsModal(true);
                                    }}
                                  >
                                    Hủy buổi tập
                                  </button>
                                )}

                                <button
                                  className="px-3 py-1.5 bg-blue-50 text-blue-600 text-sm rounded-lg border border-blue-100 hover:bg-blue-100 ml-2"
                                  onClick={() => {
                                    setSelectedAppointment(appointment);
                                    setShowDetailsModal(true);
                                  }}
                                >
                                  Xem chi tiết
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Phần hiển thị đánh giá cho buổi tập đã hoàn thành */}
                          {appointment.status === "COMPLETED" && appointment.rating && (
                            <div className="px-4 py-3 bg-gray-50 border-t">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-700">Đánh giá của bạn:</span>
                                  <StarRating rating={appointment.rating} readonly={true} />
                                </div>
                                {appointment.ratingComment && (
                                  <p className="text-sm text-gray-600 italic">
                                    "{appointment.ratingComment}"
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chi tiết buổi tập Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Chi tiết buổi tập
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowDetailsModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-xl font-medium text-gray-900">
                    Buổi tập với {selectedAppointment.trainer.name}
                  </h4>
                  {getStatusBadge(selectedAppointment.status)}
                </div>

                <div className="text-gray-600 mb-1">
                  {moment(selectedAppointment.date).format("dddd, DD/MM/YYYY")}
                </div>

                <div className="text-gray-600">
                  {selectedAppointment.timeStart} -{" "}
                  {selectedAppointment.timeEnd}, {selectedAppointment.location}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h5 className="font-medium text-gray-900 mb-2">
                  Thông tin huấn luyện viên
                </h5>
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={
                      selectedAppointment.trainer.avatar ||
                      "https://via.placeholder.com/60"
                    }
                    alt={selectedAppointment.trainer.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-medium">
                      {selectedAppointment.trainer.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedAppointment.trainer.specialty}
                    </div>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center">
                    <svg
                      className="h-4 w-4 text-gray-500 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span>{selectedAppointment.trainer.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="h-4 w-4 text-gray-500 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{selectedAppointment.trainer.email}</span>
                  </div>
                </div>
              </div>

              {selectedAppointment.exercises && (
                <div className="mb-4">
                  <h5 className="font-medium text-gray-900 mb-2">
                    Bài tập của bạn
                  </h5>
                  <div className="bg-blue-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-line">
                    {selectedAppointment.exercises}
                  </div>
                </div>
              )}

              {selectedAppointment.notes && (
                <div className="mb-4">
                  <h5 className="font-medium text-gray-900 mb-2">Ghi chú</h5>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                    {selectedAppointment.notes}
                  </div>
                </div>
              )}

              {/* Phần hiển thị đánh giá trong modal chi tiết */}
              {selectedAppointment.status === "COMPLETED" && (
                <div className="mb-4">
                  <h5 className="font-medium text-gray-900 mb-2">Đánh giá của bạn</h5>
                  {selectedAppointment.rating ? (
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Số sao:</span>
                        <StarRating rating={selectedAppointment.rating} readonly={true} />
                      </div>
                      {selectedAppointment.ratingComment && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Nhận xét:</span>
                          <p className="text-sm text-gray-600 mt-1 italic">
                            "{selectedAppointment.ratingComment}"
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-sm text-gray-500 mb-2">
                        Bạn chưa đánh giá buổi tập này
                      </p>
                      <button
                        className="text-blue-600 text-sm hover:underline"
                        onClick={() => {
                          setSelectedAppointmentForRating(selectedAppointment);
                          setShowDetailsModal(false);
                          setShowRatingModal(true);
                        }}
                      >
                        Đánh giá ngay
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                {selectedAppointment.status === "COMPLETED" && (
                  <button
                    className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 py-2 rounded-lg flex items-center justify-center"
                    onClick={() => {
                      setSelectedAppointmentForRating(selectedAppointment);
                      setShowDetailsModal(false);
                      setShowRatingModal(true);
                    }}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    {selectedAppointment.rating ? "Cập nhật đánh giá" : "Đánh giá buổi tập"}
                  </button>
                )}

                {(selectedAppointment.status === "PENDING" ||
                  selectedAppointment.status === "CONFIRMED") && (
                  <button
                    className="flex-1 bg-red-100 text-red-600 hover:bg-red-200 py-2 rounded-lg"
                    onClick={() => cancelAppointment(selectedAppointment.id)}
                  >
                    Hủy buổi tập
                  </button>
                )}

                <button
                  className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 py-2 rounded-lg"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal đánh giá */}
      {showRatingModal && selectedAppointmentForRating && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedAppointmentForRating.rating ? "Cập nhật đánh giá" : "Đánh giá buổi tập"}
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowRatingModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <RatingForm
              appointment={selectedAppointmentForRating}
              onClose={() => setShowRatingModal(false)}
              onSave={handleSaveRating}
            />
          </div>
        </div>
      )}
    </div>
  );
}
