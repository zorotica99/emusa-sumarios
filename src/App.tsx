import AppLayout from "./layouts/AppLayout";
import { useAuth } from "./hooks/useAuth";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const { session } = useAuth();

  if (!session) {
    return <AppRoutes />;
  }

  return (
    <AppLayout>
      <AppRoutes />
    </AppLayout>
  );
}

export default App;