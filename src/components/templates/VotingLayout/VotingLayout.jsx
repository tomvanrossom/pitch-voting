import React from 'react';
import { useTranslation } from 'react-i18next';
import { useVoting } from '../../../context/votingContext';
import './VotingLayout.scss';

export function VotingLayout({ children, stageInfo }) {
  const { state, dispatch } = useVoting();
  const { t, i18n } = useTranslation();

  const handleReset = (e) => {
    e.preventDefault();
    if (window.confirm(t('common.resetConfirm'))) {
      dispatch({ type: 'RESET' });
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'nl' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <div className="voting-layout">
      <main id="main-content" role="main" className="voting-layout__main">
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {stageInfo}
        </div>
        {children}
      </main>

      <footer className="voting-layout__footer">
        <p>
          &copy; {new Date().getFullYear()} {t('app.title')}
          {' | '}
          <a href="#" onClick={handleReset} style={{ color: 'inherit' }}>{t('footer.resetSession')}</a>
          {' | '}
          <button
            onClick={toggleLanguage}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              textDecoration: 'underline',
              font: 'inherit'
            }}
          >
            {i18n.language === 'en' ? 'NL' : 'EN'}
          </button>
        </p>
      </footer>
    </div>
  );
}
