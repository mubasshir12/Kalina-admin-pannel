import React, { useState, useEffect, useCallback } from 'react';
import { PanelCard, ConfirmationModal } from '../ui';
import { getApiKeys, addApiKey, deleteApiKey, resetApiKeysStatus } from '../../services/aiChatService';
import { Sparkles, KeyRound, Eye, EyeOff, Trash2, PlusCircle, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

interface ApiKey {
    id: number;
    api_key: string;
    status: 'active' | 'exhausted';
    last_used_at: string | null;
    failure_count: number;
    created_at: string;
}

const ApiKeyManagerCard: React.FC = () => {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newApiKey, setNewApiKey] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [keyToDelete, setKeyToDelete] = useState<ApiKey | null>(null);
    const [isResetting, setIsResetting] = useState(false);

    const loadKeys = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getApiKeys();
            setKeys(data as ApiKey[]);
        } catch (error) {
            console.error("Failed to load API keys:", error);
            alert("Could not load API keys. Check the console for more details.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadKeys();
    }, [loadKeys]);

    const handleAddKey = async () => {
        if (!newApiKey.trim()) return;
        setIsSaving(true);
        try {
            await addApiKey(newApiKey);
            setNewApiKey('');
            setIsAdding(false);
            await loadKeys();
        } catch (error) {
            console.error("Failed to add API key:", error);
            alert("Failed to add API key.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteKey = async () => {
        if (!keyToDelete) return;
        try {
            await deleteApiKey(keyToDelete.id);
            setKeyToDelete(null);
            await loadKeys();
        } catch (error) {
            console.error("Failed to delete API key:", error);
            alert("Failed to delete API key.");
        }
    };

    const handleResetAllExhausted = async () => {
        setIsResetting(true);
        try {
            await resetApiKeysStatus();
            await loadKeys();
        } catch (error) {
            console.error("Failed to reset key statuses:", error);
            alert("Failed to reset key statuses.");
        } finally {
            setIsResetting(false);
        }
    };
    
    const exhaustedCount = keys.filter(k => k.status === 'exhausted').length;

    const ApiKeyRow: React.FC<{ apiKey: ApiKey }> = ({ apiKey }) => {
        const [isVisible, setIsVisible] = useState(false);
        const maskedKey = `••••••••${apiKey.api_key.slice(-4)}`;
        const displayKey = isVisible ? apiKey.api_key : maskedKey;

        return (
            <div className="flex items-center gap-3 bg-slate-50/50 dark:bg-zinc-800/50 p-3 rounded-lg border border-slate-200/80 dark:border-zinc-700/80">
                <div className="flex-shrink-0" data-tooltip={apiKey.status}>
                    {apiKey.status === 'active' 
                        ? <CheckCircle2 size={20} className="text-green-500" /> 
                        : <AlertTriangle size={20} className="text-yellow-500" />
                    }
                </div>
                <div className="flex-grow min-w-0" data-tooltip={isVisible ? apiKey.api_key : ''}>
                    <span className="font-mono text-sm text-slate-700 dark:text-zinc-300 truncate block">{displayKey}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                     <button 
                        onClick={() => setIsVisible(!isVisible)} 
                        className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800 dark:hover:bg-zinc-700 dark:hover:text-zinc-200 transition-colors"
                        data-tooltip={isVisible ? "Hide" : "Show"}
                    >
                        {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button 
                        onClick={() => setKeyToDelete(apiKey)} 
                        className="p-2 rounded-full text-red-500 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/50 dark:hover:text-red-400 transition-colors"
                        data-tooltip="Remove"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto">
            <PanelCard>
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-800">AI Assistant API Keys</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            Manage the pool of Gemini API keys for the chat assistant. The system uses them in a least-recently-used order and marks them as 'exhausted' on failure.
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button onClick={handleResetAllExhausted} className="btn btn-secondary text-sm" disabled={isResetting || exhaustedCount === 0}>
                        <RefreshCw size={14} className={isResetting ? 'animate-spin' : ''} />
                        {isResetting ? 'Resetting...' : `Reset ${exhaustedCount} Exhausted Keys`}
                    </button>
                </div>

                <div className="mt-4 space-y-3">
                    {isLoading ? (
                        <p className="text-center text-slate-500">Loading keys...</p>
                    ) : keys.length > 0 ? (
                        keys.map(key => <ApiKeyRow key={key.id} apiKey={key} />)
                    ) : (
                        <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-zinc-700 rounded-lg">
                            <KeyRound size={32} className="mx-auto text-slate-400" />
                            <p className="mt-2 font-medium text-slate-500">No API keys have been added yet.</p>
                            <p className="text-sm text-slate-400">Click below to add your first key for the AI Assistant.</p>
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    {isAdding ? (
                        <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-lg border border-slate-200/80 dark:border-zinc-700/80 animate-fade-in-up">
                            <label htmlFor="add-key-input" className="font-semibold text-sm mb-2 text-slate-700 dark:text-zinc-300 block">Add a new Gemini API key</label>
                            <div className="flex gap-3">
                                <input 
                                    id="add-key-input"
                                    value={newApiKey} 
                                    onChange={e => setNewApiKey(e.target.value)} 
                                    type="password" 
                                    placeholder="Enter new Gemini API Key..."
                                    className="form-input flex-1" 
                                />
                            </div>
                            <div className="flex justify-end items-center gap-2 pt-3 mt-2 border-t border-slate-200 dark:border-zinc-700">
                                <button onClick={() => { setIsAdding(false); setNewApiKey(''); }} className="btn btn-secondary">Cancel</button>
                                <button onClick={handleAddKey} className="btn btn-primary" disabled={isSaving || !newApiKey.trim()}>
                                    {isSaving ? 'Saving...' : 'Save Key'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => setIsAdding(true)} className="btn btn-primary w-full">
                            <PlusCircle size={16} /> Add API Key
                        </button>
                    )}
                </div>
            </PanelCard>

            <ConfirmationModal
                isOpen={keyToDelete !== null}
                onClose={() => setKeyToDelete(null)}
                onConfirm={handleDeleteKey}
                title="Confirm Key Deletion"
                message={<>Are you sure you want to remove this API key ending in <strong>...{keyToDelete?.api_key.slice(-4)}</strong>? This action cannot be undone.</>}
                confirmText="Remove Key"
                confirmButtonClass="btn-danger"
            />
        </div>
    );
};

export default ApiKeyManagerCard;