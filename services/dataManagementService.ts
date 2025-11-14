import type { TableDetails } from '../types';
import { dbMain, dbAgent } from './supabaseService';


/**
 * Calls a Supabase RPC function to reset the ID (identity) sequence of a given table in the MAIN database.
 * The next inserted row will have ID 1.
 * Requires a PostgreSQL function e.g., 'reset_update_news_logs_id_sequence' to exist in the database.
 * @param tableName The name of the table (e.g., 'update_news_logs').
 */
export async function resetTableSequence(tableName: string) {
    const functionName = `reset_${tableName}_id_sequence`;
    return await dbMain.rpc(functionName);
}

/**
 * Calls a Supabase RPC function to truncate a given table in the MAIN database, deleting all its data.
 * This is a highly destructive operation.
 * Requires a PostgreSQL function e.g., 'truncate_table_update_news_logs' to exist in the database.
 * @param tableName The name of the table (e.g., 'update_news_logs').
 */
export async function resetTableData(tableName: string) {
    const functionName = `truncate_table_${tableName}`;
    return await dbMain.rpc(functionName);
}

/**
 * Calls a Supabase RPC function to reset the ID sequence of a table in the AGENT database.
 * @param tableName The name of the table (e.g., 'groq_agent_logs').
 */
export async function resetAgentTableSequence(tableName: string) {
    const functionName = `reset_${tableName}_id_sequence`;
    return await dbAgent.rpc(functionName);
}

/**
 * Calls a Supabase RPC function to truncate a table in the AGENT database.
 * @param tableName The name of the table (e.g., 'groq_agent_logs').
 */
export async function resetAgentTableData(tableName: string) {
    const functionName = `truncate_table_${tableName}`;
    return await dbAgent.rpc(functionName);
}

/**
 * Fetches basic details for a given table from either the Main or Agent database.
 * @param tableName The name of the table.
 * @param dbName The name of the database group.
 */
export async function fetchTableDetails(tableName: string, dbName: 'Main App' | 'Agent'): Promise<{ data: TableDetails | null, error: any }> {
    const db = dbName === 'Main App' ? dbMain : dbAgent;

    try {
        // Use a generic column like 'created_at' if 'id' might not exist for ordering
        let rowsRes = await db.from(tableName).select('*').limit(5).order('id', { ascending: false });
        // Fallback for tables without an 'id' or if ordering fails
        if (rowsRes.error) {
            rowsRes = await db.from(tableName).select('*').limit(5);
            if (rowsRes.error) throw rowsRes.error;
        }

        const countRes = await db.from(tableName).select('*', { count: 'exact', head: true });
        if (countRes.error) throw countRes.error;

        const rowCount = countRes.count || 0;
        const recentRows = rowsRes.data || [];
        const columns = recentRows.length > 0 ? Object.keys(recentRows[0]) : [];

        return {
            data: {
                tableName,
                dbName,
                rowCount,
                columns,
                recentRows,
            },
            error: null,
        };
    } catch (error) {
        console.error(`Error fetching details for table ${tableName}:`, error);
        return { data: null, error };
    }
}