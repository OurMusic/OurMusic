import AppRoutes from "./routes/AppRoutes";
import { PlayerProvider } from "./context/PlayerProvider";
import BarraDeReproducao from "./components/barraReproducao/BarraDeReproducao";
import "./App.css";

function App() {
    return (
        <PlayerProvider>
            <AppRoutes />
            <BarraDeReproducao />
        </PlayerProvider>
    );
}

export default App;
