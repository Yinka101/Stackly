import { Routes, Route, Navigate } from 'react-router-dom';
import DesignSystem from './pages/DesignSystem';

export default function App() {
  return (
    <Routes>
      <Route path="/design" element={<DesignSystem />} />
      {/* Redirect root to /design until more pages are built */}
      <Route path="*" element={<Navigate to="/design" replace />} />
    </Routes>
  );
}
