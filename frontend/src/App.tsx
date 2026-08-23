import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WorksiteSelection from './pages/WorksiteSelection';
import Dashboard from './pages/Dashboard';
import ScenarioEditor from './pages/ScenarioEditor';
import ChangesApplied from './pages/ChangesApplied';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<WorksiteSelection />} />
          <Route path="/dashboard/:worksiteId" element={<Dashboard />} />
          <Route path="/scenario/:worksiteId" element={<ScenarioEditor />} />
          <Route path="/changes-applied/:worksiteId" element={<ChangesApplied />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
