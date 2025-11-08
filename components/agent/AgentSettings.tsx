import React, { useState } from 'react';
import { PanelCard, ConfirmationModal } from '../ui';
import { updateAgentConfig } from '../../services/supabaseService';
import type { AgentConfig } from '../../types';
import { BrainCircuit, Eye, EyeOff, Trash2, Edit, Save, Plus, X } from 'lucide-react';

const ModelManagerCard: React.FC<{
    currentModel: string;
    onSave: (modelName: string) => Promise<void>;
}> = ({ currentModel, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [modelName, setModelName] = useState(currentModel);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!modelName.trim()) {
            alert("Model name cannot be empty.");
            return;
        }
        if (modelName === currentModel) {
            setIsEditing(false);
            return;
        }
        setIsSaving(true);
        await onSave(modelName);
        setIsSaving(false);
        setIsEditing(false);
    };
    
    const handleCancel = () => {
        setModelName(currentModel);
        setIsEditing(false);
    }
    
    return (
        <PanelCard>
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                    <BrainCircuit size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-slate-800">Model Configuration</h3>
                    <p className="text-sm text-slate-500 mt-1">Select the primary model used by the agents.</p>
                </div>
            </div>

            <div className="mt-6">
                {isEditing ? (
                    <div className="flex flex-col gap-3">
                        <label htmlFor="model-name-input" className="text-sm font-medium text-slate-600">Enter new model name:</label>
                        <input 
                            id="model-name-input"
                            value={modelName}
                            onChange={(e) => setModelName(e.target.value)}
                            type="text"
                            placeholder="e.g., gemini-2.5-pro"
                            className="form-input w-full"
                            autoFocus
                        />
                        <div className="flex justify-end items-center gap-2 pt-2">
                            <button onClick={handleCancel} className="btn btn-secondary">Cancel</button>
                            <button onClick={handleSave} className="btn btn-primary" disabled={isSaving}>
                                <Save size={16}/> {isSaving ? 'Saving...' : 'Save Model'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/80 flex items-center justify-between">
                        <div>
                            <span className="text-xs text-slate-500 uppercase font-semibold">Active Model</span>
                            <p className="font-mono text-base text-slate-800 font-semibold mt-1">{currentModel || 'Not Set'}</p>
                        </div>
                        <button onClick={() => setIsEditing(true)} className="btn btn-secondary">
                            <Edit size={16}/> Edit
                        </button>
                    </div>
                )}
            </div>
        </PanelCard>
    );
};

const ApiKeyManager: React.FC<{
    keys: string[];
    onAddKey: (key: string) => Promise<void>;
    onRemoveKey: (key: string) => void;
}> = ({ keys, onAddKey, onRemoveKey }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newApiKey, setNewApiKey] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleAdd = async () => {
        if (!newApiKey.trim()) return;
        setIsSaving(true);
        await onAddKey(newApiKey);
        setNewApiKey('');
        setIsSaving(false);
        setIsAdding(false);
    };

    const ApiKeyRow: React.FC<{ apiKey: string; onRemove: () => void }> = ({ apiKey, onRemove }) => {
        const [isVisible, setIsVisible] = useState(false);
        const maskedKey = `${apiKey.slice(0, 4)}••••••••${apiKey.slice(-4)}`;
        const displayKey = isVisible ? apiKey : maskedKey;

        return (
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full shrink-0" data-tooltip="Active"></div>
                <div className="flex-grow min-w-0" data-tooltip={isVisible ? apiKey : ''}>
                    <span className="font-mono text-sm text-slate-700 truncate block">{displayKey}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <button 
                        onClick={() => setIsVisible(!isVisible)} 
                        className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                        data-tooltip={isVisible ? "Hide" : "Show"}
                    >
                        {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button 
                        onClick={onRemove} 
                        className="p-2 rounded-full text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors"
                        data-tooltip="Remove"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <PanelCard>
            <div className="flex items-start gap-4">
                 <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.5 8.5 12 12l3.5 3.5"/><path d="M8.5 8.5 12 12l-3.5 3.5"/><path d="M12 2v20"/><path d="m19 5-7 7-7-7"/></svg>
                </div>
                <div>
                    <h3 className="font-bold text-lg text-slate-800">Agent API Keys</h3>
                    <p className="text-sm text-slate-500 mt-1">These keys are used for agent operations. The system will cycle through them.</p>
                </div>
            </div>
            
            <div className="mt-6 space-y-3">
                {keys.length > 0 ? (
                    keys.map((key, i) => <ApiKeyRow key={i} apiKey={key} onRemove={() => onRemoveKey(key)} />)
                ) : (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                        <p className="font-medium text-slate-500">No API keys have been added yet.</p>
                        <p className="text-sm text-slate-400">Click below to add your first key.</p>
                    </div>
                )}
            </div>

            <div className="mt-6">
                {isAdding ? (
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/80 animate-fade-in-up">
                        <label htmlFor="add-key-input" className="font-semibold text-sm mb-2 text-slate-700 block">Add a new API key</label>
                        <div className="flex gap-3">
                            <input 
                                id="add-key-input"
                                value={newApiKey} 
                                onChange={e => setNewApiKey(e.target.value)} 
                                type="password" 
                                placeholder="Enter new Agent API Key..."
                                className="form-input flex-1" 
                            />
                        </div>
                         <div className="flex justify-end items-center gap-2 pt-3 mt-2 border-t border-slate-200">
                            <button onClick={() => { setIsAdding(false); setNewApiKey(''); }} className="btn btn-secondary">Cancel</button>
                            <button onClick={handleAdd} className="btn btn-primary" disabled={isSaving || !newApiKey.trim()}>
                                {isSaving ? 'Saving...' : 'Save Key'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <button onClick={() => setIsAdding(true)} className="btn btn-primary w-full">
                        <Plus size={16} /> Add API Key
                    </button>
                )}
            </div>
        </PanelCard>
    );
};


const AgentSettings: React.FC<{ config: AgentConfig, onUpdate: () => void }> = ({ config, onUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [keyToRemove, setKeyToRemove] = useState<string | null>(null);

    const handleUpdateModel = async (modelName: string) => {
        const { error } = await updateAgentConfig({ active_model_name: modelName });
        if (error) {
            alert('Update failed: ' + error.message);
        } else {
            onUpdate();
        }
    };

    const handleAddKey = async (key: string) => {
        if (config.api_keys.includes(key)) {
            alert('This key already exists.');
            return;
        }
        const updatedKeys = [...config.api_keys, key];
        const { error } = await updateAgentConfig({ api_keys: updatedKeys });
        if (error) {
            alert('Failed to add key: ' + error.message);
        } else {
            onUpdate();
        }
    };

    const promptRemoveKey = (key: string) => {
        setKeyToRemove(key);
        setIsModalOpen(true);
    };
    
    const handleConfirmRemove = async () => {
        if (!keyToRemove) return;
        const updatedKeys = config.api_keys.filter(k => k !== keyToRemove);
        const { error } = await updateAgentConfig({ api_keys: updatedKeys });
        if (error) {
            alert('Failed to remove key: ' + error.message);
        } else {
            onUpdate();
        }
        
        setIsModalOpen(false);
        setKeyToRemove(null);
    };

    return (
        <>
            <div className="max-w-4xl mx-auto space-y-8">
                <ModelManagerCard 
                    currentModel={config.active_model_name}
                    onSave={handleUpdateModel}
                />
                <ApiKeyManager
                    keys={config.api_keys}
                    onAddKey={handleAddKey}
                    onRemoveKey={promptRemoveKey}
                />
            </div>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmRemove}
                title="Confirm Key Deletion"
                message={<>Are you sure you want to remove this API key ending in <strong>...{keyToRemove?.slice(-4)}</strong>? This action cannot be undone.</>}
                confirmText="Remove Key"
                confirmButtonClass="btn-danger"
            />
        </>
    );
};

export default AgentSettings;