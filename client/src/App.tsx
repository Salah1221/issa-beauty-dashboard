import ErrorPage from "./ErrorPage";
import Navbar from "./Navbar";
import ProductCreate from "./ProductCreate";
import ProductDashboard from "./ProductDashboard";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";

const Layout: React.FC = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
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
]);

const App = () => {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};

export default App;
