import { useState, useEffect, useContext } from "react";
import {
  CheckCircle,
  ArrowRight,
  Clock,
  CalendarClock,
  DollarSign,
} from "lucide-react";
import axios from "axios";
import QRPaymentPage from "./paymentqrcode";
import { AuthContext } from "../../contexts/AuthProvider";
// Import Material UI components
import {
  Alert,
  AlertTitle,
  Snackbar,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";

export default function MembershipRegistration() {
  const { isLoggedIn, setIsLoggedIn, setUser, isLoading, user } =
    useContext(AuthContext);
  const [membershipPlans, setMembershipPlans] = useState([]); // Dữ liệu từ API
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [loading, setLoading] = useState(true); // Trạng thái tải dữ liệu
  const [error, setError] = useState(null); // Trạng thái lỗi

  // Add state for Material UI alerts and dialogs
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [loginDialog, setLoginDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Hàm gọi API để lấy dữ liệu membership
  useEffect(() => {
    const fetchMembershipPlans = async () => {
      try {
        const response = await fetch("http://localhost:3000/memberships"); // Thay URL bằng API của bạn
        if (!response.ok) {
          throw new Error("Failed to fetch membership plans");
        }

        const data = await response.json();
        setMembershipPlans(data); // Gán dữ liệu từ API vào state
      } catch (err) {
        setError(err.message);
        setSnackbar({
          open: true,
          message: `Lỗi: ${err.message}`,
          severity: "error",
        });
      } finally {
        setLoading(false); // Kết thúc trạng thái tải
      }
    };

    fetchMembershipPlans();
  }, []);

  // Hàm xử lý gửi form đăng ký
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setLoginDialog(true);
      return;
    }

    if (!selectedPlan) {
      setSnackbar({
        open: true,
        message: "Vui lòng chọn một gói tập!",
        severity: "warning",
      });
      return;
    }

    setConfirmDialog(true);
  };

  const confirmRegistration = async () => {
    setConfirmDialog(false);
    setLoading(true);

    try {
      // Tính ngày bắt đầu và kết thúc
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + selectedPlan.duration);

      // Tạo dữ liệu cho bảng orders
      const orderData = {
        userId: user.data.id,
        membershipId: selectedPlan.id,
        paymentId: 1,
        status: paymentMethod === "cash" ? "PENDING" : "COMPLETED",
      };
      console.log(orderData);

      // Gửi yêu cầu POST tới endpoint /orders
      const orderResponse = await axios.post(
        "http://localhost:3000/orders",
        orderData
      );

      if (orderResponse.status === 201) {
        // Cập nhật thông tin user để phản ánh gói tập mới
        const userResponse = user;
        setUser(userResponse.data); // Cập nhật state user

        setSnackbar({
          open: true,
          message: `Đăng ký thành công gói: ${selectedPlan.name}`,
          severity: "success",
        });
      } else {
        throw new Error("Lỗi khi lưu đơn hàng");
      }
    } catch (err) {
      console.error("Lỗi khi đăng ký:", err);
      setSnackbar({
        open: true,
        message: "Đăng ký thất bại. Vui lòng thử lại!",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress color="primary" />
        <span className="ml-3">Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-10 max-w-2xl mx-auto">
        <Alert severity="error">
          <AlertTitle>Lỗi</AlertTitle>
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-50 to-orange-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-gray-900 bg-gradient-to-r from-orange-500 to-slate-500 bg-clip-text text-transparent">
            Đăng Ký Gói Thành Viên
          </h1>
          <p className="mt-2 text-gray-600">
            Chọn gói phù hợp với nhu cầu tập luyện của bạn
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {membershipPlans.map((plan) => (
            <div
              key={plan.id}
              className={`
                border rounded-lg p-6 transition-all cursor-pointer bg-white shadow-sm
                ${
                  selectedPlan?.id === plan.id
                    ? "border-orange-500 bg-orange-50 shadow-md"
                    : "border-gray-200 hover:border-orange-300 hover:shadow"
                }
              `}
              onClick={() => setSelectedPlan(plan)}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900">
                  {plan.name}
                </h3>
                {selectedPlan?.id === plan.id && (
                  <CheckCircle className="text-blue-500 h-5 w-5" />
                )}
              </div>

              <div className="mt-4 flex items-baseline">
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(plan.price)}
                </span>
                <span className="ml-1 text-gray-500 text-sm">/ tháng</span>
              </div>

              <p className="mt-2 text-sm text-gray-500">{plan.description}</p>

              <div className="mt-4 space-y-2">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <p className="ml-2 text-sm text-gray-500">{feature}</p>
                  </div>
                ))}
              </div>

              <button
                className={`mt-6 w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium
                  ${
                    selectedPlan?.id === plan.id
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50"
                  }`}
                onClick={() => setSelectedPlan(plan)}
              >
                {selectedPlan?.id === plan.id ? "Đã Chọn" : "Chọn Gói Này"}
              </button>
            </div>
          ))}
        </div>

        {selectedPlan && (
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-md rounded-lg p-6 border border-gray-200"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Thông tin đăng ký
            </h2>

            <div className="bg-gray-50 rounded-md p-4 mb-6">
              <h3 className="text-md font-medium text-gray-900 mb-3">
                Chi tiết gói đã chọn
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <CalendarClock className="h-5 w-5 text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Thời hạn</p>
                    <p className="font-medium">{selectedPlan.duration} ngày</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Ngày bắt đầu</p>
                    <p className="font-medium">Hôm nay</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Giá gói</p>
                    <p className="font-medium">
                      {formatCurrency(selectedPlan.price)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Chọn phương thức thanh toán
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div
                  className={`
                border rounded-md p-4 flex flex-col items-center cursor-pointer
                ${
                  paymentMethod === "credit"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }
              `}
                  onClick={() => setPaymentMethod("credit")}
                >
                  <div className="h-8 w-8 flex items-center justify-center rounded-full bg-blue-100 mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path
                        fillRule="evenodd"
                        d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Thẻ tín dụng</span>
                </div>

                <div
                  className={`
                border rounded-md p-4 flex flex-col items-center cursor-pointer
                ${
                  paymentMethod === "banking"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }
              `}
                  onClick={() => setPaymentMethod("banking")}
                >
                  <div className="h-8 w-8 flex items-center justify-center rounded-full bg-blue-100 mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      <path d="M8 13h4a1 1 0 100-2H8a1 1 0 000 2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Internet Banking</span>
                </div>

                <div
                  className={`
                border rounded-md p-4 flex flex-col items-center cursor-pointer
                ${
                  paymentMethod === "cash"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }
              `}
                  onClick={() => setPaymentMethod("cash")}
                >
                  <div className="h-8 w-8 flex items-center justify-center rounded-full bg-blue-100 mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95a1 1 0 001.715 1.029zM7 12a2 2 0 114 0 2 2 0 01-4 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Tiền mặt</span>
                </div>
              </div>
            </div>

            {paymentMethod === "credit" && (
              <QRPaymentPage price={selectedPlan.price} />
            )}

            {paymentMethod === "banking" && (
              <Alert severity="info" variant="outlined" className="mb-6">
                <AlertTitle>Thông báo</AlertTitle>
                Bạn sẽ được chuyển hướng đến trang thanh toán của ngân hàng sau
                khi xác nhận.
              </Alert>
            )}

            {paymentMethod === "cash" && (
              <Alert severity="warning" variant="outlined" className="mb-6">
                <AlertTitle>Lưu ý</AlertTitle>
                Vui lòng thanh toán tại quầy lễ tân trong vòng 24 giờ để hoàn
                tất đăng ký.
              </Alert>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-500">Tổng thanh toán</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(selectedPlan.price)}
                </p>
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium flex items-center hover:bg-blue-700"
              >
                Xác nhận đăng ký
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Material UI Dialogs and Snackbars */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Login Dialog */}
      <Dialog open={loginDialog} onClose={() => setLoginDialog(false)}>
        <DialogTitle>Yêu cầu đăng nhập</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn cần đăng nhập để đăng ký gói tập. Vui lòng đăng nhập hoặc đăng
            ký tài khoản mới.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoginDialog(false)} color="primary">
            Đóng
          </Button>
          <Button
            onClick={() => {
              setLoginDialog(false);
              // Add navigation to login page if needed
              // window.location.href = '/login';
            }}
            color="primary"
            variant="contained"
          >
            Đăng nhập
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Xác nhận đăng ký</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn đăng ký gói {selectedPlan?.name} với giá{" "}
            {selectedPlan ? formatCurrency(selectedPlan.price) : ""} không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)} color="error">
            Hủy
          </Button>
          <Button
            onClick={confirmRegistration}
            color="primary"
            variant="contained"
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
