import React, { useEffect, useRef, useCallback } from 'react';

// --- Custom SVG Icon Components ---

const ClientAppIcon = () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="14" y="4" width="36" height="56" rx="6" fill="#27272A" stroke="#4F46E5" strokeWidth="2"/>
        <path d="M28 10H36" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="32" cy="54" r="2" fill="#4F46E5"/>
    </svg>
);

const AdminPanelIcon = () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="10" width="56" height="44" rx="4" fill="#27272A" stroke="#4F46E5" strokeWidth="2"/>
        <path d="M4 18H60" stroke="#4F46E5" strokeWidth="2"/>
        <circle cx="10" cy="14" r="1.5" fill="#EF4444"/>
        <circle cx="16" cy="14" r="1.5" fill="#F59E0B"/>
        <circle cx="22" cy="14" r="1.5" fill="#10B981"/>
        <rect x="10" y="24" width="18" height="24" rx="2" fill="#3F3F46"/>
        <path d="M34 29H54M34 35H54M34 41H46" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);

const SupabaseFunctionIcon = ({ isNews = false }: { isNews?: boolean }) => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 4L4 32L32 60L60 32L32 4Z" fill="#27272A" stroke="#A78BFA" strokeWidth="2"/>
        <path d="M22 26L18 32L22 38" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M42 26L46 32L42 38" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d={isNews ? "M28 36L36 28" : "M34 26L30 38"} stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const GroqIcon = () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="44" height="44" rx="4" fill="#27272A" stroke="#38BDF8" strokeWidth="2"/>
        <rect x="18" y="18" width="28" height="28" rx="2" fill="#3F3F46"/>
        <path d="M10 20H4M10 28H4M10 36H4M10 44H4M54 20H60M54 28H60M54 36H60M54 44H60M20 10V4M28 10V4M36 10V4M44 10V4M20 54V60M28 54V60M36 54V60M44 54V60" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);

const GNewsIcon = () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="12" width="56" height="40" rx="4" fill="#27272A" stroke="#38BDF8" strokeWidth="2"/>
        <path d="M4 22H28" stroke="#38BDF8" strokeWidth="2"/>
        <rect x="10" y="28" width="12" height="8" rx="1" fill="#3F3F46"/>
        <path d="M10 40H22M10 44H18" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="44" cy="36" r="8" stroke="#A1A1AA" strokeWidth="2"/>
        <path d="M50 42L54 46" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);

const GeminiIcon = () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 50C42.4947 50 50.3158 41.0457 50.3158 32C50.3158 22.9543 42.4947 14 32 14C21.5053 14 13.6842 22.9543 13.6842 32C13.6842 41.0457 21.5053 50 32 50Z" stroke="#38BDF8" strokeWidth="2"/>
        <path d="M32 4L32 14" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round"/>
        <path d="M32 50L32 60" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round"/>
        <path d="M51.9184 12.0815L45.2517 18.7482" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round"/>
        <path d="M18.748 45.2517L12.0813 51.9184" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round"/>
        <path d="M60 32L50 32" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round"/>
        <path d="M14 32L4 32" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round"/>
        <path d="M51.9184 51.9185L45.2517 45.2518" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round"/>
        <path d="M18.748 18.7482L12.0813 12.0815" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);

const MainDbIcon = () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21C12 16.5817 20.9375 13 32 13C43.0625 13 52 16.5817 52 21V43C52 47.4183 43.0625 51 32 51C20.9375 51 12 47.4183 12 43V21Z" fill="#27272A" stroke="#22C55E" strokeWidth="2"/>
        <path d="M52 29C52 33.4183 43.0625 37 32 37C20.9375 37 12 33.4183 12 29" stroke="#22C55E" strokeWidth="2"/>
        <path d="M52 21C52 25.4183 43.0625 29 32 29C20.9375 29 12 25.4183 12 21" stroke="#22C55E" strokeWidth="2"/>
    </svg>
);

const AgentDbIcon = () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 29C12 24.5817 20.9375 21 32 21C43.0625 21 52 24.5817 52 29V43C52 47.4183 43.0625 51 32 51C20.9375 51 12 47.4183 12 43V29Z" fill="#27272A" stroke="#22C55E" strokeWidth="2"/>
        <path d="M52 29C52 33.4183 43.0625 37 32 37C20.9375 37 12 33.4183 12 29" stroke="#22C55E" strokeWidth="2"/>
    </svg>
);


// --- Generic Components ---

const Group: React.FC<{ title: string; children: React.ReactNode; className?: string; titlePosition?: 'left' | 'right' }> = ({ title, children, className, titlePosition = 'left' }) => (
    <div className={`relative p-6 pt-8 rounded-xl ${className}`}>
        <h3 className={`absolute -top-3 px-2 bg-zinc-950 text-sm font-bold text-slate-400 tracking-wider ${titlePosition === 'left' ? 'left-4' : 'right-4'}`}>{title}</h3>
        {children}
    </div>
);

const ArchitectureNode: React.FC<{
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    glowType: 'accent' | 'purple' | 'sky' | 'green';
    textPosition?: 'top' | 'bottom';
}> = ({ id, title, description, icon, glowType, textPosition = 'bottom' }) => (
    <div id={id} className="relative flex flex-col items-center text-center w-48">
        {/* Conditional port positioning */}
        {textPosition === 'bottom' && <>
            <div id={`${id}-port-right`} className="port" style={{ top: '32px', left: 'calc(50% + 28px)' }}></div>
            <div id={`${id}-port-left`} className="port" style={{ top: '32px', left: 'calc(50% - 28px)' }}></div>
            <div id={`${id}-port-top`} className="port" style={{ top: '4px', left: '50%' }}></div>
            <div id={`${id}-port-bottom`} className="port" style={{ top: '60px', left: '50%' }}></div>
        </>}
        {textPosition === 'top' && <>
            {/* Offset by ~40px for the text block above */}
            <div id={`${id}-port-right`} className="port" style={{ top: '72px', left: 'calc(50% + 28px)' }}></div>
            <div id={`${id}-port-left`} className="port" style={{ top: '72px', left: 'calc(50% - 28px)' }}></div>
            <div id={`${id}-port-top`} className="port" style={{ top: '44px', left: '50%' }}></div>
            <div id={`${id}-port-bottom`} className="port" style={{ top: '90px', left: '50%' }}></div>
        </>}

        {/* Conditional text rendering */}
        {textPosition === 'top' && (
            <div className="mb-2">
                <h4 className="font-bold text-sm text-slate-100">{title}</h4>
                <p className="text-xs text-slate-400">{description}</p>
            </div>
        )}

        <div className={`w-16 h-16 text-white transition-all duration-300 hover:scale-110 glow-${glowType}`}>{icon}</div>

        {textPosition === 'bottom' && (
            <div className="mt-2">
                <h4 className="font-bold text-sm text-slate-100">{title}</h4>
                <p className="text-xs text-slate-400">{description}</p>
            </div>
        )}
    </div>
);

const connections = [
    { start: 'client-app-port-bottom', end: 'agent-fn-port-top', color: 'var(--accent-color)' },
    { start: 'admin-panel-port-left', end: 'agent-fn-port-top', color: 'var(--accent-color)' },
    { start: 'admin-panel-port-left', end: 'news-fn-port-top', color: 'var(--accent-color)' },
    { start: 'agent-fn-port-right', end: 'groq-api-port-left', color: 'var(--sidebar-text-muted)' },
    { start: 'news-fn-port-right', end: 'gnews-api-port-left', color: 'var(--sidebar-text-muted)' },
    { start: 'news-fn-port-right', end: 'gemini-api-port-left', color: 'var(--sidebar-text-muted)' },
    { start: 'agent-fn-port-bottom', end: 'db-agent-port-top', color: 'var(--accent-color)' },
    { start: 'news-fn-port-bottom', end: 'db-main-port-top', color: 'var(--accent-color)' },
    { start: 'client-app-port-bottom', end: 'db-main-port-top', color: '#22C55E' },
    { start: 'admin-panel-port-bottom', end: 'db-main-port-top', color: '#22C55E' },
    { start: 'admin-panel-port-bottom', end: 'db-agent-port-top', color: '#22C55E' },
];

const markerColors: Record<string, string> = {
    'var(--accent-color)': 'accent',
    '#22C55E': 'success',
    'var(--sidebar-text-muted)': 'secondary',
};

const SystemArchitecture: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const pathRefs = useRef<(SVGPathElement | null)[]>([]);

    const drawLines = useCallback(() => {
        if (!containerRef.current) return;
        
        const getPortCoords = (elementId: string) => {
            const el = document.getElementById(elementId);
            if (!el || !containerRef.current) return null;
            const containerRect = containerRef.current.getBoundingClientRect();
            const elRect = el.getBoundingClientRect();
            return {
                x: elRect.left - containerRect.left + elRect.width / 2,
                y: elRect.top - containerRect.top + elRect.height / 2,
            };
        };
        
        connections.forEach((conn, index) => {
            const start = getPortCoords(conn.start);
            const end = getPortCoords(conn.end);
            const pathEl = pathRefs.current[index];

            if (start && end && pathEl) {
                // S-CURVE LOGIC
                const dx = end.x - start.x;
                const dy = end.y - start.y;
                let path;

                if (Math.abs(dx) > Math.abs(dy)) { // More horizontal, S-curve opens vertically
                    const cx1 = start.x + dx / 2;
                    const cy1 = start.y;
                    const cx2 = end.x - dx / 2;
                    const cy2 = end.y;
                    path = `M ${start.x} ${start.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${end.x} ${end.y}`;
                } else { // More vertical, S-curve opens horizontally
                    const cx1 = start.x;
                    const cy1 = start.y + dy / 2;
                    const cx2 = end.x;
                    const cy2 = end.y - dy / 2;
                    path = `M ${start.x} ${start.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${end.x} ${end.y}`;
                }

                pathEl.setAttribute('d', path);
                pathEl.setAttribute('stroke', conn.color);
                const markerColor = markerColors[conn.color] || 'secondary';
                pathEl.setAttribute('marker-end', `url(#arrowhead-${markerColor})`);
            } else if (pathEl) {
                pathEl.setAttribute('d', '');
            }
        });
    }, []);

    useEffect(() => {
        let resizeTimeout: number;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = window.setTimeout(() => {
                requestAnimationFrame(drawLines);
            }, 100);
        };
        
        const timer = setTimeout(drawLines, 150);
        window.addEventListener('resize', handleResize);
        
        const observer = new ResizeObserver(handleResize);
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }
        
        return () => {
            clearTimeout(timer);
            clearTimeout(resizeTimeout);
            window.removeEventListener('resize', handleResize);
            if (containerRef.current) {
                observer.unobserve(containerRef.current);
            }
        };
    }, [drawLines]);

    return (
        <>
            <style>{`
                /* --- Settings & Architecture Page Connecting Line --- */
                .connecting-line {
                    stroke-dasharray: 6 3;
                    animation: march 1s linear infinite;
                    opacity: 0.8;
                }
                @keyframes march {
                    to {
                        stroke-dashoffset: -9;
                    }
                }

                /* --- System Architecture Page Styles --- */
                .port {
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    background-color: transparent;
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                }
                /* Glow effect for architecture icons */
                .glow-accent {
                    filter: drop-shadow(0 0 6px rgba(79, 70, 229, 0.7));
                }
                .glow-purple {
                    filter: drop-shadow(0 0 6px rgba(167, 139, 250, 0.7));
                }
                .glow-sky {
                    filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.7));
                }
                .glow-green {
                    filter: drop-shadow(0 0 6px rgba(34, 197, 94, 0.7));
                }
            `}</style>
            <div ref={containerRef} className="relative inline-flex flex-col items-center justify-between gap-20 p-12">
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                    <defs>
                        <marker id="arrowhead-accent" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="var(--accent-color)" />
                        </marker>
                        <marker id="arrowhead-success" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#22C55E" />
                        </marker>
                        <marker id="arrowhead-secondary" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="var(--sidebar-text-muted)" />
                        </marker>
                    </defs>
                    {connections.map((_, i) => (
                        <path
                            key={i}
                            ref={el => { if(el) pathRefs.current[i] = el; }}
                            fill="none"
                            strokeWidth="1.5"
                            className="connecting-line transition-all duration-300"
                        />
                    ))}
                </svg>

                <div className="relative z-10 w-full flex flex-col items-center gap-20">
                    {/* --- TOP ROW: Frontends --- */}
                    <div className="flex justify-center items-start gap-24 w-full">
                        <ArchitectureNode id="client-app" title="Client App" description="User-facing application" icon={<ClientAppIcon />} glowType="accent" textPosition="top" />
                        <ArchitectureNode id="admin-panel" title="Admin Panel" description="Monitoring & configuration" icon={<AdminPanelIcon />} glowType="accent" textPosition="top" />
                    </div>
                    
                    {/* --- MIDDLE ROW: Services --- */}
                    <div className="flex justify-between items-start w-full max-w-6xl">
                        <Group title="Supabase Edge Functions" className="w-[400px]">
                            <div className="space-y-8 p-4 flex flex-col items-center">
                                <ArchitectureNode id="agent-fn" title="Agent" description="Handles AI agent logic" icon={<SupabaseFunctionIcon />} glowType="purple" />
                                <ArchitectureNode id="news-fn" title="News Updater" description="Fetches & formats articles" icon={<SupabaseFunctionIcon isNews />} glowType="purple" />
                            </div>
                        </Group>
                        
                        <Group title="External APIs" className="w-[400px]" titlePosition="right">
                            <div className="space-y-8 p-4 flex flex-col items-center">
                                <ArchitectureNode id="groq-api" title="Groq API" description="LLM for agent responses" icon={<GroqIcon />} glowType="sky" />
                                <ArchitectureNode id="gnews-api" title="GNews API" description="Fetches news articles" icon={<GNewsIcon />} glowType="sky" />
                                <ArchitectureNode id="gemini-api" title="Gemini API" description="Article summarization" icon={<GeminiIcon />} glowType="sky" />
                            </div>
                        </Group>
                    </div>

                    {/* --- BOTTOM ROW: Databases --- */}
                    <div className="flex justify-center items-start gap-24 w-full">
                        <ArchitectureNode id="db-main" title="Main App DB" description="Users, Content, Interactions" icon={<MainDbIcon />} glowType="green" />
                        <ArchitectureNode id="db-agent" title="Agent DB" description="Logs & Agent Config" icon={<AgentDbIcon />} glowType="green" />
                    </div>
                </div>
            </div>
        </>
    );
};

export default SystemArchitecture;