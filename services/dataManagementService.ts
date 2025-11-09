import { createClient } from '@supabase/supabase-js';

// Re-initialize client to keep service self-contained (Main App DB)
const MAIN_SUPABASE_URL = process.env.VITE_MAIN_SUPABASE_URL || 'https://rrpwqxhwwcgcagzkfoip.supabase.co';
const MAIN_SUPABASE_SERVICE_KEY = process.env.VITE_MAIN_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJycHdxeGh3d2NnY2Fnemtmb2lwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDIzNDE3NiwiZXhwIjoyMDc1ODEwMTc2fQ.RDHlMAYngd7I_UAzjdr7p0QDy9SgJrga5m_qOZYoGU4';
const dbMain = createClient(MAIN_SUPABASE_URL, MAIN_SUPABASE_SERVICE_KEY);

// Client for the Agent Handler function (separate project)
const AGENT_SUPABASE_URL = process.env.VITE_AGENT_SUPABASE_URL || 'https://txlogzxtdltxcmkhcqsi.supabase.co';
const AGENT_SUPABASE_SERVICE_KEY = process.env.VITE_AGENT_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4bG9nenh0ZGx0eGNta2hjcXNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDg3NTgzMywiZXhwIjoyMDc2NDUxODMzfQ.OSQB7x3RgM6OKTjSckoSgL6r8vpOq3vnlNzfj-tDgLs';
const dbAgent = createClient(AGENT_SUPABASE_URL, AGENT_SUPABASE_SERVICE_KEY);


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
