import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import moment from "moment";
import "moment/locale/vi";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  MapPin,
  CheckCircle,
  XCircle,
  Dumbbell,
  Plus,
  MoreHorizontal,
  Search,
  Filter,
  Star,
  CalendarDays,
  X,
  Activity,
  TrendingUp,
  Heart,
  Target,
  User,
  Phone,
  Mail,
  Edit3,
  Eye,
  AlertCircle,
  Award,
  BarChart3,
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
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
          } transition-transform`}
          disabled={readonly}
        >
          <Star
            className={`h-4 w-4 ${
              star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

// Component form kết quả buổi tập
const WorkoutResultForm = ({ booking, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    calories_burned: booking.workoutResult?.calories_burned || "",
    current_weight: booking.workoutResult?.current_weight || "",
    bmi: booking.workoutResult?.bmi || "",
    workout_duration_minutes:
      booking.workoutResult?.workout_duration_minutes || "",
    completion_percentage: booking.workoutResult?.completion_percentage || "",
    performance_notes: booking.workoutResult?.performance_notes || "",
    trainer_rating: booking.workoutResult?.trainer_rating || 0,
    trainer_feedback: booking.workoutResult?.trainer_feedback || "",
    heart_rate_avg: booking.workoutResult?.heart_rate_avg || "",
    heart_rate_max: booking.workoutResult?.heart_rate_max || "",
    exercises_completed: booking.workoutResult?.exercises_completed || "",
    next_session_recommendations:
      booking.workoutResult?.next_session_recommendations || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const processedData = {
        ...formData,
        calories_burned: formData.calories_burned
          ? parseFloat(formData.calories_burned)
          : undefined,
        current_weight: formData.current_weight
          ? parseFloat(formData.current_weight)
          : undefined,
        bmi: formData.bmi ? parseFloat(formData.bmi) : undefined,
        workout_duration_minutes: formData.workout_duration_minutes
          ? parseInt(formData.workout_duration_minutes)
          : undefined,
        completion_percentage: formData.completion_percentage
          ? parseInt(formData.completion_percentage)
          : undefined,
        heart_rate_avg: formData.heart_rate_avg
          ? parseFloat(formData.heart_rate_avg)
          : undefined,
        heart_rate_max: formData.heart_rate_max
          ? parseFloat(formData.heart_rate_max)
          : undefined,
        trainer_rating: formData.trainer_rating || undefined,
      };

      await onSave(booking.id, processedData);
      onClose();
    } catch (error) {
      console.error("Lỗi khi lưu kết quả buổi tập:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-h-[70vh] overflow-y-auto">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {booking.workoutResult
            ? "Cập nhật kết quả buổi tập"
            : "Ghi kết quả buổi tập"}
        </h3>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <img
              src={
                booking.customer?.avatar ||
                "https://randomuser.me/api/portraits/men/32.jpg"
              }
              alt={booking.customer?.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-medium text-gray-900">
                {booking.customer?.name}
              </p>
              <p className="text-sm text-gray-600">
                {moment(booking.date).format("DD/MM/YYYY")}, {booking.timeStart}{" "}
                - {booking.timeEnd}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Metrics cơ bản */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 border-b pb-2">
            Chỉ số cơ bản
          </h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calo tiêu thụ
            </label>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="350"
              value={formData.calories_burned}
              onChange={(e) =>
                handleInputChange("calories_burned", e.target.value)
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cân nặng hiện tại (kg)
            </label>
            <input
              type="number"
              step="0.1"
              className="w-full border rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="70.5"
              value={formData.current_weight}
              onChange={(e) =>
                handleInputChange("current_weight", e.target.value)
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thời gian tập (phút)
            </label>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="60"
              value={formData.workout_duration_minutes}
              onChange={(e) =>
                handleInputChange("workout_duration_minutes", e.target.value)
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mức độ hoàn thành (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              className="w-full border rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="85"
              value={formData.completion_percentage}
              onChange={(e) =>
                handleInputChange("completion_percentage", e.target.value)
              }
            />
          </div>
        </div>

        {/* Chỉ số sức khỏe */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 border-b pb-2">
            Chỉ số sức khỏe
          </h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              BMI
            </label>
            <input
              type="number"
              step="0.1"
              className="w-full border rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="22.5"
              value={formData.bmi}
              onChange={(e) => handleInputChange("bmi", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nhịp tim trung bình
            </label>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="140"
              value={formData.heart_rate_avg}
              onChange={(e) =>
                handleInputChange("heart_rate_avg", e.target.value)
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nhịp tim tối đa
            </label>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="170"
              value={formData.heart_rate_max}
              onChange={(e) =>
                handleInputChange("heart_rate_max", e.target.value)
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đánh giá khách hàng (1-5 sao)
            </label>
            <div className="mt-2">
              <StarRating
                rating={formData.trainer_rating}
                onRatingChange={(rating) =>
                  handleInputChange("trainer_rating", rating)
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ghi chú chi tiết */}
      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ghi chú hiệu suất
          </label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 min-h-[80px] focus:ring-blue-500 focus:border-blue-500"
            placeholder="Khách hàng thực hiện tốt các bài tập..."
            value={formData.performance_notes}
            onChange={(e) =>
              handleInputChange("performance_notes", e.target.value)
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bài tập đã hoàn thành
          </label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 min-h-[80px] focus:ring-blue-500 focus:border-blue-500"
            placeholder="- Squat: 3x12 ✓\n- Push-up: 3x10 ✓\n- Plank: 3x30s ✓"
            value={formData.exercises_completed}
            onChange={(e) =>
              handleInputChange("exercises_completed", e.target.value)
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phản hồi của PT
          </label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 min-h-[80px] focus:ring-blue-500 focus:border-blue-500"
            placeholder="Khách hàng cần cải thiện về..."
            value={formData.trainer_feedback}
            onChange={(e) =>
              handleInputChange("trainer_feedback", e.target.value)
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gợi ý cho buổi tập tiếp theo
          </label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 min-h-[80px] focus:ring-blue-500 focus:border-blue-500"
            placeholder="Tăng cường bài tập cơ core..."
            value={formData.next_session_recommendations}
            onChange={(e) =>
              handleInputChange("next_session_recommendations", e.target.value)
            }
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 mt-6 border-t">
        <button
          className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Hủy
        </button>
        <button
          className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Đang lưu..." : "Lưu kết quả"}
        </button>
      </div>
    </div>
  );
};

export default function PTScheduleComponent() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showWorkoutResultModal, setShowWorkoutResultModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  // Form states
  const [exercises, setExercises] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState({
    type: null,
    data: null,
  });

  const { user, isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    if (isLoggedIn && user) {
      fetchData();
    }
  }, [isLoggedIn, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("userToken");
      if (!token) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        return;
      }

      const response = await axios.get(
        "http://localhost:3000/appointments/trainer/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.data) {
        const transformedData = response.data.data.map((appointment) => ({
          id: appointment.id,
          date: appointment.date
            ? appointment.date.split("T")[0]
            : new Date().toISOString().split("T")[0],
          timeStart: appointment.timeSlot?.startTime || "00:00",
          timeEnd: appointment.timeSlot?.endTime || "00:00",
          customer: {
            id: appointment.user?.id || "unknown",
            name:
              appointment.user?.full_name ||
              appointment.user?.fullName ||
              appointment.user?.username ||
              "Khách hàng không xác định",
            phone: appointment.user?.phone || "Chưa có thông tin",
            email: appointment.user?.email || "Chưa có thông tin",
            avatar: appointment.user?.profileImage || null,
          },
          location: appointment.location || "Phòng tập chính",
          status: appointment.status,
          notes: appointment.notes || "",
          exercises: appointment.exercises || "",
          rating: appointment.rating?.rating || null,
          ratingComment: appointment.rating?.comment || "",
          workoutResult: appointment.workoutResult || null,
          createdAt: appointment.created_at || new Date().toISOString(),
        }));

        setSchedules(transformedData);
      } else {
        setSchedules([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu lịch tập:", error);

      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          setError(
            "Bạn không có quyền xem dữ liệu này. Vui lòng đăng nhập lại."
          );
        } else if (error.response.status === 404) {
          setError(
            "Không tìm thấy dữ liệu. Vui lòng kiểm tra cấu hình hệ thống."
          );
        } else {
          setError(
            `Lỗi từ máy chủ: ${
              error.response.data?.message || "Vui lòng thử lại sau"
            }`
          );
        }
      } else if (error.request) {
        setError(
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng."
        );
      } else {
        setError("Lỗi khi tải dữ liệu: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }

    return dates;
  };

  const hasSchedulesOnDate = (date) => {
    const dateString = date.toISOString().split("T")[0];
    return schedules.some(
      (schedule) =>
        schedule.date === dateString && schedule.status !== "CANCELLED"
    );
  };

  const getScheduleInfoOnDate = (date) => {
    const dateString = date.toISOString().split("T")[0];
    const daySchedules = schedules.filter(
      (schedule) =>
        schedule.date === dateString && schedule.status !== "CANCELLED"
    );

    const statusCounts = {
      confirmed: daySchedules.filter((s) => s.status === "CONFIRMED").length,
      pending: daySchedules.filter((s) => s.status === "PENDING").length,
      completed: daySchedules.filter((s) => s.status === "COMPLETED").length,
    };

    return {
      total: daySchedules.length,
      statusCounts,
      hasConfirmed: statusCounts.confirmed > 0,
      hasPending: statusCounts.pending > 0,
      hasCompleted: statusCounts.completed > 0,
      schedules: daySchedules,
    };
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction * 7);
    setSelectedDate(newDate);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);

    const hasSchedules = hasSchedulesOnDate(date);
    if (hasSchedules) {
      setTimeout(() => {
        const scheduleSection = document.querySelector("#schedule-section");
        if (scheduleSection) {
          scheduleSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    }
  };

  const getFilteredSchedules = () => {
    return schedules.filter((schedule) => {
      const matchesFilter =
        filterType === "all" || schedule.status === filterType;

      const matchesSearch =
        searchTerm === "" ||
        schedule.customer.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        schedule.location.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  };

  const getTodaySchedules = () => {
    const today = new Date().toISOString().split("T")[0];
    return schedules.filter(
      (schedule) =>
        schedule.date === today &&
        (schedule.status === "CONFIRMED" || schedule.status === "PENDING")
    );
  };

  const getUpcomingSchedules = () => {
    const today = new Date().toISOString().split("T")[0];
    return schedules
      .filter(
        (schedule) => schedule.date > today && schedule.status !== "CANCELLED"
      )
      .sort(
        (a, b) =>
          new Date(`${a.date}T${a.timeStart}`) -
          new Date(`${b.date}T${b.timeStart}`)
      );
  };

  const getPendingSchedules = () => {
    return schedules.filter((schedule) => schedule.status === "PENDING");
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

  const handleChangeStatus = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        return;
      }

      let endpoint = "";
      let method = "patch";

      switch (newStatus) {
        case "CONFIRMED":
          endpoint = `http://localhost:3000/appointments/${bookingId}/confirm`;
          break;
        case "CANCELLED":
          endpoint = `http://localhost:3000/appointments/${bookingId}/cancel`;
          break;
        case "COMPLETED":
          endpoint = `http://localhost:3000/appointments/${bookingId}/complete`;
          break;
        default:
          throw new Error("Trạng thái không hợp lệ");
      }

      const response = await axios[method](
        endpoint,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data.status === "SUCCESS") {
        setSchedules(
          schedules.map((schedule) =>
            schedule.id === bookingId
              ? { ...schedule, status: newStatus }
              : schedule
          )
        );

        toast.success(
          `Đã ${
            newStatus === "CONFIRMED"
              ? "xác nhận"
              : newStatus === "CANCELLED"
              ? "hủy"
              : "hoàn thành"
          } lịch tập!`
        );
        setShowDetailsModal(false);
        setShowConfirmationModal(false);
      } else {
        throw new Error("Cập nhật trạng thái không thành công");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);

      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          toast.error("Bạn không có quyền thực hiện hành động này.");
        } else if (error.response.status === 404) {
          toast.error("Không tìm thấy lịch tập.");
        } else {
          toast.error(
            `Lỗi từ máy chủ: ${
              error.response.data?.message || "Vui lòng thử lại sau"
            }`
          );
        }
      } else {
        toast.error("Lỗi khi cập nhật trạng thái: " + error.message);
      }
    }
  };

  const confirmStatusChange = (bookingId, newStatus) => {
    setConfirmationAction({ type: newStatus, data: { bookingId, newStatus } });
    setShowConfirmationModal(true);
  };

  const handleSaveExercises = async () => {
    if (!exercises.trim()) {
      toast.warning("Vui lòng nhập nội dung bài tập");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        return;
      }

      const response = await axios.patch(
        `http://localhost:3000/appointments/${selectedBooking.id}/exercises`,
        { exercises },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.status === "SUCCESS") {
        setSchedules(
          schedules.map((schedule) =>
            schedule.id === selectedBooking.id
              ? { ...schedule, exercises }
              : schedule
          )
        );

        toast.success("Đã lưu bài tập thành công!");
        setShowExerciseModal(false);
        setExercises("");
      } else {
        throw new Error("Lưu bài tập không thành công");
      }
    } catch (error) {
      console.error("Lỗi khi lưu bài tập:", error);

      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          toast.error("Bạn không có quyền chỉnh sửa bài tập này.");
        } else if (error.response.status === 404) {
          toast.error("Không tìm thấy lịch tập.");
        } else {
          toast.error(
            `Lỗi từ máy chủ: ${
              error.response.data?.message || "Vui lòng thử lại sau"
            }`
          );
        }
      } else {
        toast.error("Lỗi khi lưu bài tập: " + error.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveWorkoutResult = async (bookingId, workoutResultData) => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        return;
      }

      console.log("Sending workout result data:", {
        bookingId,
        workoutResultData,
      });

      const response = await axios.post(
        `http://localhost:3000/appointments/${bookingId}/workout-result`,
        workoutResultData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Workout result API Response:", response.data);

      if (response.data) {
        setSchedules(
          schedules.map((schedule) =>
            schedule.id === bookingId
              ? { ...schedule, workoutResult: workoutResultData }
              : schedule
          )
        );

        toast.success("Đã lưu kết quả buổi tập thành công!");
      } else {
        console.error("Empty response from workout result API");
        throw new Error("Không nhận được phản hồi từ máy chủ");
      }
    } catch (error) {
      console.error("Lỗi khi lưu kết quả buổi tập:", error);

      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          toast.error("Bạn không có quyền ghi kết quả buổi tập này.");
        } else if (error.response.status === 404) {
          toast.error("Không tìm thấy lịch tập.");
        } else {
          toast.error(
            `Lỗi từ máy chủ: ${
              error.response.data?.message || "Vui lòng thử lại sau"
            }`
          );
        }
      } else {
        toast.error("Lỗi khi lưu kết quả: " + error.message);
      }
      throw error;
    }
  };

  const selectBooking = (booking) => {
    setSelectedBooking(booking);
    setExercises(booking.exercises || "");
  };

  // Render booking card function
  const renderBookingCard = (booking) => (
    <div
      key={booking.id}
      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
    >
      <div className="p-6">
        {/* Header with customer info and status */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-4">
            <img
              src={
                booking.customer.avatar ||
                "https://randomuser.me/api/portraits/men/32.jpg"
              }
              alt={booking.customer.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-gray-100"
            />
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">
                {booking.customer.name}
              </h3>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <Clock className="h-4 w-4 mr-1" />
                <span>
                  {booking.timeStart} - {booking.timeEnd}
                </span>
                <MapPin className="h-4 w-4 ml-3 mr-1" />
                <span>{booking.location}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            {getStatusBadge(booking.status)}
            <div className="flex items-center space-x-1">
              <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-1" />
            <span>{booking.customer.phone}</span>
          </div>
          <div className="flex items-center">
            <Mail className="h-4 w-4 mr-1" />
            <span>{booking.customer.email}</span>
          </div>
        </div>

        {/* Notes */}
        {booking.notes && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Ghi chú:</strong> {booking.notes}
            </p>
          </div>
        )}

        {/* Workout result summary */}
        {booking.workoutResult && (
          <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-900 mb-2 flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Kết quả buổi tập
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {booking.workoutResult.calories_burned && (
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Target className="h-4 w-4 text-orange-500 mr-1" />
                    <span className="text-xs text-gray-600">Calo</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {booking.workoutResult.calories_burned}
                  </p>
                </div>
              )}
              {booking.workoutResult.current_weight && (
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
                    <span className="text-xs text-gray-600">Cân nặng</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {booking.workoutResult.current_weight} kg
                  </p>
                </div>
              )}
              {booking.workoutResult.completion_percentage && (
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-xs text-gray-600">Hoàn thành</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {booking.workoutResult.completion_percentage}%
                  </p>
                </div>
              )}
              {booking.workoutResult.heart_rate_avg && (
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Heart className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-xs text-gray-600">Nhịp tim</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {booking.workoutResult.heart_rate_avg} bpm
                  </p>
                </div>
              )}
            </div>
            {booking.workoutResult.trainer_rating && (
              <div className="mt-3 pt-3 border-t border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Đánh giá hiệu suất:
                  </span>
                  <StarRating
                    rating={booking.workoutResult.trainer_rating}
                    readonly
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Member rating */}
        {booking.rating && (
          <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Đánh giá từ hội viên:
              </span>
              <StarRating rating={booking.rating} readonly />
            </div>
            {booking.ratingComment && (
              <p className="text-sm text-gray-600 mt-2 italic">
                "{booking.ratingComment}"
              </p>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
          {booking.status === "PENDING" && (
            <>
              <button
                onClick={() => confirmStatusChange(booking.id, "CONFIRMED")}
                className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Xác nhận
              </button>
              <button
                onClick={() => confirmStatusChange(booking.id, "CANCELLED")}
                className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Hủy
              </button>
            </>
          )}

          {booking.status === "CONFIRMED" && (
            <>
              <button
                onClick={() => confirmStatusChange(booking.id, "COMPLETED")}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Hoàn thành
              </button>
              <button
                onClick={() => {
                  selectBooking(booking);
                  setShowExerciseModal(true);
                }}
                className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                <Dumbbell className="h-4 w-4 mr-1" />
                {booking.exercises ? "Sửa bài tập" : "Thêm bài tập"}
              </button>
            </>
          )}

          {booking.status === "COMPLETED" && (
            <button
              onClick={() => {
                selectBooking(booking);
                setShowWorkoutResultModal(true);
              }}
              className="flex items-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              {booking.workoutResult ? "Sửa kết quả" : "Ghi kết quả"}
            </button>
          )}

          <button
            onClick={() => {
              selectBooking(booking);
              setShowDetailsModal(true);
            }}
            className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            <Eye className="h-4 w-4 mr-1" />
            Chi tiết
          </button>
        </div>
      </div>
    </div>
  );

  // Render modals
  const renderRatingModal = () => {
    if (!showRatingModal || !selectedBookingForRating) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-md mx-4">
          <RatingForm
            booking={selectedBookingForRating}
            onClose={() => {
              setShowRatingModal(false);
              setSelectedBookingForRating(null);
            }}
            onSave={handleSaveRating}
          />
        </div>
      </div>
    );
  };

  const renderWorkoutResultModal = () => {
    if (!showWorkoutResultModal || !selectedBookingForWorkoutResult)
      return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
          <WorkoutResultForm
            booking={selectedBookingForWorkoutResult}
            onClose={() => {
              setShowWorkoutResultModal(false);
              setSelectedBookingForWorkoutResult(null);
            }}
            onSave={handleSaveWorkoutResult}
          />
        </div>
      </div>
    );
  };

  if (!isLoggedIn) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Lỗi truy cập
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Thử lại
              </button>
              <button
                onClick={() => (window.location.href = "/login")}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Đăng nhập lại
              </button>
            </div>
          </div>
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
              Quản lý lịch tập - PT
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
                      {getTodaySchedules().length} buổi tập
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                        <Clock className="h-4 w-4 text-yellow-600" />
                      </div>
                      <span className="text-gray-600">Chờ xác nhận</span>
                    </div>
                    <span className="font-semibold">
                      {getPendingSchedules().length} buổi
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
                      {getUpcomingSchedules().length} buổi tập
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                        <Users className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="text-gray-600">Tổng khách hàng</span>
                    </div>
                    <span className="font-semibold">
                      {
                        new Set(
                          schedules
                            .filter((s) => s.status !== "CANCELLED")
                            .map((s) => s.customer.id)
                        ).size
                      }{" "}
                      người
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
                  ) : getTodaySchedules().length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>Không có buổi tập nào hôm nay</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {getTodaySchedules().map((schedule) => (
                        <div
                          key={schedule.id}
                          className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer"
                          onClick={() => {
                            setSelectedBooking(schedule);
                            setShowDetailsModal(true);
                          }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-medium">
                              KH: {schedule.customer.name}
                            </p>
                            {getStatusBadge(schedule.status)}
                          </div>
                          <div className="flex items-center text-sm text-gray-600 mb-1">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            <span>
                              {schedule.timeStart} - {schedule.timeEnd}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-3.5 w-3.5 mr-1" />
                            <span>{schedule.location}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Chờ xác nhận */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-5 py-4 border-b">
                  <h2 className="text-lg font-medium text-gray-900">
                    Chờ xác nhận
                  </h2>
                </div>
                <div className="p-3">
                  {loading ? (
                    <div className="py-4 flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : getPendingSchedules().length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>Không có lịch chờ xác nhận</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {getPendingSchedules()
                        .slice(0, 3)
                        .map((schedule) => (
                          <div
                            key={schedule.id}
                            className="p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg cursor-pointer border border-yellow-200"
                            onClick={() => {
                              setSelectedBooking(schedule);
                              setShowDetailsModal(true);
                            }}
                          >
                            <div className="text-xs text-gray-500 mb-1">
                              {moment(schedule.date).format("dddd, DD/MM")}
                            </div>
                            <p className="font-medium mb-1">
                              KH: {schedule.customer.name}
                            </p>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              <span>
                                {schedule.timeStart} - {schedule.timeEnd}
                              </span>
                            </div>
                          </div>
                        ))}

                      {getPendingSchedules().length > 3 && (
                        <div className="text-center pt-2">
                          <button className="text-yellow-600 text-sm hover:text-yellow-800">
                            Xem thêm {getPendingSchedules().length - 3} lịch tập
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
                      placeholder="Tìm khách hàng hoặc địa điểm..."
                      className="pl-9 pr-4 py-2 border rounded-lg text-sm w-48"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>

                  <div className="relative">
                    <select
                      className="pl-9 pr-4 py-2 border rounded-lg text-sm appearance-none bg-white"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
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
                  const hasSchedules = hasSchedulesOnDate(date);
                  const scheduleInfo = getScheduleInfoOnDate(date);

                  return (
                    <div
                      key={index}
                      className={`text-center py-3 border-r last:border-r-0 cursor-pointer relative
                        ${isToday ? "bg-blue-50" : ""} 
                        ${isSelected ? "border-t-2 border-t-blue-500" : ""}
                        ${hasSchedules ? "bg-green-50" : ""}
                        hover:bg-gray-100 transition-colors duration-200`}
                      onClick={() => handleDateSelect(date)}
                    >
                      <div className="text-xs text-gray-500">
                        {moment(date).format("dd").toUpperCase()}
                      </div>
                      <div
                        className={`text-lg font-medium ${
                          isToday ? "text-blue-600" : ""
                        } ${hasSchedules && !isToday ? "text-green-600" : ""}`}
                      >
                        {date.getDate()}
                      </div>

                      {/* Hiển thị indicator cho ngày có lịch tập */}
                      {hasSchedules && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                          <div className="flex items-center justify-center space-x-1">
                            {/* Hiển thị dots cho các trạng thái khác nhau */}
                            {scheduleInfo.hasConfirmed && (
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            )}
                            {scheduleInfo.hasPending && (
                              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            )}
                            {scheduleInfo.hasCompleted && (
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            )}

                            {/* Hiển thị số lượng nếu có nhiều hơn 1 */}
                            {scheduleInfo.total > 1 && (
                              <span className="text-xs font-medium text-gray-600 ml-1">
                                {scheduleInfo.total}
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
                ) : getFilteredSchedules().filter(
                    (schedule) =>
                      schedule.date === selectedDate.toISOString().split("T")[0]
                  ).length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-700 mb-1">
                      Không có lịch tập nào
                    </h3>
                    <p>Bạn không có lịch tập nào vào ngày này.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getFilteredSchedules()
                      .filter(
                        (schedule) =>
                          schedule.date ===
                          selectedDate.toISOString().split("T")[0]
                      )
                      .sort((a, b) => a.timeStart.localeCompare(b.timeStart))
                      .map((schedule) => (
                        <div
                          key={schedule.id}
                          className="bg-white border rounded-lg shadow-sm hover:shadow transition-shadow overflow-hidden"
                        >
                          <div className="flex">
                            {/* Time sidebar */}
                            <div className="w-24 bg-gray-50 py-4 px-3 flex flex-col items-center justify-center border-r">
                              <div className="text-lg font-medium text-gray-900">
                                {schedule.timeStart}
                              </div>
                              <div className="text-xs text-gray-500">đến</div>
                              <div className="text-lg font-medium text-gray-900">
                                {schedule.timeEnd}
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={
                                        schedule.customer.avatar ||
                                        "https://randomuser.me/api/portraits/men/32.jpg"
                                      }
                                      alt={schedule.customer.name}
                                      className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                      <h4 className="font-medium text-lg text-gray-900">
                                        {schedule.customer.name}
                                      </h4>
                                      <div className="text-sm text-gray-600">
                                        {schedule.customer.phone} •{" "}
                                        {schedule.customer.email}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div>{getStatusBadge(schedule.status)}</div>
                              </div>

                              <div className="flex items-center text-sm text-gray-600 mb-3">
                                <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                                <span>{schedule.location}</span>
                              </div>

                              {schedule.exercises && (
                                <div className="bg-blue-50 rounded-lg p-3 mb-3">
                                  <div className="flex items-center mb-2">
                                    <Dumbbell className="h-4 w-4 text-blue-600 mr-1" />
                                    <span className="text-sm font-medium text-blue-600">
                                      Bài tập đã giao
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-700 whitespace-pre-line line-clamp-2">
                                    {schedule.exercises}
                                  </div>
                                  <button
                                    className="text-blue-600 text-xs mt-1 hover:underline"
                                    onClick={() => {
                                      setSelectedBooking(schedule);
                                      setShowDetailsModal(true);
                                    }}
                                  >
                                    Xem chi tiết
                                  </button>
                                </div>
                              )}

                              {/* Hiển thị kết quả buổi tập nếu có */}
                              {schedule.status === "COMPLETED" &&
                                schedule.workoutResult && (
                                  <div className="bg-green-50 rounded-lg p-3 mb-3">
                                    <div className="flex items-center mb-2">
                                      <BarChart3 className="h-4 w-4 text-green-600 mr-1" />
                                      <span className="text-sm font-medium text-green-600">
                                        Kết quả buổi tập
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                      {schedule.workoutResult
                                        .calories_burned && (
                                        <div className="text-gray-700">
                                          Calo:{" "}
                                          {
                                            schedule.workoutResult
                                              .calories_burned
                                          }{" "}
                                          kcal
                                        </div>
                                      )}
                                      {schedule.workoutResult
                                        .completion_percentage && (
                                        <div className="text-gray-700">
                                          Hoàn thành:{" "}
                                          {
                                            schedule.workoutResult
                                              .completion_percentage
                                          }
                                          %
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                              {/* Hiển thị đánh giá từ khách hàng */}
                              {schedule.status === "COMPLETED" &&
                                schedule.rating && (
                                  <div className="bg-yellow-50 rounded-lg p-3 mb-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium text-yellow-600">
                                        Đánh giá từ khách hàng:
                                      </span>
                                      <StarRating
                                        rating={schedule.rating}
                                        readonly={true}
                                      />
                                    </div>
                                    {schedule.ratingComment && (
                                      <p className="text-sm text-gray-600 italic">
                                        "{schedule.ratingComment}"
                                      </p>
                                    )}
                                  </div>
                                )}

                              <div className="flex justify-end items-center mt-3 pt-3 border-t space-x-2">
                                {schedule.status === "PENDING" && (
                                  <>
                                    <button
                                      className="px-3 py-1.5 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100 hover:bg-green-100 flex items-center"
                                      onClick={() =>
                                        confirmStatusChange(
                                          schedule.id,
                                          "CONFIRMED"
                                        )
                                      }
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Xác nhận
                                    </button>
                                    <button
                                      className="px-3 py-1.5 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 hover:bg-red-100 flex items-center"
                                      onClick={() =>
                                        confirmStatusChange(
                                          schedule.id,
                                          "CANCELLED"
                                        )
                                      }
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Từ chối
                                    </button>
                                  </>
                                )}

                                {schedule.status === "CONFIRMED" && (
                                  <>
                                    <button
                                      className="px-3 py-1.5 bg-blue-50 text-blue-600 text-sm rounded-lg border border-blue-100 hover:bg-blue-100 flex items-center"
                                      onClick={() => {
                                        selectBooking(schedule);
                                        setShowExerciseModal(true);
                                      }}
                                    >
                                      <Edit3 className="h-4 w-4 mr-1" />
                                      {schedule.exercises
                                        ? "Sửa bài tập"
                                        : "Thêm bài tập"}
                                    </button>
                                    <button
                                      className="px-3 py-1.5 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100 hover:bg-green-100 flex items-center"
                                      onClick={() =>
                                        confirmStatusChange(
                                          schedule.id,
                                          "COMPLETED"
                                        )
                                      }
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Hoàn thành
                                    </button>
                                  </>
                                )}

                                {schedule.status === "COMPLETED" && (
                                  <button
                                    className="px-3 py-1.5 bg-orange-50 text-orange-600 text-sm rounded-lg border border-orange-100 hover:bg-orange-100 flex items-center"
                                    onClick={() => {
                                      selectBooking(schedule);
                                      setShowWorkoutResultModal(true);
                                    }}
                                  >
                                    <BarChart3 className="h-4 w-4 mr-1" />
                                    {schedule.workoutResult
                                      ? "Sửa kết quả"
                                      : "Ghi kết quả"}
                                  </button>
                                )}

                                <button
                                  className="px-3 py-1.5 bg-blue-50 text-blue-600 text-sm rounded-lg border border-blue-100 hover:bg-blue-100"
                                  onClick={() => {
                                    setSelectedBooking(schedule);
                                    setShowDetailsModal(true);
                                  }}
                                >
                                  Xem chi tiết
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal chi tiết buổi tập */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
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
              <div className="mb-6">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-xl font-medium text-gray-900">
                    Buổi tập với {selectedBooking.customer.name}
                  </h4>
                  {getStatusBadge(selectedBooking.status)}
                </div>

                <div className="text-gray-600 mb-1">
                  {moment(selectedBooking.date).format("dddd, DD/MM/YYYY")}
                </div>

                <div className="text-gray-600">
                  {selectedBooking.timeStart} - {selectedBooking.timeEnd},{" "}
                  {selectedBooking.location}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h5 className="font-medium text-gray-900 mb-3">
                  Thông tin khách hàng
                </h5>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={
                      selectedBooking.customer.avatar ||
                      "https://randomuser.me/api/portraits/men/32.jpg"
                    }
                    alt={selectedBooking.customer.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-medium text-lg">
                      {selectedBooking.customer.name}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>{selectedBooking.customer.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        <span>{selectedBooking.customer.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedBooking.exercises && (
                <div className="mb-6">
                  <h5 className="font-medium text-gray-900 mb-3">
                    Bài tập đã giao
                  </h5>
                  <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-line">
                    {selectedBooking.exercises}
                  </div>
                </div>
              )}

              {selectedBooking.workoutResult && (
                <div className="mb-6">
                  <h5 className="font-medium text-gray-900 mb-3">
                    Kết quả buổi tập
                  </h5>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      {selectedBooking.workoutResult.calories_burned && (
                        <div>
                          <span className="text-gray-600">Calo tiêu thụ:</span>
                          <div className="font-medium">
                            {selectedBooking.workoutResult.calories_burned} kcal
                          </div>
                        </div>
                      )}
                      {selectedBooking.workoutResult.current_weight && (
                        <div>
                          <span className="text-gray-600">Cân nặng:</span>
                          <div className="font-medium">
                            {selectedBooking.workoutResult.current_weight} kg
                          </div>
                        </div>
                      )}
                      {selectedBooking.workoutResult.completion_percentage && (
                        <div>
                          <span className="text-gray-600">Hoàn thành:</span>
                          <div className="font-medium">
                            {
                              selectedBooking.workoutResult
                                .completion_percentage
                            }
                            %
                          </div>
                        </div>
                      )}
                    </div>
                    {selectedBooking.workoutResult.trainer_feedback && (
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <span className="text-gray-600 text-sm">
                          Nhận xét của PT:
                        </span>
                        <p className="text-gray-700 mt-1">
                          {selectedBooking.workoutResult.trainer_feedback}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedBooking.status === "COMPLETED" &&
                selectedBooking.rating && (
                  <div className="mb-6">
                    <h5 className="font-medium text-gray-900 mb-3">
                      Đánh giá từ khách hàng
                    </h5>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Số sao:
                        </span>
                        <StarRating
                          rating={selectedBooking.rating}
                          readonly={true}
                        />
                      </div>
                      {selectedBooking.ratingComment && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            Nhận xét:
                          </span>
                          <p className="text-sm text-gray-600 mt-1 italic">
                            "{selectedBooking.ratingComment}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {selectedBooking.notes && (
                <div className="mb-6">
                  <h5 className="font-medium text-gray-900 mb-3">Ghi chú</h5>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                    {selectedBooking.notes}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                {selectedBooking.status === "PENDING" && (
                  <>
                    <button
                      className="flex-1 bg-green-100 text-green-600 hover:bg-green-200 py-2 rounded-lg flex items-center justify-center"
                      onClick={() => {
                        confirmStatusChange(selectedBooking.id, "CONFIRMED");
                        setShowDetailsModal(false);
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Xác nhận
                    </button>
                    <button
                      className="flex-1 bg-red-100 text-red-600 hover:bg-red-200 py-2 rounded-lg flex items-center justify-center"
                      onClick={() => {
                        confirmStatusChange(selectedBooking.id, "CANCELLED");
                        setShowDetailsModal(false);
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Từ chối
                    </button>
                  </>
                )}

                {selectedBooking.status === "CONFIRMED" && (
                  <>
                    <button
                      className="flex-1 bg-blue-100 text-blue-600 hover:bg-blue-200 py-2 rounded-lg flex items-center justify-center"
                      onClick={() => {
                        selectBooking(selectedBooking);
                        setShowDetailsModal(false);
                        setShowExerciseModal(true);
                      }}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      {selectedBooking.exercises
                        ? "Sửa bài tập"
                        : "Thêm bài tập"}
                    </button>
                    <button
                      className="flex-1 bg-green-100 text-green-600 hover:bg-green-200 py-2 rounded-lg flex items-center justify-center"
                      onClick={() => {
                        confirmStatusChange(selectedBooking.id, "COMPLETED");
                        setShowDetailsModal(false);
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Hoàn thành
                    </button>
                  </>
                )}

                {selectedBooking.status === "COMPLETED" && (
                  <button
                    className="flex-1 bg-orange-100 text-orange-600 hover:bg-orange-200 py-2 rounded-lg flex items-center justify-center"
                    onClick={() => {
                      selectBooking(selectedBooking);
                      setShowDetailsModal(false);
                      setShowWorkoutResultModal(true);
                    }}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    {selectedBooking.workoutResult
                      ? "Sửa kết quả"
                      : "Ghi kết quả"}
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

      {/* Modal thêm/sửa bài tập */}
      {showExerciseModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedBooking.exercises
                  ? "Chỉnh sửa bài tập"
                  : "Thêm bài tập"}
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowExerciseModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={
                        selectedBooking.customer.avatar ||
                        "https://randomuser.me/api/portraits/men/32.jpg"
                      }
                      alt={selectedBooking.customer.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedBooking.customer.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {moment(selectedBooking.date).format("DD/MM/YYYY")},{" "}
                        {selectedBooking.timeStart} - {selectedBooking.timeEnd}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedBooking.location}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Nội dung bài tập chi tiết
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 min-h-[250px] focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Ví dụ:
1. Khởi động (10 phút)
   - Chạy bộ nhẹ: 5 phút
   - Giãn cơ động: 5 phút

2. Bài tập chính (40 phút)
   - Squat: 3 sets x 12 reps
   - Push-up: 3 sets x 10 reps
   - Plank: 3 sets x 30 giây

3. Thư giãn (10 phút)
   - Giãn cơ tĩnh
   - Thở sâu"
                  value={exercises}
                  onChange={(e) => setExercises(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Mô tả chi tiết các bài tập, số lượng sets, reps và thời gian
                  nghỉ
                </p>
              </div>

              <div className="mb-6">
                <div className="block text-sm font-medium text-gray-700 mb-3">
                  <p className="text-sm text-gray-600 mb-3">
                    Bạn có chắc chắn muốn{" "}
                    {confirmationAction.type === "CONFIRMED" && "xác nhận"}
                    {confirmationAction.type === "COMPLETED" &&
                      "đánh dấu hoàn thành"}
                    {confirmationAction.type === "CANCELLED" && "hủy"} buổi tập
                    với:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="font-medium text-gray-900">
                      {confirmationAction.data.customer.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {moment(confirmationAction.data.date).format(
                        "DD/MM/YYYY"
                      )}
                      , {confirmationAction.data.timeStart} -{" "}
                      {confirmationAction.data.timeEnd}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={() => setShowExerciseModal(false)}
                  disabled={isSaving}
                >
                  Hủy
                </button>
                <button
                  className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  onClick={handleSaveExercises}
                  disabled={isSaving || !exercises.trim()}
                >
                  {isSaving ? "Đang lưu..." : "Lưu bài tập"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal ghi kết quả buổi tập */}
      {showWorkoutResultModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden max-h-[90vh]">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedBooking.workoutResult
                  ? "Cập nhật kết quả buổi tập"
                  : "Ghi kết quả buổi tập"}
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowWorkoutResultModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <WorkoutResultForm
              booking={selectedBooking}
              onClose={() => setShowWorkoutResultModal(false)}
              onSave={handleSaveWorkoutResult}
            />
          </div>
        </div>
      )}

      {/* Modal xác nhận hành động */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                Xác nhận hành động
              </h3>
            </div>

            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>

              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  {confirmationAction.type === "CONFIRMED" &&
                    "Bạn có chắc chắn muốn xác nhận buổi tập này?"}
                  {confirmationAction.type === "CANCELLED" &&
                    "Bạn có chắc chắn muốn hủy buổi tập này?"}
                  {confirmationAction.type === "COMPLETED" &&
                    "Bạn có chắc chắn đã hoàn thành buổi tập này?"}
                </p>
                <p className="text-sm text-gray-500">
                  Hành động này không thể hoàn tác.
                </p>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  onClick={() => setShowConfirmationModal(false)}
                >
                  Hủy
                </button>
                <button
                  className={`px-4 py-2 text-white rounded-lg transition-colors ${
                    confirmationAction.type === "CANCELLED"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  onClick={() => {
                    handleChangeStatus(
                      confirmationAction.data.bookingId,
                      confirmationAction.type
                    );
                    setShowConfirmationModal(false);
                  }}
                >
                  {confirmationAction.type === "CONFIRMED" && "Xác nhận"}
                  {confirmationAction.type === "CANCELLED" && "Hủy buổi tập"}
                  {confirmationAction.type === "COMPLETED" && "Hoàn thành"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
