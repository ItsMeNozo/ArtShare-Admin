import { RouterProvider } from "react-router-dom";
import { router } from "./router"; // Assuming your router configuration is here
import { AuthProvider } from "./context/AuthContext"; // Adjust path as needed
import { CustomThemeProvider } from "./context/ThemeContext";

export default function App() {
  return (
    <CustomThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </CustomThemeProvider>
  );
}
