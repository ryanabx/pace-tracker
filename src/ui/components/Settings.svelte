<script lang="ts">
    import type { Tracker, ThemeMode } from '../../core/state';

    let {
        commitHash,
        repoUrl,
        themeMode,
        onThemeModeChange,
        trackers,
        activeTrackerId,
        onSelectTracker,
        onRenameTracker,
        onNewTracker,
        onDeleteTracker,
    }: {
        commitHash: string;
        repoUrl: string;
        themeMode: ThemeMode;
        onThemeModeChange: (mode: ThemeMode) => void;
        trackers: Record<string, Tracker>;
        activeTrackerId: string | null;
        onSelectTracker: (trackerId: string) => void;
        onRenameTracker: () => void;
        onNewTracker: () => void;
        onDeleteTracker: () => void;
    } = $props();

    let trackerIds = $derived(Object.keys(trackers));

    const themeOptions: { mode: ThemeMode; label: string }[] = [
        { mode: 'auto', label: 'Auto (System)' },
        { mode: 'light', label: 'Light' },
        { mode: 'dark', label: 'Dark' },
    ];

    let repoDisplay = $derived.by(() => {
        const url = new URL(repoUrl);
        return `${url.hostname}/${url.pathname.replace(/^\//, '')}`;
    });
</script>

<div class="settings">
    <!-- About Section -->
    <section class="card">
        <h2>About</h2>
        <div class="row">
            <span class="muted">Version</span>
            <span class="mono">{commitHash ? commitHash.slice(0, 7) : 'dev'}</span>
        </div>
        <a class="repo-link" href={repoUrl} target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                <path
                    fill="currentColor"
                    d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z" />
            </svg>
            {repoDisplay}
        </a>
    </section>

    <!-- Appearance Section -->
    <section class="card">
        <h2>Appearance</h2>
        <label class="select-label">
            <span>Theme</span>
            <select
                value={themeMode}
                onchange={(e) => onThemeModeChange(e.currentTarget.value as ThemeMode)}
            >
                {#each themeOptions as opt (opt.mode)}
                    <option value={opt.mode}>{opt.label}</option>
                {/each}
            </select>
        </label>
    </section>

    <!-- Trackers Section -->
    <section class="card">
        <h2>Trackers</h2>
        <label class="select-label">
            <span>Tracker</span>
            <select
                value={activeTrackerId ?? ''}
                onchange={(e) => onSelectTracker(e.currentTarget.value)}
            >
                {#each trackerIds as id (id)}
                    <option value={id}>{trackers[id].name}</option>
                {/each}
            </select>
        </label>
        <div class="button-row">
            <button class="btn btn-success" onclick={onNewTracker}>
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                    <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                </svg>
                New
            </button>
            <button class="btn btn-primary" onclick={onRenameTracker}>
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                    <path
                        fill="currentColor"
                        d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                    </svg>
                Rename
            </button>
            <button
                class="btn btn-danger"
                disabled={trackerIds.length <= 1}
                onclick={onDeleteTracker}
            >
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                    <path
                        fill="currentColor"
                        d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                </svg>
                Delete
            </button>
        </div>
    </section>
</div>

<style>
    .settings {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        flex: 1;
        min-height: 0;
        overflow-y: auto;
    }

    .card {
        background-color: var(--row-bg);
        border-radius: 0.5rem;
        padding: 1rem 1.25rem;
    }

    .card h2 {
        margin: 0 0 0.75rem;
        font-size: 1.1rem;
        font-weight: 500;
    }

    .row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
    }

    .muted {
        color: var(--text-secondary);
        font-size: 0.875rem;
    }

    .mono {
        font-family: monospace;
        font-size: 0.875rem;
        margin-left: auto;
    }

    .repo-link {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        color: var(--primary);
        text-decoration: none;
        font-size: 0.875rem;
    }

    .repo-link:hover {
        text-decoration: underline;
    }

    .select-label {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.875rem;
    }

    .select-label span {
        color: var(--text-secondary);
    }

    .select-label select {
        flex: 1;
        padding: 0.375rem 0.5rem;
        border-radius: 0.375rem;
        border: 1px solid var(--divider);
        background-color: var(--paper);
        color: var(--text);
        font-size: 0.875rem;
        font-family: inherit;
    }

    .button-row {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.75rem;
    }

    .btn {
        flex: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.375rem;
        border: none;
        border-radius: 0.375rem;
        color: #fff;
        font-size: 0.875rem;
        font-weight: 600;
        padding: 0.625rem 0.5rem;
        cursor: pointer;
    }

    .btn:disabled {
        opacity: 0.4;
        cursor: default;
    }

    .btn-success {
        background-color: var(--success);
    }

    .btn-primary {
        background-color: var(--primary);
    }

    .btn-danger {
        background-color: var(--secondary);
    }
</style>
