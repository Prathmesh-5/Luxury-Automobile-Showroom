import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";

function App() {
    return (
        <>
            <AppRoutes />
            <Toaster 
                position="top-right" 
                toastOptions={{
                    style: {
                        background: "#121212",
                        color: "#fff",
                        border: "1px solid #d4af37"
                    }
                }}
            />
        </>
    );
}

export default App;