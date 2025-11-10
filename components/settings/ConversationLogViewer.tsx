import React, { useState } from 'react';
import { Bot, User, Clock, Cpu, FlaskConical, Wind, Thermometer, Brain, Search, Clock4 } from 'lucide-react';
import { CopyButton } from '../ui';

// --- Type Guard to check if data is a conversation log ---
export const isConversationJson = (data: any): boolean => {
    if (!Array.isArray(data)) return false;
    // It's a conversation if it's an empty array or the first element has the expected shape.
    if (data.length === 0) return true;
    const firstItem = data[0];
    return (
        typeof firstItem === 'object' &&
        firstItem !== null &&
        'id' in firstItem &&
        'role' in firstItem &&
        'content' in firstItem &&
        'timestamp' in firstItem
    );
};

// --- Helper Components for Structured View ---

const MetadataItem: React.FC<{ icon: React.ReactNode, label: string, value: React.ReactNode }> = ({ icon, label, value }) => (
    <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]" title={label}>
        {icon}
        <span className="font-medium">{value}</span>
    </div>
);

const WeatherDisplay: React.FC<{ weather: any }> = ({ weather }) => {
    const weatherCodes: { [key: number]: string } = { 0: "Clear", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast" };
    return (
        <div className="mt-2 p-3 rounded-lg border" style={{ backgroundColor: 'var(--status-info-bg)', borderColor: 'var(--border-color)' }}>
            <p className="font-bold text-sm" style={{ color: 'var(--status-info-text)' }}>Weather for {weather.location.name}, {weather.location.country}</p>
            <div className="flex items-center gap-4 mt-1" style={{ color: 'var(--status-info-text)', opacity: 0.9 }}>
                <div className="flex items-center gap-1"><Thermometer size={14} /> {weather.current.temperature}°C (Feels like {weather.current.apparentTemperature}°C)</div>
                <div className="flex items-center gap-1"><Wind size={14} /> {weather.current.windSpeed} km/h</div>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--status-info-text)', opacity: 0.8 }}>{weatherCodes[weather.current.weatherCode] || 'Weather data available'}</p>
        </div>
    );
};

const MoleculeDisplay: React.FC<{ molecule: any }> = ({ molecule }) => (
    <div className="mt-2 p-3 rounded-lg border" style={{ backgroundColor: 'var(--icon-bg-purple)', borderColor: 'var(--border-color)' }}>
        <p className="font-bold text-sm flex items-center gap-2" style={{ color: 'var(--icon-fg-purple)' }}><FlaskConical size={16} /> Molecule Details</p>
        <div className="text-xs mt-1 space-y-0.5" style={{ color: 'var(--icon-fg-purple)', opacity: 0.9 }}>
            <p><strong>IUPAC Name:</strong> {molecule.iupacName}</p>
            <p><strong>Formula:</strong> {molecule.molecularFormula}</p>
            <p><strong>Weight:</strong> {molecule.molecularWeight} g/mol</p>
        </div>
    </div>
);

const ThinkingDisplay: React.FC<{ message: any }> = ({ message }) => (
    <details className="mt-2 text-xs rounded-lg border" style={{ backgroundColor: 'var(--subtle-bg)', borderColor: 'var(--subtle-border)' }}>
        <summary className="p-2 font-semibold cursor-pointer flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}><Brain size={14} /> Behind the Scenes</summary>
        <div className="p-3 border-t space-y-3" style={{ borderColor: 'var(--subtle-border)' }}>
            {message.webSearchMessage && <p><strong>Search Message:</strong> {message.webSearchMessage}</p>}
            {message.searchQueries?.length > 0 && (
                <div>
                    <strong className="flex items-center gap-1"><Search size={12} /> Search Queries:</strong>
                    <ul className="list-disc list-inside pl-2">
                        {message.searchQueries.map((q: string, i: number) => <li key={i}>{q}</li>)}
                    </ul>
                </div>
            )}
            {message.thoughts?.length > 0 && (
                 <div>
                    <strong>Thoughts:</strong>
                    <ul className="list-decimal list-inside pl-2">
                        {message.thoughts.map((t: any, i: number) => <li key={i}>{t.step || JSON.stringify(t)}</li>)}
                    </ul>
                </div>
            )}
        </div>
    </details>
);

// --- Chat Bubble Components ---

const UserMessageBubble: React.FC<{ message: any }> = ({ message }) => (
    <div className="flex items-start gap-3 justify-end">
        <div className="max-w-xl">
            <div className="text-white p-3 rounded-lg rounded-br-none" style={{ backgroundColor: 'var(--accent-color)' }}>
                <p className="font-bold text-xs mb-1 opacity-80">ID: {message.id}</p>
                <div className="text-sm space-y-2">
                    <p style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>
                    {message.images?.map((img: any, index: number) => (
                        <img key={index} src={`data:${img.mimeType};base64,${img.base64}`} alt="user upload" className="mt-2 rounded-md max-w-[150px]" />
                    ))}
                </div>
            </div>
            <div className="flex justify-end items-center gap-4 mt-1.5 px-2">
                <MetadataItem icon={<Clock size={12}/>} label="Timestamp" value={new Date(message.timestamp).toLocaleString()} />
            </div>
        </div>
    </div>
);

const ModelMessageBubble: React.FC<{ message: any }> = ({ message }) => (
     <div className="flex items-start gap-3">
        <div className="max-w-xl">
            <div>
                <p className="font-bold text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>ID: {message.id}</p>
                <div className="text-sm space-y-2" style={{ color: 'var(--text-primary)' }}>
                    <div style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br />').replace(/\*\*\*(.*?)\*\*\*/g, '<h3>$1</h3>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }}></div>
                    {message.images?.map((img: any, index: number) => (
                        <img key={index} src={`data:${img.mimeType};base64,${img.base64}`} alt="model generation" className="mt-2 rounded-md max-w-[150px]" />
                    ))}
                    {message.weather && <WeatherDisplay weather={message.weather} />}
                    {message.molecule && <MoleculeDisplay molecule={message.molecule} />}
                    {(message.thoughts?.length > 0 || message.searchQueries?.length > 0) && <ThinkingDisplay message={message} />}
                </div>
            </div>
            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1.5 px-2">
                <MetadataItem icon={<Clock size={12}/>} label="Timestamp" value={new Date(message.timestamp).toLocaleString()} />
                <MetadataItem icon={<Cpu size={12}/>} label="Model Used" value={message.modelUsed} />
                {message.generationTime && <MetadataItem icon={<Clock4 size={12}/>} label="Generation Time" value={`${(message.generationTime / 1000).toFixed(2)}s`} />}
            </div>
        </div>
    </div>
);


// --- Main Viewer for Conversation JSON ---
const ConversationLogViewer: React.FC<{ data: any; isStructured: boolean; }> = ({ data, isStructured }) => {
    let messages: any[] = [];
    let parseError: string | null = null;
    let rawJsonString = '';

    try {
        let dataToUse = data;
        
        // If it's a string, try to parse it. If it's an object, use it directly.
        if (typeof dataToUse === 'string') {
            try {
                dataToUse = JSON.parse(dataToUse);
            } catch (e) {
                 throw new Error("Value is a string but not valid JSON.");
            }
        }

        if (Array.isArray(dataToUse)) {
            messages = dataToUse;
            rawJsonString = JSON.stringify(messages, null, 2);
        } else {
            throw new Error("Parsed data is not an array, which is required for conversation view.");
        }
    } catch (e) {
        parseError = (e as Error).message;
        // If parsing fails, try to display the original value
        if (typeof data === 'object') {
            rawJsonString = JSON.stringify(data, null, 2);
        } else {
            rawJsonString = String(data);
        }
    }

    if (parseError) {
        return (
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--status-danger-bg)', color: 'var(--status-danger-text)' }}>
                <p className="font-bold">Error rendering structured view:</p>
                <p className="text-sm mt-1" style={{ opacity: 0.9 }}>{parseError}</p>
                <p className="text-sm mt-2 font-bold">Raw Data:</p>
                <div className="relative mt-1 group">
                    <CopyButton textToCopy={rawJsonString} />
                    <pre className="text-xs p-2 rounded overflow-x-auto" style={{ backgroundColor: 'var(--status-danger-subtle-bg)' }}>
                        <code style={{ color: 'var(--status-danger-text)' }}>{rawJsonString}</code>
                    </pre>
                </div>
            </div>
        )
    }

    return (
        <div className="relative group">
            <div className="max-h-[60vh] overflow-y-auto pr-2">
                {isStructured ? (
                    <div className="space-y-6">
                        {messages.map(message => (
                            <div key={message.id}>
                                {message.role === 'user' 
                                    ? <UserMessageBubble message={message} />
                                    : <ModelMessageBubble message={message} />
                                }
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="relative">
                        <CopyButton textToCopy={rawJsonString} />
                        <pre className="text-xs p-3 rounded-md overflow-auto" style={{ backgroundColor: 'var(--subtle-bg)' }}>
                            <code>{rawJsonString}</code>
                        </pre>
                    </div>
                )}
            </div>
        </div>
    )
};

export default ConversationLogViewer;