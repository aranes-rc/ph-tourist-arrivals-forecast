import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NavigationBar } from "./Components/NavigationBar"
import { Home } from './Pages/Home/Home';
import { MdLightMode } from "react-icons/md";
import { BsFillMoonStarsFill } from "react-icons/bs";
import { motion } from "framer-motion";
import { Footer } from './Components/Footer';
import { ErrorPage } from './Pages/ErrorPage';
import { useDarkThemeMode } from "./store/useDarkThemeMode";

function App() {
  const { isDark, toggleTheme } = useDarkThemeMode();

  return (
    <div className='flex flex-col min-h-screen'>
      <Router>
        <NavigationBar />
        <main className="flex-grow h-full">
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='*' element={<ErrorPage />} />
          </Routes>
        </main>
        <Footer />

        <motion.div
            initial={false}
            animate={{ rotate: isDark ? 360 : 0 }}
            transition={{ duration: 0.5 }}
            onClick={toggleTheme}
            className={`fixed bottom-5 right-5 z-50 cursor-pointer p-4 rounded-full shadow-lg 
              ${isDark ? 'bg-gray-800' : 'bg-yellow-200'}`}
      >
            {isDark ? (
                <BsFillMoonStarsFill className="text-2xl text-amber-300" />
            ) : (
                <MdLightMode className="text-2xl text-yellow-500" />
            )}
        </motion.div>
      </Router>
    </div>
  );
}

export default App;
