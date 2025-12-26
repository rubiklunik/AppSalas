
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import ListView from './screens/ListView';
import DetailView from './screens/DetailView';
import LandingPage from './screens/LandingPage';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/promociones" element={<ListView />} />
        <Route path="/details/:projectId" element={<DetailView />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
