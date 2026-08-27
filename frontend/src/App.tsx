import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import WorksiteSelection from './pages/WorksiteSelection';
import Dashboard from './pages/Dashboard';
import ScenarioEditor from './pages/ScenarioEditor';
import ChangesApplied from './pages/ChangesApplied';
import AddWorksite from './pages/AddWorksite';
import AddTask from './pages/AddTask';
import EditTask from './pages/EditTask';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<WorksiteSelection />} />
          <Route path="/dashboard/:worksiteId" element={<Dashboard />} />
          <Route path="/scenario/:worksiteId" element={<ScenarioEditor />} />
          <Route path="/changes-applied/:worksiteId" element={<ChangesApplied />} />
          <Route path="/add-worksite" element={<AddWorksite />} />
          <Route path="/add-task/:worksiteId" element={<AddTask />} />
          <Route path="/edit-task/:worksiteId/:taskId" element={<EditTask />} />
        </Routes>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'white',
              color: '#1e293b',
              padding: '12px',
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ecfdf5',
              },
              style: {
                background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                border: '1px solid #10b981',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fef2f2',
              },
              style: {
                background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                border: '1px solid #ef4444',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
