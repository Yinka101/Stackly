import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import DesignSystem from './pages/DesignSystem';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/design" element={<DesignSystem />} />
    </Routes>
  );
}
