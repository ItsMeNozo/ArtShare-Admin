import { RouterProvider } from "react-router-dom";
import { router } from "./router"; // Assuming your router configuration is here
import { AuthProvider } from "./context/AuthContext"; // Adjust path as needed

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
