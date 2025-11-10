import React, { useState } from 'react';
import { PanelCard, ConfirmationModal } from '../ui';
import { updateNewsConfig } from '../../services/supabaseService';
import type { NewsConfig } from '../../types';
import { Newspaper, Sparkles, Eye, EyeOff, Trash2, Plus } from 'lucide-react';

const ApiKeyManager: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    keys: string[];
    onAddKey: (key: string) => Promise<void>;
    onRemoveKey: (key: string) => void;
    placeholder: string;
}> = ({ title, description, icon, keys, onAddKey, onRemoveKey, placeholder }) => {
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
                    {icon}
                </div>
                <div>
                    <h3 className="font-bold text-lg text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{description}</p>
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
                        <label htmlFor={`add-key-input-${title}`} className="font-semibold text-sm mb-2 text-slate-700 block">Add a new API key</label>
                        <div className="flex gap-3">
                            <input 
                                id={`add-key-input-${title}`}
                                value={newApiKey} 
                                onChange={e => setNewApiKey(e.target.value)} 
                                type="password" 
                                placeholder={placeholder}
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


const NewsSettings: React.FC<{ currentConfig: NewsConfig, onUpdate: () => void }> = ({ currentConfig, onUpdate }) => {
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        keyType: 'gnews' | 'gemini' | null;
        keyValue: string | null;
    }>({ isOpen: false, keyType: null, keyValue: null });

    const handleAddKey = async (type: 'gnews' | 'gemini', key: string) => {
        const keyArrayName = type === 'gnews' ? 'gnews_api_keys' : 'gemini_api_keys';
        const currentKeys = currentConfig[keyArrayName] || [];
        
        if (currentKeys.includes(key)) {
            alert('This key already exists.');
            return;
        }

        const updatedKeys = [...currentKeys, key];
        const { error } = await updateNewsConfig({ [keyArrayName]: updatedKeys });
        
        if (error) {
            alert('Failed to add key: ' + error.message);
        } else {
            onUpdate();
        }
    };

    const promptRemoveKey = (type: 'gnews' | 'gemini', keyToRemove: string) => {
        setModalState({ isOpen: true, keyType: type, keyValue: keyToRemove });
    };

    const handleConfirmRemove = async () => {
        const { keyType, keyValue } = modalState;
        if (!keyType || !keyValue) return;

        const keyArrayName = keyType === 'gnews' ? 'gnews_api_keys' : 'gemini_api_keys';
        const updatedKeys = (currentConfig[keyArrayName] || []).filter(k => k !== keyValue);

        const { error } = await updateNewsConfig({ [keyArrayName]: updatedKeys });
        if (error) {
            alert('Failed to remove key: ' + error.message);
        } else {
            onUpdate();
        }
        
        setModalState({ isOpen: false, keyType: null, keyValue: null });
    };

    return (
        <>
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:items-start">
                <ApiKeyManager
                    title="GNews API Keys"
                    description="Keys for fetching news articles from GNews. The system will cycle through them."
                    icon={<Newspaper size={24} />}
                    keys={currentConfig.gnews_api_keys}
                    onAddKey={(key) => handleAddKey('gnews', key)}
                    onRemoveKey={(key) => promptRemoveKey('gnews', key)}
                    placeholder="Enter new GNews API Key..."
                />
                 <ApiKeyManager
                    title="Gemini API Keys"
                    description="Keys for summarizing articles with Gemini. The system will cycle through them."
                    icon={<Sparkles size={24} />}
                    keys={currentConfig.gemini_api_keys}
                    onAddKey={(key) => handleAddKey('gemini', key)}
                    onRemoveKey={(key) => promptRemoveKey('gemini', key)}
                    placeholder="Enter new Gemini API Key..."
                />
            </div>
             <ConfirmationModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ isOpen: false, keyType: null, keyValue: null })}
                onConfirm={handleConfirmRemove}
                title="Confirm Key Deletion"
                message={<>Are you sure you want to remove this API key ending in <strong>...{modalState.keyValue?.slice(-4)}</strong>? This action cannot be undone.</>}
                confirmText="Remove Key"
                confirmButtonClass="btn-danger"
            />
        </>
    );
};

export default NewsSettings;