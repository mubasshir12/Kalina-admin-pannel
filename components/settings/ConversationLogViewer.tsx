import React, { useState } from 'react';
import { Bot, User, Clock, Cpu, FlaskConical, Wind, Thermometer, Brain, Search, Clock4 } from 'lucide-react';

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

// --- View Toggle Component ---
const ViewToggle: React.FC<{ isStructured: boolean; onToggle: () => void }> = ({ isStructured, onToggle }) => (
    <div className="flex justify-end items-center gap-2 mb-4">
        <span className={`text-sm font-medium ${!isStructured ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>Raw JSON</span>
        <button
            onClick={onToggle}
            role="switch"
            aria-checked={isStructured}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isStructured ? 'bg-indigo-600' : 'bg-gray-400'}`}
        >
            <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isStructured ? 'translate-x-5' : 'translate-x-0'}`}
            />
        </button>
        <span className={`text-sm font-medium ${isStructured ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>Structured View</span>
    </div>
);


// --- Helper Components for Structured View ---

const MetadataItem: React.FC<{ icon: React.ReactNode, label: string, value: React.ReactNode }> = ({ icon, label, value }) => (
    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400" title={label}>
        {icon}
        <span className="font-medium">{value}</span>
    </div>
);

const WeatherDisplay: React.FC<{ weather: any }> = ({ weather }) => {
    const weatherCodes: { [key: number]: string } = { 0: "Clear", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast" };
    return (
        <div className="mt-2 p-3 rounded-lg border border-sky-200 bg-sky-50 dark:border-sky-800 dark:bg-sky-900/40">
            <p className="font-bold text-sm text-sky-800 dark:text-sky-200">Weather for {weather.location.name}, {weather.location.country}</p>
            <div className="flex items-center gap-4 mt-1 text-sky-700 dark:text-sky-300">
                <div className="flex items-center gap-1"><Thermometer size={14} /> {weather.current.temperature}°C (Feels like {weather.current.apparentTemperature}°C)</div>
                <div className="flex items-center gap-1"><Wind size={14} /> {weather.current.windSpeed} km/h</div>
            </div>
            <p className="text-xs mt-1 text-sky-600 dark:text-sky-400">{weatherCodes[weather.current.weatherCode] || 'Weather data available'}</p>
        </div>
    );
};

const MoleculeDisplay: React.FC<{ molecule: any }> = ({ molecule }) => (
    <div className="mt-2 p-3 rounded-lg border border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/40">
        <p className="font-bold text-sm text-purple-800 dark:text-purple-200 flex items-center gap-2"><FlaskConical size={16} /> Molecule Details</p>
        <div className="text-xs mt-1 space-y-0.5 text-purple-700 dark:text-purple-300">
            <p><strong>IUPAC Name:</strong> {molecule.iupacName}</p>
            <p><strong>Formula:</strong> {molecule.molecularFormula}</p>
            <p><strong>Weight:</strong> {molecule.molecularWeight} g/mol</p>
        </div>
    </div>
);

const ThinkingDisplay: React.FC<{ message: any }> = ({ message }) => (
    <details className="mt-2 text-xs rounded-lg border border-slate-200 bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800/50">
        <summary className="p-2 font-semibold cursor-pointer text-slate-600 dark:text-zinc-300 flex items-center gap-2"><Brain size={14} /> Behind the Scenes</summary>
        <div className="p-3 border-t border-slate-200 dark:border-zinc-700 space-y-3">
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
            <div className="bg-indigo-500 text-white p-3 rounded-lg rounded-br-none">
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
                <p className="font-bold text-xs mb-1 text-slate-400">ID: {message.id}</p>
                <div className="text-sm text-slate-800 dark:text-zinc-100 space-y-2">
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
const ConversationLogViewer: React.FC<{ data: any }> = ({ data }) => {
    const [isStructured, setIsStructured] = useState(true);
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
            <div className="text-red-500 bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
                <p className="font-bold">Error rendering structured view:</p>
                <p className="text-sm mt-1">{parseError}</p>
                <p className="text-sm mt-2 font-bold">Raw Data:</p>
                <pre className="text-xs bg-red-100 dark:bg-red-900/50 p-2 mt-1 rounded overflow-x-auto"><code>{rawJsonString}</code></pre>
            </div>
        )
    }

    return (
        <div>
            <ViewToggle isStructured={isStructured} onToggle={() => setIsStructured(!isStructured)} />
            
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
                    <pre className="text-xs bg-slate-100 dark:bg-zinc-800 p-3 rounded-md">
                        <code>{rawJsonString}</code>
                    </pre>
                )}
            </div>
        </div>
    )
};

export default ConversationLogViewer;