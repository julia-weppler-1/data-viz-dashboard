import "./App.css";
import { Routes, Route } from "react-router-dom";
import HouseholdSurvey from "pages/HouseholdSurvey";
import Navbar from "components/Navbar";
function App() {
    return (
        <div className="App">
            <header>
                <Navbar/>
            </header>
            <main className="container mx-auto px-4 mt-32">
                <Routes>
                    <Route exact path="/" element={<HouseholdSurvey/>} />
                </Routes>
            </main>
            <footer className="bg-[#003057] mt-10 py-4">
                <div className="container mx-auto text-center">
                </div>
            </footer>
        </div>
    );
}

export default App;
