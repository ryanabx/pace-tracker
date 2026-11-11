<script lang="ts">
    import Card, { Content } from '@smui/card';
    import Button, { Label, Icon } from '@smui/button';
    import Select, { Option } from '@smui/select';
    import { mdiOpenInNew, mdiPlus, mdiPencil, mdiTrashCan } from '@mdi/js';
    import type { Tracker, ThemeMode } from '../../core/state';
    import Mdi from './Mdi.svelte';

    let {
        commitHash,
        repoUrl,
        themeMode = $bindable(),
        activeTrackerId = $bindable(),
        trackers,
        onRenameTracker,
        onNewTracker,
        onDeleteTracker,
    }: {
        commitHash: string;
        repoUrl: string;
        themeMode: ThemeMode;
        activeTrackerId: string | null;
        trackers: Record<string, Tracker>;
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
    <Card>
        <Content>
            <h2 class="section-title">About</h2>
            <div class="row">
                <span class="muted">Version</span>
                <span class="mono">{commitHash ? commitHash.slice(0, 7) : 'dev'}</span>
            </div>
            <a class="repo-link" href={repoUrl} target="_blank" rel="noopener noreferrer">
                <Mdi d={mdiOpenInNew} />
                <span>{repoDisplay}</span>
            </a>
        </Content>
    </Card>

    <!-- Appearance Section -->
    <Card>
        <Content>
            <h2 class="section-title">Appearance</h2>
            <Select class="appearance-select" bind:value={themeMode}>
                {#each themeOptions as opt (opt.mode)}
                    <Option value={opt.mode}>{opt.label}</Option>
                {/each}
            </Select>
        </Content>
    </Card>

    <!-- Trackers Section -->
    <Card class="settings-card--trackers">
        <Content>
            <h2 class="section-title">Trackers</h2>
            <Select class="tracker-select" bind:value={activeTrackerId}>
                {#each trackerIds as id (id)}
                    <Option value={id}>{trackers[id].name}</Option>
                {/each}
            </Select>
            <div class="button-row">
                <Button class="tracker-btn" variant="raised" onclick={onNewTracker}>
                    <Icon tag="svg" viewBox="0 0 24 24">
                        <path fill="currentColor" d={mdiPlus} />
                    </Icon>
                    <Label>New</Label>
                </Button>
                <Button class="tracker-btn" variant="raised" onclick={onRenameTracker}>
                    <Icon tag="svg" viewBox="0 0 24 24">
                        <path fill="currentColor" d={mdiPencil} />
                    </Icon>
                    <Label>Rename</Label>
                </Button>
                <Button
                    class="tracker-btn"
                    variant="raised"
                    disabled={trackerIds.length <= 1}
                    onclick={onDeleteTracker}
                >
                    <Icon tag="svg" viewBox="0 0 24 24">
                        <path fill="currentColor" d={mdiTrashCan} />
                    </Icon>
                    <Label>Delete</Label>
                </Button>
            </div>
        </Content>
    </Card>
</div>

<style>
    .settings {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
        flex: 1;
        min-height: 0;
        overflow-y: auto;
    }

    @media (min-width: 720px) {
        .settings {
            grid-template-columns: 1fr 1fr;
        }

        /* The trackers card is the widest; give it the full row. */
        :global(.settings-card--trackers) {
            grid-column: 1 / -1;
        }
    }

    :global(.settings .smui-card__content) {
        display: block;
    }

    .section-title {
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
        color: var(--mdc-theme-text-secondary-on-background, rgba(0, 0, 0, 0.54));
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
        text-decoration: none;
        font-size: 0.875rem;
    }

    .repo-link:hover {
        text-decoration: underline;
    }

    :global(.appearance-select) {
        max-width: 280px;
    }

    :global(.tracker-select) {
        margin-bottom: 0.75rem;
    }

    .button-row {
        display: flex;
        gap: 0.5rem;
    }

    :global(.tracker-btn) {
        flex: 1;
    }
</style>
