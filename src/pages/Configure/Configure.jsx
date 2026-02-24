import React, { useState, useEffect } from "react";
import { useVoting } from "../../context/votingContext";
import { ConfigForm } from "../../components/organisms/ConfigForm";
import { loadConfig, saveConfig } from "../../context/votingContext";
import "./Configure.scss";

export function Configure() {
  const { dispatch } = useVoting();
  const [config, setConfig] = useState(() => loadConfig());

  useEffect(() => {
    saveConfig(config);
  }, [config]);

  const handleUpdateVoters = (voters) => {
    setConfig((prev) => ({ ...prev, voters }));
  };

  const handleUpdateCandidates = (candidates) => {
    setConfig((prev) => ({ ...prev, candidates }));
  };

  const handleContinue = () => {
    dispatch({ type: "GOTO_SETUP" });
  };

  return (
    <div className="configure-page">
      <div className="configure-page__container">
        <ConfigForm
          voters={config.voters}
          candidates={config.candidates}
          onUpdateVoters={handleUpdateVoters}
          onUpdateCandidates={handleUpdateCandidates}
          onContinue={handleContinue}
        />
      </div>
    </div>
  );
}
