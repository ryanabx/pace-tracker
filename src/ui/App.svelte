<script lang="ts">
    import { loadState, saveState, type AppState, type ThemeMode } from '../core/state';
    import { getTimeSinceLastClick } from '../core/tracker';
    import PaceButton from './components/PaceButton.svelte';
    import HistoryList from './components/HistoryList.svelte';
    import MetricsDisplay from './components/MetricsDisplay.svelte';
    import SettingsTab from './components/Settings.svelte';

    const INITIAL_DISPLAY_COUNT = 5;
    const SHOW_MORE_INCREMENT = 10;
    const COMMIT_HASH = __COMMIT_HASH__;
    const REPO_URL = 'https://github.com/ryanabx/pace-tracker';

    type TabName = 'pace' | 'history' | 'metrics' | 'settings';

    const TABS: { name: TabName; label: string }[] = [
        { name: 'pace', label: 'Pace' },
        { name: 'history', label: 'History' },
        { name: 'metrics', label: 'Metrics' },
        { name: 'settings', label: 'Settings' },
    ];

    const THEME_OPTIONS: { mode: ThemeMode; label: string }[] = [
        { mode: 'auto', label: 'Auto (System)' },
        { mode: 'light', label: 'Light' },
        { mode: 'dark', label: 'Dark' },
    ];

    let state = $state<AppState>(loadState());
    let activeTab = $state<TabName>('pace');
    let displayCount = $state(INITIAL_DISPLAY_COUNT);
    let now = $state(Date.now());
    let themeMenuOpen = $state(false);
    let toast = $state({ open: false, message: '' });
    let toastTimer: ReturnType<typeof setTimeout> | undefined;
    let systemDark = $state(window.matchMedia('(prefers-color-scheme: dark)').matches);

    let effectiveTheme = $derived(
        state.themeMode === 'auto' ? (systemDark ? 'dark' : 'light') : state.themeMode
    );

    let activeTracker = $derived(
        state.activeTrackerId ? (state.trackers[state.activeTrackerId] ?? null) : null
    );
    let pressTimes = $derived(activeTracker?.pressTimes ?? []);
    let timeSinceLast = $derived(pressTimes.length > 0 ? getTimeSinceLastClick(pressTimes) : -1);

    // Reflect the effective theme on the document root (see app.css)
    $effect(() => {
        document.documentElement.dataset.theme = effectiveTheme;
    });

    // Track the system theme for "auto" mode
    $effect(() => {
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = (e: MediaQueryListEvent) => (systemDark = e.matches);
        mql.addEventListener('change', onChange);
        return () => mql.removeEventListener('change', onChange);
    });

    // Persist state to localStorage whenever it changes
    $effect(() => {
        saveState(state);
    });

    // Update "now" every second for the "time since last" display
    $effect(() => {
        const interval = setInterval(() => (now = Date.now()), 1000);
        return () => clearInterval(interval);
    });

    const showToast = (message: string) => {
        toast = { open: true, message };
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => (toast = { open: false, message: '' }), 3000);
    };

    const handlePaceClick = () => {
        if (!activeTracker) return;
        activeTracker.pressTimes.push(Date.now());
    };

    const handleClearHistory = () => {
        if (!activeTracker) return;
        if (
            window.confirm(
                'Are you sure you want to clear the history for this tracker? This action cannot be undone.'
            )
        ) {
            activeTracker.pressTimes = [];
            displayCount = INITIAL_DISPLAY_COUNT;
            showToast('History cleared.');
        }
    };

    const handleNewTracker = () => {
        const name = window.prompt('Enter a name for the new tracker:', 'New Pace');
        if (name) {
            const newId = `tracker-${Date.now()}`;
            state.trackers[newId] = { name, pressTimes: [] };
            state.activeTrackerId = newId;
            showToast(`Tracker "${name}" created.`);
        }
    };

    const handleRenameTracker = () => {
        if (!activeTracker) return;
        const newName = window.prompt('Enter a new name for this tracker:', activeTracker.name);
        if (newName && newName.trim()) {
            activeTracker.name = newName.trim();
            showToast(`Tracker renamed to "${newName.trim()}".`);
        }
    };

    const handleDeleteTracker = () => {
        if (!state.activeTrackerId) return;
        const trackerIds = Object.keys(state.trackers);
        if (trackerIds.length <= 1) {
            showToast('Cannot delete the last tracker.');
            return;
        }

        const currentTracker = state.trackers[state.activeTrackerId];
        if (window.confirm(`Are you sure you want to delete the "${currentTracker.name}" tracker?`)) {
            const currentIndex = trackerIds.indexOf(state.activeTrackerId);
            delete state.trackers[state.activeTrackerId];
            const newTrackerIds = Object.keys(state.trackers);
            state.activeTrackerId = newTrackerIds[currentIndex] ?? newTrackerIds[newTrackerIds.length - 1];
            showToast(`Tracker "${currentTracker.name}" deleted.`);
        }
    };

    const handleSwitchTracker = (direction: 'next' | 'prev') => {
        if (!state.activeTrackerId) return;
        const trackerIds = Object.keys(state.trackers);
        const currentIndex = trackerIds.indexOf(state.activeTrackerId);
        const nextIndex =
            direction === 'next'
                ? (currentIndex + 1) % trackerIds.length
                : (currentIndex - 1 + trackerIds.length) % trackerIds.length;

        state.activeTrackerId = trackerIds[nextIndex];
        displayCount = INITIAL_DISPLAY_COUNT;
    };

    const handleSelectTracker = (trackerId: string) => {
        state.activeTrackerId = trackerId;
        displayCount = INITIAL_DISPLAY_COUNT;
    };

    const handleThemeModeChange = (mode: ThemeMode) => {
        state.themeMode = mode;
        themeMenuOpen = false;
    };
</script>

<div class="shell">
    <div class="card">
        <!-- Header with tracker navigation and theme toggle -->
        <header class="app-header">
            <button class="icon-btn" title="Previous tracker" onclick={() => handleSwitchTracker('prev')}>
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                    <path fill="currentColor" d="M15.41,7.41L14,6l-6,6l6,6l1.41,-1.41l-4.59,-4.59z" />
                </svg>
            </button>
            <h1 class="title" title={activeTracker?.name}>{activeTracker?.name ?? 'Pace Tracker'}</h1>
            <button class="icon-btn" title="Next tracker" onclick={() => handleSwitchTracker('next')}>
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                    <path fill="currentColor" d="M8.59,16.59L10.01,18l6,-6l-6,-6l-1.42,1.41l4.59,4.59z" />
                </svg>
            </button>
            <div class="theme-wrap">
                <button class="icon-btn" title="Theme" onclick={() => (themeMenuOpen = !themeMenuOpen)}>
                    {#if effectiveTheme === 'dark'}
                        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                            <path
                                fill="currentColor"
                                d="M12.34,2.02C6.59,1.82,2,6.42,2,12c0,5.52,4.48,10,10,10c3.71,0,6.93,-2.02,8.66,-5.02C13.15,16.73,8.57,8.55,12.34,2.02z" />
                        </svg>
                    {:else}
                        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                            <path
                                fill="currentColor"
                                d="M12,9c1.65,0,3,1.35,3,3s-1.35,3-3,3s-3,-1.35-3,-3S10.35,9,12,9zM12,7c-2.76,0-5,2.24-5,5s2.24,5,5,5s5,-2.24,5,-5S14.76,7,12,7L12,7z M2,13l2,0c0.55,0,1,-0.45,1,-1s-0.45,-1,-1,-1l-2,0C1.45,11,1,11.45,1,12S1.45,13,2,13z M20,13l2,0c0.55,0,1,-0.45,1,-1s-0.45,-1,-1,-1l-2,0C19.45,11,19,11.45,19,12S19.45,13,20,13z M11,2v2c0,0.55,0.45,1,1,1s1,-0.45,1,-1V2C13,1.45,12.55,1,12,1S11,1.45,11,2z M11,20v2c0,0.55,0.45,1,1,1s1,-0.45,1,-1v-2C13,20.45,12.55,20,12,20S11,20.45,11,20z M5.99,4.58c-0.39,-0.39,-1.03,-0.39,-1.41,0c-0.39,0.39,-0.39,1.03,0,1.41l1.06,1.06c0.39,0.39,1.03,0.39,1.41,0s0.39,-1.03,0,-1.41L5.99,4.58z M18.36,16.95c-0.39,-0.39,-1.03,-0.39,-1.41,0c-0.39,0.39,-0.39,1.03,0,1.41l1.06,1.06c0.39,0.39,1.03,0.39,1.41,0c0.39,-0.39,0.39,-1.03,0,-1.41L18.36,16.95z M19.42,5.99c0.39,-0.39,0.39,-1.03,0,-1.41c-0.39,-0.39,-1.03,-0.39,-1.41,0l-1.06,1.06c-0.39,0.39,-0.39,1.03,0,1.41s1.03,0.39,1.41,0L19.42,5.99z M7.05,18.36c0.39,-0.39,0.39,-1.03,0,-1.41c-0.39,-0.39,-1.03,-0.39,-1.41,0l-1.06,1.06c-0.39,0.39,-0.39,1.03,0,1.41s1.03,0.39,1.41,0L7.05,18.36z" />
                        </svg>
                    {/if}
                </button>
                {#if themeMenuOpen}
                    <div class="theme-menu">
                        {#each THEME_OPTIONS as option (option.mode)}
                            <button
                                class="theme-menu-item"
                                class:active={state.themeMode === option.mode}
                                onclick={() => handleThemeModeChange(option.mode)}
                            >
                                {option.label}
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>
        </header>

        <!-- Tab content -->
        <div class="content">
            {#if activeTab === 'pace'}
                <div class="pace-view">
                    <PaceButton onPaceClick={handlePaceClick} elapsed={timeSinceLast} />
                </div>
            {:else if activeTab === 'history'}
                <div class="history-view">
                    {#if pressTimes.length === 0}
                        <p class="empty">No clicks recorded yet.</p>
                    {:else}
                        <HistoryList
                            {pressTimes}
                            {displayCount}
                            onShowMore={() => (displayCount += SHOW_MORE_INCREMENT)}
                            onShowLess={() => (displayCount = INITIAL_DISPLAY_COUNT)}
                        />
                    {/if}
                </div>
            {:else if activeTab === 'metrics'}
                <MetricsDisplay {pressTimes} {now} />
            {:else}
                <SettingsTab
                    commitHash={COMMIT_HASH}
                    repoUrl={REPO_URL}
                    themeMode={state.themeMode}
                    onThemeModeChange={handleThemeModeChange}
                    trackers={state.trackers}
                    activeTrackerId={state.activeTrackerId}
                    onSelectTracker={handleSelectTracker}
                    onRenameTracker={handleRenameTracker}
                    onNewTracker={handleNewTracker}
                    onDeleteTracker={handleDeleteTracker}
                />
            {/if}
        </div>

        <!-- Clear History — always visible, outside scroll -->
        {#if activeTab === 'history'}
            <div class="clear-row">
                <button
                    class="clear-btn"
                    disabled={pressTimes.length === 0}
                    onclick={handleClearHistory}
                >
                    Clear History
                </button>
            </div>
        {/if}

        <!-- Bottom navigation -->
        <nav class="bottom-nav">
            {#each TABS as tab (tab.name)}
                <button
                    class="nav-item"
                    class:active={activeTab === tab.name}
                    onclick={() => (activeTab = tab.name)}
                >
                    {tab.label}
                </button>
            {/each}
        </nav>
    </div>

    {#if toast.open}
        <div class="toast">{toast.message}</div>
    {/if}
</div>

<style>
    .shell {
        height: 100dvh;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .card {
        height: 100dvh;
        width: 100%;
        background-color: var(--paper);
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        overflow: hidden;
        padding: 0.75rem;
    }

    @media (min-width: 640px) {
        .shell {
            padding: 1.5rem 1rem;
        }

        .card {
            width: 100%;
            max-width: 600px;
            border-radius: 0.5rem;
            box-shadow: 0 3px 5px rgba(0, 0, 0, 0.15), 0 5px 8px rgba(0, 0, 0, 0.1);
            padding: 2rem;
            gap: 1rem;
        }
    }

    .app-header {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        flex-shrink: 0;
    }

    .icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: var(--primary);
        cursor: pointer;
        padding: 0;
        flex-shrink: 0;
    }

    .icon-btn:hover {
        background: var(--selected-bg);
    }

    .title {
        flex-grow: 1;
        margin: 0;
        font-size: 1.25rem;
        font-weight: 500;
        text-align: center;
        color: var(--primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .theme-wrap {
        position: relative;
        margin-left: 0.25rem;
    }

    .theme-menu {
        position: absolute;
        top: calc(100% + 4px);
        right: 0;
        z-index: 10;
        min-width: 10rem;
        background-color: var(--paper);
        border: 1px solid var(--divider);
        border-radius: 0.5rem;
        box-shadow: 0 3px 5px rgba(0, 0, 0, 0.15);
        padding: 0.25rem 0;
        display: flex;
        flex-direction: column;
    }

    .theme-menu-item {
        border: none;
        background: transparent;
        color: var(--text);
        text-align: left;
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
        cursor: pointer;
    }

    .theme-menu-item:hover {
        background: var(--selected-bg);
    }

    .theme-menu-item.active {
        color: var(--primary);
        font-weight: 600;
    }

    .content {
        flex: 1;
        overflow-y: auto;
        min-height: 0;
        display: flex;
        flex-direction: column;
    }

    .pace-view {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 1rem 0;
    }

    .history-view {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .empty {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-secondary);
        font-size: 0.875rem;
        margin: 0;
        padding: 2rem;
        text-align: center;
    }

    .clear-row {
        flex-shrink: 0;
    }

    .clear-btn {
        width: 100%;
        border: none;
        border-radius: 0.375rem;
        background-color: var(--warning);
        color: #fff;
        font-size: 0.875rem;
        font-weight: 600;
        padding: 0.625rem;
        cursor: pointer;
    }

    .clear-btn:disabled {
        opacity: 0.4;
        cursor: default;
    }

    .bottom-nav {
        flex-shrink: 0;
        display: flex;
        border-top: 1px solid var(--divider);
        background-color: var(--paper);
    }

    .nav-item {
        flex: 1;
        border: none;
        background: transparent;
        color: var(--text-secondary);
        font-size: 0.8125rem;
        padding: 0.75rem 0.25rem;
        cursor: pointer;
        border-top: 2px solid transparent;
    }

    .nav-item:hover {
        background: var(--selected-bg);
    }

    .nav-item.active {
        color: var(--primary);
        border-top-color: var(--primary);
        font-weight: 600;
    }

    .toast {
        position: fixed;
        bottom: 1.5rem;
        left: 50%;
        transform: translateX(-50%);
        background-color: #323232;
        color: #fff;
        padding: 0.75rem 1.25rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        box-shadow: 0 3px 5px rgba(0, 0, 0, 0.2);
        z-index: 100;
        max-width: 90vw;
    }
</style>
