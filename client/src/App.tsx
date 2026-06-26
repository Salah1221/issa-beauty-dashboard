import { Toaster } from "@/components/ui/sonner";
import ErrorPage from "./ErrorPage";
import Navbar from "./Navbar";
import ProductCreate from "./ProductCreate";
import ProductDashboard from "./ProductDashboard";
import Login from "./Login";
import RequireAuth from "./RequireAuth";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";

const Layout: React.FC = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <Toaster />
    </>
  );
};

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/",
    element: <RequireAuth />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            index: true,
            element: <ProductDashboard />,
          },
          {
            path: "create",
            element: <ProductCreate />,
          },
        ],
      },
    ],
  },
]);

const App = () => {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};

export default App;
