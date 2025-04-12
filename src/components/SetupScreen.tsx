import React, { useState } from 'react';
declare global {
    interface Window {
      require: (module: 'electron') => typeof import('electron');
    }
}


interface Participant {
  name: string;
  slots: number;
}

interface SetupScreenProps {
  onSetupComplete: (tournamentName: string, participants: Participant[]) => void;
}

function SetupScreen({ onSetupComplete }: SetupScreenProps) {
  const [tournamentName, setTournamentName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleImportClick = async () => {
    setError(null);
    console.log('Requesting CSV file open dialog...');
    try {
      if (!window.require) {
          throw new Error("Node integration not enabled or require not available.");
      }
      const { ipcRenderer } = window.require('electron');

      const result = await ipcRenderer.invoke('open-csv-dialog');

      if (result.success && result.data) {
        console.log('Received raw data from main:', result.data);
        const participants: Participant[] = [];
        let validationError: string | null = null;

        if (!Array.isArray(result.data)) {
            throw new Error("Invalid data format received from main process.");
        }

        for (let i = 0; i < result.data.length; i++) {
            const row = result.data[i];
            if (!Array.isArray(row)) {
                validationError = `Row ${i + 1}: Invalid row format.`;
                break;
            }
            if (row.length !== 2) {
                validationError = `Row ${i + 1}: Expected 2 columns (Name, Slots), found ${row.length}.`;
                break;
            }
            const name = String(row[0]).trim();
            const slotsStr = String(row[1]).trim();
            const slots = parseInt(slotsStr, 10);

            if (!name) {
                validationError = `Row ${i + 1}: Participant name cannot be empty.`;
                break;
            }
            if (isNaN(slots) || slots <= 0) {
                validationError = `Row ${i + 1}: Slots must be a positive number (found '${slotsStr}').`;
                break;
            }
            participants.push({ name, slots });
        }

        if (validationError) {
            setError(`CSV Validation Error: ${validationError}`);
        } else if (participants.length === 0) {
            setError("CSV file imported, but no valid participant data found.");
        } else {
            console.log('Parsed participants:', participants);
            if (!tournamentName.trim()) {
                setError("Please enter a tournament name.");
                return;
            }
            onSetupComplete(tournamentName, participants);
        }
      } else {
        if (result.error !== 'File selection canceled.') {
            setError(result.error || 'Failed to import CSV file.');
        }
        console.error('IPC Error or cancellation:', result.error);
      }
    } catch (err) {
      console.error('Error invoking IPC:', err);
      setError(`An error occurred: ${err.message}`);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">Tournament Setup</h2>
      <div className="mb-4">
        <label htmlFor="tournamentName" className="block text-sm font-medium text-gray-700 mb-1">
          Tournament Name:
        </label>
        <input
          type="text"
          id="tournamentName"
          value={tournamentName}
          onChange={(e) => setTournamentName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter tournament name"
        />
      </div>
      <div className="mb-4">
        <button
          onClick={handleImportClick}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Import Participants (CSV)
        </button>
        {error && <p className="text-red-500 text-xs italic mt-2">{error}</p>}
        <p className="text-xs text-gray-500 mt-1">CSV format: [Participant Name],[Slots]</p>
      </div>
    </div>
  );
}

export default SetupScreen;
