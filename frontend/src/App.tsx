import React, { act } from 'react'
import { EducationPage } from './pages/EducationPage';
import { AboutPage } from './pages/AboutPage';
import { TestPredictionPage } from './pages/TestPredictionPage';
import { MapPage } from './pages/Map'
import { Navbar } from './components/Navbar';
import DataVisualization from './pages/DataVisualization'



export default function App() {
  const [darkMode, setDarkMode] = React.useState(false);
  const [activePage, setActivePage] = React.useState('Home');
  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Apply dark mode class to document
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Navbar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Main Content */}
      <main>
        {activePage === 'Test' && <TestPredictionPage />}
        {activePage === 'Education' && <EducationPage />}
        {activePage === 'About' && <AboutPage />}
        {activePage === 'Map' && < MapPage />}
        {activePage === 'Data' && < DataVisualization />}

      </main>

      {}

    </div>
  );
}
