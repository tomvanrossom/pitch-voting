import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ConfigForm } from "../../components/organisms/ConfigForm";
import { loadConfig, saveConfig } from "../../context/votingContext";
import "./Configure.scss";

export function Configure() {
  const navigate = useNavigate();
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
    navigate("/setup");
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
