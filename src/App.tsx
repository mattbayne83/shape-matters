import { SectionNav } from './components/layout/SectionNav';
import { ParallaxBackground } from './components/layout/ParallaxBackground';
import { ScrollPage } from './pages/ScrollPage';
// Side-effect import: hydrateFromUrl() runs at module load, before first render
import './store/useCompanyStore';

export default function App() {
  return (
    <div className="min-h-screen bg-white text-stone-900 font-sans selection:bg-stone-900 selection:text-white relative">
      <ParallaxBackground />
      <div className="relative z-10">
        <SectionNav />
        <main>
          <ScrollPage />
        </main>
      </div>
    </div>
  );
}
