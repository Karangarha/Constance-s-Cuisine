import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load .env manually
try {
    const envPath = path.resolve(process.cwd(), '.env');
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim();
            process.env[key] = value;
        }
    });
} catch (e) {
    console.log("Could not read .env file", e);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debug() {
    // We can't easily query pg_catalog via supabase-js client unless we have a function for it
    // or if we use the rpc call if one exists.
    // But we can try to infer it by listening.

    console.log("Listening for changes on orders...");

    const channel = supabase
        .channel('debug-changes')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'orders' },
            (payload) => {
                console.log('Change received!', payload);
            }
        )
        .subscribe((status) => {
            console.log("Subscription status:", status);
        });

    // Keep alive for a bit
    setTimeout(() => {
        console.log("Timeout reached");
        process.exit(0);
    }, 5000);
}

debug();
