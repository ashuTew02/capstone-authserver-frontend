import { BrowserRouter } from "react-router-dom";
import { ConfigProvider } from "antd";
import AppRouter from "./router/AppRouter";

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#35198e", // Purple theme
          borderRadius: 6,
          fontSize: 14,
          // You can override more tokens as needed
        },
      }}
    >
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
