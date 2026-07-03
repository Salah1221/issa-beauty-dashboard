import axios from "axios";

// Talk to the standalone backend in production (api.issabeauty.org); undefined
// in dev so requests stay relative and hit the Vite proxy.
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

// Send the session cookie with every request (cross-origin, same-site).
axios.defaults.withCredentials = true;

let installed = false;

export function installAuthInterceptor() {
  if (installed) return;
  installed = true;
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;
      const url: string = error?.config?.url ?? "";
      const onLogin = window.location.pathname.startsWith("/login");
      // Auth endpoints report their own 401s to their callers; data-route
      // 401s mean the session expired, so bounce to the login page.
      if (status === 401 && !url.startsWith("/api/admin/auth/") && !onLogin) {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );
}

export const login = (password: string) =>
  axios.post("/api/admin/auth/login", { password });

export const logout = () => axios.post("/api/admin/auth/logout");

export const checkAuth = () => axios.get("/api/admin/auth/check");

export const changePassword = (currentPassword: string, newPassword: string) =>
  axios.put("/api/admin/auth/password", { currentPassword, newPassword });
