import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { PanelCard, CustomDropdown, DateRangeFilter, ConfirmationModal, BatchActionToolbar } from '../components/ui';
import { UsersPageSkeleton } from '../components/skeletons';
import { fetchUsersData, deleteUser, deleteUsersBatch } from '../services/supabaseService';
import type { UserStats } from '../types';
import { Search, Trash2, CheckSquare, Square } from 'lucide-react';

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

    // State for deletion and selection
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ ids: string[]; isBatch: boolean } | null>(null);
    const pressTimer = useRef<number | null>(null);
    const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchUsersData();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

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
    
    // --- Deletion and Selection Handlers ---

    const triggerHapticFeedback = () => {
        if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(20);
        }
    };

    const handleDeleteRequest = (userId: string) => {
        setDeleteConfirmation({ ids: [userId], isBatch: false });
    };

    const handleBatchDeleteRequest = () => {
        if (selectedUsers.size > 0) {
            setDeleteConfirmation({ ids: Array.from(selectedUsers), isBatch: true });
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirmation) return;

        const { ids, isBatch } = deleteConfirmation;
        const { error } = isBatch
            ? await deleteUsersBatch(ids)
            : await deleteUser(ids[0]);
        
        setDeleteConfirmation(null);

        if (error) {
            alert(`Failed to delete user(s): ${(error as Error).message}`);
        } else {
            if (isBatch) {
                handleCancelSelection();
            }
            loadUsers(); // Refresh data on success
        }
    };
    
    const handleStartSelection = (userId: string) => {
        triggerHapticFeedback();
        setIsSelectionMode(true);
        setSelectedUsers(new Set([userId]));
    };

    const handleToggleSelection = (userId: string) => {
        triggerHapticFeedback();
        const newSelection = new Set(selectedUsers);
        if (newSelection.has(userId)) {
            newSelection.delete(userId);
        } else {
            newSelection.add(userId);
        }
        
        if (newSelection.size === 0) {
            setIsSelectionMode(false);
        }
        setSelectedUsers(newSelection);
    };

    const handleCancelSelection = () => {
        setIsSelectionMode(false);
        setSelectedUsers(new Set());
    };

    const handleSelectAll = () => {
        triggerHapticFeedback();
        const allUserIds = processedUsers.map(u => u.user.id);
        if (selectedUsers.size === allUserIds.length) {
            setSelectedUsers(new Set());
            setIsSelectionMode(false);
        } else {
            setSelectedUsers(new Set(allUserIds));
            setIsSelectionMode(true);
        }
    };

    useEffect(() => {
        if (selectAllCheckboxRef.current) {
            const isPartiallySelected = selectedUsers.size > 0 && selectedUsers.size < processedUsers.length;
            selectAllCheckboxRef.current.indeterminate = isPartiallySelected;
        }
    }, [selectedUsers, processedUsers.length]);

    const isAllSelected = processedUsers.length > 0 && selectedUsers.size === processedUsers.length;


    if (loading) {
        return <UsersPageSkeleton />;
    }
    
    const UserRow: React.FC<{ userStat: UserStats }> = ({ userStat }) => {
        const { id, full_name, avatar_url, email, created_at } = userStat.user;
        const { conversation_count, ltm_count, code_snippet_count } = userStat;
        
        const isSelected = selectedUsers.has(id);
        const firstLetter = (full_name || email || 'A').charAt(0).toUpperCase();
        const bgColor = stringToColor(full_name || email || id);
        const fallbackAvatar = `https://api.dicebear.com/8.x/initials/svg?seed=${firstLetter}&backgroundColor=${bgColor}&textColor=ffffff&fontSize=40`;

        const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            const target = e.currentTarget;
            if (target.src !== fallbackAvatar) {
                target.src = fallbackAvatar;
            }
        };

        const handlePointerDown = () => {
            if (isSelectionMode) return;
            pressTimer.current = window.setTimeout(() => {
                handleStartSelection(id);
                pressTimer.current = null;
            }, 1000);
        };

        const handlePointerUp = () => {
            if (pressTimer.current) {
                clearTimeout(pressTimer.current);
                pressTimer.current = null;
            }
        };

        const handleRowClick = () => {
            if (pressTimer.current) {
                clearTimeout(pressTimer.current);
                pressTimer.current = null;
            }
            if (isSelectionMode) {
                handleToggleSelection(id);
            }
        };
        
        const StatCell: React.FC<{ value: number }> = ({ value }) => (
            <td className="p-4 border-b border-slate-200 text-slate-600 text-center font-semibold">
                {value}
            </td>
        );

        return (
             <tr 
                className={`transition-colors duration-200 select-none ${isSelected ? 'bg-indigo-50 hover:bg-indigo-100' : 'hover:bg-slate-50'}`}
                onClick={handleRowClick}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                style={{ cursor: isSelectionMode ? 'pointer' : 'default' }}
            >
                {isSelectionMode && (
                    <td className="p-4 border-b border-slate-200 text-center">
                        <button 
                            className="p-2"
                            aria-label={isSelected ? 'Deselect user' : 'Select user'}
                        >
                            {isSelected ? <CheckSquare size={18} className="text-indigo-600" /> : <Square size={18} className="text-slate-400" />}
                        </button>
                    </td>
                )}
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
                 <td className="p-4 border-b border-slate-200 text-center">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteRequest(id); }}
                        className="text-red-500 hover:text-red-700 transition-all p-2 rounded-lg hover:bg-red-100"
                        data-tooltip="Delete User"
                        aria-label="Delete user"
                    >
                        <Trash2 size={16} />
                    </button>
                </td>
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
                        <div className="shrink-0 w-40">
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
                                {isSelectionMode && (
                                    <th className="p-4 text-center">
                                        <input
                                            ref={selectAllCheckboxRef}
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-400 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                            checked={isAllSelected}
                                            onChange={handleSelectAll}
                                            aria-label="Select all users"
                                        />
                                    </th>
                                )}
                                <th className="p-4 text-center font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Avatar</th>
                                <th className="p-4 text-center font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Name</th>
                                <th className="p-4 text-center font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Email</th>
                                <th className="p-4 text-center font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Joined On</th>
                                <th className="p-4 text-center font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Conversations</th>
                                <th className="p-4 text-center font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Memories</th>
                                <th className="p-4 text-center font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Code Snippets</th>
                                <th className="p-4 text-center font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {processedUsers.length > 0 ? (
                                processedUsers.map(userStat => <UserRow key={userStat.user.id} userStat={userStat} />)
                            ) : (
                                <tr>
                                    <td colSpan={isSelectionMode ? 9 : 8} className="text-center py-12 text-slate-500">
                                        <p className='font-semibold text-lg mb-2'>No users found</p>
                                        <p>Your search and filter criteria did not return any results.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </PanelCard>
             {isSelectionMode && (
                <BatchActionToolbar
                    selectedCount={selectedUsers.size}
                    onCancel={handleCancelSelection}
                    onDelete={handleBatchDeleteRequest}
                />
            )}
            <ConfirmationModal
                isOpen={deleteConfirmation !== null}
                onClose={() => setDeleteConfirmation(null)}
                onConfirm={handleConfirmDelete}
                title="Confirm User Deletion"
                message={
                    deleteConfirmation?.isBatch 
                        ? <>Are you sure you want to permanently delete <strong>{deleteConfirmation.ids.length} users</strong>? This will remove all their associated data (profiles, conversations, memories, etc.) and cannot be undone.</>
                        : <>Are you sure you want to permanently delete this user? This will remove all their associated data and cannot be undone.</>
                }
                confirmText={deleteConfirmation?.isBatch ? `Delete ${deleteConfirmation.ids.length} Users` : "Delete User"}
                confirmButtonClass="btn-danger"
            />
        </div>
    );
};

export default UsersPage;