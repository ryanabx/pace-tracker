<script lang="ts">
    import Paper from '@smui/paper';
    import Button, { Label as ButtonLabel } from '@smui/button';
    import IconButton from '@smui/icon-button';
    import Menu from '@smui/menu';
    import List, { Item, Text, Graphic } from '@smui/list';
    import TabBar from '@smui/tab-bar';
    import Tab, { Label, Icon } from '@smui/tab';
    import Kitchen from '@smui/snackbar/kitchen';
    import {
        mdiChevronLeft,
        mdiChevronRight,
        mdiSpeedometer,
        mdiHistory,
        mdiChartBar,
        mdiCog,
        mdiWeatherNight,
        mdiWhiteBalanceSunny,
        mdiThemeLightDark,
    } from '@mdi/js';

    import { loadState, saveState, nextTrackerName, type AppState, type ThemeMode } from '../core/state';
    import { getTimeSinceLastClick } from '../core/tracker';
    import PaceButton from './components/PaceButton.svelte';
    import HistoryList from './components/HistoryList.svelte';
    import MetricsDisplay from './components/MetricsDisplay.svelte';
    import SettingsTab from './components/Settings.svelte';
    import Mdi from './components/Mdi.svelte';

    const INITIAL_DISPLAY_COUNT = 5;
    const SHOW_MORE_INCREMENT = 10;
    const COMMIT_HASH = __COMMIT_HASH__;
    const REPO_URL = 'https://github.com/ryanabx/pace-tracker';
    const DARK_THEME_CSS = `${import.meta.env.BASE_URL}smui-dark.css`;

    interface NavTab {
        name: 'pace' | 'history' | 'metrics' | 'settings';
        label: string;
        icon: string;
    }

    const TABS: NavTab[] = [
        { name: 'pace', label: 'Pace', icon: mdiSpeedometer },
        { name: 'history', label: 'History', icon: mdiHistory },
        { name: 'metrics', label: 'Metrics', icon: mdiChartBar },
        { name: 'settings', label: 'Settings', icon: mdiCog },
    ];

    const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: string }[] = [
        { mode: 'auto', label: 'Auto (System)', icon: mdiThemeLightDark },
        { mode: 'light', label: 'Light', icon: mdiWhiteBalanceSunny },
        { mode: 'dark', label: 'Dark', icon: mdiWeatherNight },
    ];

    let state = $state<AppState>(loadState());
    let activeTab = $state<NavTab>(TABS[0]);
    let displayCount = $state(INITIAL_DISPLAY_COUNT);
    let lastTrackerId = $state(state.activeTrackerId);
    let now = $state(Date.now());
    let themeMenuOpen = $state(false);
    let systemDark = $state(window.matchMedia('(prefers-color-scheme: dark)').matches);
    let kitchen: Kitchen;

    let effectiveTheme = $derived(
        state.themeMode === 'auto' ? (systemDark ? 'dark' : 'light') : state.themeMode
    );

    let activeTracker = $derived(
        state.activeTrackerId ? (state.trackers[state.activeTrackerId] ?? null) : null
    );
    let pressTimes = $derived(activeTracker?.pressTimes ?? []);
    let timeSinceLast = $derived(pressTimes.length > 0 ? getTimeSinceLastClick(pressTimes) : -1);

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

    // Reset the history view when the active tracker changes
    // (via the header arrows, the settings select, or tracker creation).
    $effect(() => {
        if (state.activeTrackerId !== lastTrackerId) {
            lastTrackerId = state.activeTrackerId;
            displayCount = INITIAL_DISPLAY_COUNT;
        }
    });

    const showToast = (message: string) => {
        kitchen.push({ label: message });
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
        const name = window.prompt('Enter a name for the new tracker:', nextTrackerName(state.trackers));
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
    };

    const handleThemeModeChange = (mode: ThemeMode) => {
        state.themeMode = mode;
        themeMenuOpen = false;
    };
</script>

<svelte:head>
    <!--
        The light theme is loaded statically in index.html. This file, loaded
        afterwards, overrides the theme colors when dark mode is active (or,
        in "auto" mode, whenever the system prefers dark colors).
    -->
    {#if state.themeMode === 'dark'}
        <link rel="stylesheet" href={DARK_THEME_CSS} media="screen" />
    {:else if state.themeMode === 'auto'}
        <link
            rel="stylesheet"
            href={DARK_THEME_CSS}
            media="screen and (prefers-color-scheme: dark)"
        />
    {/if}
</svelte:head>

<div class="shell">
    <Paper variant="elevated" class="app-card">
        <!-- Header with tracker navigation and theme toggle -->
        <div class="app-header">
            <IconButton title="Previous tracker" onclick={() => handleSwitchTracker('prev')}>
                <Mdi d={mdiChevronLeft} />
            </IconButton>
            <h1 class="title" title={activeTracker?.name}>
                {activeTracker?.name ?? 'Pace Tracker'}
            </h1>
            <IconButton title="Next tracker" onclick={() => handleSwitchTracker('next')}>
                <Mdi d={mdiChevronRight} />
            </IconButton>
            <div class="theme-wrap">
                <IconButton title="Theme" onclick={() => (themeMenuOpen = !themeMenuOpen)}>
                    {#if effectiveTheme === 'dark'}
                        <Mdi d={mdiWeatherNight} />
                    {:else}
                        <Mdi d={mdiWhiteBalanceSunny} />
                    {/if}
                </IconButton>
                <Menu bind:open={themeMenuOpen}>
                    <List>
                        {#each THEME_OPTIONS as option (option.mode)}
                            <Item
                                selected={state.themeMode === option.mode}
                                onSMUIAction={() => handleThemeModeChange(option.mode)}
                            >
                                <Graphic>
                                    <Mdi d={option.icon} />
                                </Graphic>
                                <Text>{option.label}</Text>
                            </Item>
                        {/each}
                    </List>
                </Menu>
            </div>
        </div>

        <!-- Tab navigation: at the bottom on phones, on top on wider screens -->
        <TabBar
            class="nav-tabs"
            tabs={TABS}
            key={(tab: NavTab) => tab.name}
            bind:active={activeTab}
        >
            {#snippet tab(tab)}
                <Tab {tab}>
                    <Icon tag="svg" viewBox="0 0 24 24">
                        <path fill="currentColor" d={tab.icon} />
                    </Icon>
                    <Label>{tab.label}</Label>
                </Tab>
            {/snippet}
        </TabBar>

        <!-- Tab content -->
        <div class="content">
            {#if activeTab.name === 'pace'}
                <div class="pace-view">
                    <PaceButton onPaceClick={handlePaceClick} elapsed={timeSinceLast} />
                </div>
            {:else if activeTab.name === 'history'}
                <div class="history-view">
                    {#if pressTimes.length === 0}
                        <p class="empty mdc-typography--body2">No clicks recorded yet.</p>
                    {:else}
                        <HistoryList
                            {pressTimes}
                            {displayCount}
                            onShowMore={() => (displayCount += SHOW_MORE_INCREMENT)}
                            onShowLess={() => (displayCount = INITIAL_DISPLAY_COUNT)}
                        />
                    {/if}
                </div>
            {:else if activeTab.name === 'metrics'}
                <MetricsDisplay {pressTimes} {now} />
            {:else}
                <SettingsTab
                    commitHash={COMMIT_HASH}
                    repoUrl={REPO_URL}
                    bind:themeMode={state.themeMode}
                    bind:activeTrackerId={state.activeTrackerId}
                    trackers={state.trackers}
                    onRenameTracker={handleRenameTracker}
                    onNewTracker={handleNewTracker}
                    onDeleteTracker={handleDeleteTracker}
                />
            {/if}
        </div>

        <!-- Clear History — always visible, outside scroll -->
        {#if activeTab.name === 'history'}
            <div class="clear-row">
                <Button
                    class="clear-btn"
                    variant="raised"
                    disabled={pressTimes.length === 0}
                    onclick={handleClearHistory}
                >
                    <ButtonLabel>Clear History</ButtonLabel>
                </Button>
            </div>
        {/if}

    </Paper>

    <Kitchen bind:this={kitchen} />
</div>

<style>
    /*
     * Mobile-first layout: the app fills the whole viewport and the tab
     * navigation sits at the bottom. From 640px up, the app becomes a
     * rounded card with a margin around it, the tabs move to the top (the
     * conventional desktop position), and the content is limited to a
     * readable width.
     */
    .shell {
        height: 100dvh;
        display: flex;
        justify-content: center;
    }

    /* Two classes to outrank the .smui-paper--rounded border-radius rule. */
    :global(.app-card.smui-paper) {
        height: 100%;
        width: 100%;
        max-width: 100%;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        overflow: hidden;
        padding: 0.75rem;
        border-radius: 0;
    }

    /* Mobile order: header, content, (clear row), tabs. */
    .app-header {
        order: 0;
    }

    .content {
        order: 1;
    }

    .clear-row {
        order: 2;
    }

    :global(.nav-tabs) {
        order: 3;
    }

    @media (min-width: 640px) {
        .shell {
            padding: 1.25rem;
        }

        :global(.app-card.smui-paper) {
            max-width: 860px;
            border-radius: 12px;
            padding: 1.25rem 1.5rem;
            gap: 1rem;
        }

        /* Desktop order: header, tabs, content, (clear row). */
        :global(.nav-tabs) {
            order: 1;
        }

        .content {
            order: 2;
        }

        .clear-row {
            order: 3;
        }
    }

    .app-header {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        flex-shrink: 0;
    }

    :global(.app-header .mdc-icon-button) {
        --mdc-icon-button-hover-opacity: 1;
        color: var(--mdc-theme-primary);
    }

    .title {
        flex-grow: 1;
        margin: 0;
        text-align: center;
        color: var(--mdc-theme-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .theme-wrap {
        position: relative;
        margin-left: 0.25rem;
    }

    .content {
        flex: 1;
        overflow-y: auto;
        min-height: 0;
        display: flex;
        flex-direction: column;
    }

    @media (min-width: 640px) {
        /* Keep content at a readable width on wide screens. */
        .content,
        .clear-row {
            max-width: 720px;
            width: 100%;
            margin: 0 auto;
        }
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
        color: var(--mdc-theme-text-secondary-on-background, rgba(0, 0, 0, 0.54));
        margin: 0;
        padding: 2rem;
        text-align: center;
    }

    .clear-row {
        flex-shrink: 0;
    }

    :global(.clear-btn) {
        width: 100%;
    }

    :global(.nav-tabs) {
        flex-shrink: 0;
        border-top: 1px solid var(--mdc-theme-outline, rgba(0, 0, 0, 0.12));
    }

    @media (min-width: 640px) {
        :global(.nav-tabs) {
            border-top: none;
            border-bottom: 1px solid var(--mdc-theme-outline, rgba(0, 0, 0, 0.12));
        }

        :global(.clear-btn) {
            width: auto;
            margin: 0 auto;
        }
    }
</style>
