import './index.css';
import './App.css';
import { QuizProvider, useQuiz } from './context/QuizContext';
import { WelcomeScreen } from './components/WelcomeScreen';
import { QuizScreen } from './components/QuizScreen';
import { ResultsScreen } from './components/ResultsScreen';

function AppShell() {
  const { step } = useQuiz();

  return (
    <>
      {/* Ambient background */}
      <div className="app-bg" aria-hidden="true" />

      {/* Topnav */}
      <nav className="app-nav" aria-label="Site header">
        <div className="app-nav__logo" aria-label="CarbonClarity home">
          <span className="app-nav__logo-icon" aria-hidden="true">
            🌿
          </span>
          <span className="app-nav__logo-text">CarbonClarity</span>
        </div>
      </nav>

      {/* Page content */}
      <main className="app-main">
        {step === 'welcome' && <WelcomeScreen />}
        {step === 'quiz' && <QuizScreen />}
        {step === 'results' && <ResultsScreen />}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>
          Emission factors from DEFRA 2023, EPA &amp; peer-reviewed research. All data stays on your
          device.
        </p>
      </footer>
    </>
  );
}

export default function App() {
  return (
    <QuizProvider>
      <AppShell />
    </QuizProvider>
  );
}
