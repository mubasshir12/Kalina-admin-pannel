import React, { useState, useEffect, useMemo } from 'react';
import { PanelCard, CustomDropdown, DateRangeFilter } from '../components/ui';
import { UsersPageSkeleton } from '../components/skeletons';
import { fetchUsersData } from '../services/supabaseService';
import type { UserStats } from '../types';
import { Search } from 'lucide-react';

const stringToColor = (str: string): string => {
    let hash = 0;
    if (str.length === 0) return 'D1D5DB'; // A fallback gray color
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }
    const color = ('000000' + (hash & 0xFFFFFF).toString(16)).slice(-6);
    return color;
};

const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<UserStats[]>([]);
    const [loading, setLoading] = useState(true);
    
    // State for filters and sorting
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('newest');
    const [dateRange, setDateRange] = useState<{ startDate: Date | null, endDate: Date | null }>({ startDate: null, endDate: null });

    useEffect(() => {
        const loadUsers = async () => {
            setLoading(true);
            try {
                const data = await fetchUsersData();
                setUsers(data);
            } catch (error) {
                console.error("Failed to fetch users data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadUsers();
    }, []);

    const processedUsers = useMemo(() => {
        const term = searchTerm.toLowerCase();
        
        let processed = [...users];

        // 1. Filter by date range
        if (dateRange.startDate && dateRange.endDate) {
            processed = processed.filter(userStat => {
                const joinDate = new Date(userStat.user.created_at);
                return joinDate >= dateRange.startDate! && joinDate <= dateRange.endDate!;
            });
        }
        
        // 2. Filter by search term
        if (term) {
             processed = processed.filter(userStat => 
                userStat.user.full_name?.toLowerCase().includes(term) ||
                userStat.user.email?.toLowerCase().includes(term)
            );
        }

        // 3. Sort the array
        switch (sortOption) {
            case 'oldest':
                processed.sort((a, b) => new Date(a.user.created_at).getTime() - new Date(b.user.created_at).getTime());
                break;
            case 'name':
                processed.sort((a, b) => (a.user.full_name || '').localeCompare(b.user.full_name || ''));
                break;
            case 'conversations':
                processed.sort((a, b) => b.conversation_count - a.conversation_count);
                break;
            case 'newest':
            default:
                processed.sort((a, b) => new Date(b.user.created_at).getTime() - new Date(a.user.created_at).getTime());
                break;
        }

        return processed;
    }, [users, searchTerm, sortOption, dateRange]);

    if (loading) {
        return <UsersPageSkeleton />;
    }
    
    const UserRow: React.FC<{ userStat: UserStats }> = ({ userStat }) => {
        const { id, full_name, avatar_url, email, created_at } = userStat.user;
        const { conversation_count, ltm_count, code_snippet_count } = userStat;
        
        const firstLetter = (full_name || email || 'A').charAt(0).toUpperCase();
        const bgColor = stringToColor(full_name || email || id);
        const fallbackAvatar = `https://api.dicebear.com/8.x/initials/svg?seed=${firstLetter}&backgroundColor=${bgColor}&textColor=ffffff&fontSize=40`;

        const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            const target = e.currentTarget;
            if (target.src !== fallbackAvatar) {
                target.src = fallbackAvatar;
            }
        };
        
        const StatCell: React.FC<{ value: number }> = ({ value }) => (
            <td className="p-4 border-b border-slate-200 text-slate-600 text-center font-semibold">
                {value}
            </td>
        );

        return (
             <tr className="hover:bg-slate-50 transition-colors duration-200">
                <td className="p-4 border-b border-slate-200 text-center">
                     <div className="flex items-center justify-center">
                        <img
                            src={avatar_url || fallbackAvatar}
                            alt={full_name || 'User Avatar'}
                            className="w-10 h-10 rounded-full object-cover bg-slate-200"
                            onError={handleError}
                        />
                    </div>
                </td>
                <td className="p-4 border-b border-slate-200 font-semibold text-slate-800 text-center whitespace-nowrap">
                    {full_name || 'N/A'}
                </td>
                <td className="p-4 border-b border-slate-200 text-slate-600 text-center whitespace-nowrap">{email}</td>
                <td className="p-4 border-b border-slate-200 text-slate-600 text-center whitespace-nowrap">
                    {new Date(created_at).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'long', day: 'numeric'
                    })}
                </td>
                <StatCell value={conversation_count} />
                <StatCell value={ltm_count} />
                <StatCell value={code_snippet_count} />
            </tr>
        );
    };

    return (
        <div className="space-y-6">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-800 shrink-0">User Management ({users.length})</h2>
                
                <div className="w-full md:w-auto flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
                    <div className="flex-1 flex items-center gap-2">
                        <div className="relative flex-grow">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input 
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="form-input w-full pl-11 rounded-full"
                            />
                        </div>
                        <div className="shrink-0 w-48">
                            <CustomDropdown
                                value={sortOption}
                                onChange={setSortOption}
                                options={['newest', 'oldest', 'name', 'conversations']}
                                displayLabels={{
                                    newest: 'Newest First',
                                    oldest: 'Oldest First',
                                    name: 'By Name (A-Z)',
                                    conversations: 'By Conversations'
                                }}
                                triggerClassName="rounded-full"
                            />
                        </div>
                    </div>
                    
                    <DateRangeFilter onChange={setDateRange} />
                </div>
            </div>

            <PanelCard className="overflow-hidden !p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-4 text-center font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Avatar</th>
                                <th className="p-4 text-center font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Name</th>
                                <th className="p-4 text-center font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Email</th>
                                <th className="p-4 text-center font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Joined On</th>
                                <th className="p-4 text-center font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Conversations</th>
                                <th className="p-4 text-center font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Memories</th>
                                <th className="p-4 text-center font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Code Snippets</th>
                            </tr>
                        </thead>
                        <tbody>
                            {processedUsers.length > 0 ? (
                                processedUsers.map(userStat => <UserRow key={userStat.user.id} userStat={userStat} />)
                            ) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-slate-500">
                                        <p className='font-semibold text-lg mb-2'>No users found</p>
                                        <p>Your search and filter criteria did not return any results.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </PanelCard>
        </div>
    );
};

export default UsersPage;