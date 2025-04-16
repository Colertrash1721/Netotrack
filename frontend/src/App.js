import "./App.css";
import { LoginSession } from "./components/LoginSession";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ResetPassword } from "./components/resetPassword";
import { Main } from "./components/main";
import { AddDevice } from "./components/adddevice";
import "boxicons/css/boxicons.min.css";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginSession />} />
          <Route path="*" element={<LoginSession />} />
          <Route path="/dashboardmain" element={<Main />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/addDevice" element={<AddDevice />} />
          <Route path="/dashboardmain/:name" element={<Main />} />
          <Route path="/dashboardmain/:name/:id" element={<Main />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
