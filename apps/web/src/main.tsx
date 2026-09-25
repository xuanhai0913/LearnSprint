import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';

const App = lazy(() => import('./App'));
const MissionPreview = lazy(() => import('./mission/MissionPreview'));
const PowerLab = lazy(() => import('./powerlab/PowerLab'));
const Career = lazy(() => import('./career/Career'));
const preview = window.location.pathname.replace(/\/$/, '') === '/mission-preview';
const powerlab = window.location.pathname.replace(/\/$/, '') === '/powerlab';
const career = window.location.pathname.replace(/\/$/, '') === '/career';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<p role="status" style={{ padding: 32, fontFamily: 'Georgia, serif' }}>Opening LearnSprint…</p>}>
      {career ? <Career /> : powerlab ? <PowerLab /> : preview ? <MissionPreview /> : <App />}
    </Suspense>
  </StrictMode>,
);
