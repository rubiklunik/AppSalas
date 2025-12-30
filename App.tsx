
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import ListView from './screens/ListView';
import DetailView from './screens/DetailView';
import LandingPage from './screens/LandingPage';
import Statistics from './screens/Statistics';
import IndustrializationDecision from './screens/IndustrializationDecision';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/promociones" element={<ListView />} />
        <Route path="/estadisticas" element={<Statistics />} />
        <Route path="/decisor-industrializacion" element={<IndustrializationDecision />} />
        <Route path="/details/:projectId" element={<DetailView />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
