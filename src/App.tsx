import { CheckCircle2 } from 'lucide-react';

export function App() {
  return (
    <main className="app-shell" aria-label="Polaris Office UI workbench">
      <header className="top-bar">
        <div>
          <p className="eyebrow">Polaris Office</p>
          <h1>UI Workbench</h1>
        </div>
        <div className="status-pill" aria-label="GitHub Pages deployment ready">
          <CheckCircle2 aria-hidden="true" size={16} strokeWidth={2} />
          Pages ready
        </div>
      </header>

      <section className="canvas-stage" aria-label="Empty design canvas">
        <div className="document-canvas">
          <div className="canvas-ruler" aria-hidden="true" />
          <div className="empty-state">
            <p className="empty-kicker">Blank view</p>
            <h2>기획안이 들어오면 이 화면에서 Polaris UI로 확장합니다.</h2>
            <p>
              현재 화면은 GitHub Pages 배포 확인을 위한 기본 웹 뷰입니다.
              색상, 간격, 타이포그래피는 PolarisDesign 토큰을 기준으로 구성했습니다.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
