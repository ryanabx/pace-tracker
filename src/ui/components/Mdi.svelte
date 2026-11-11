<script lang="ts">
    import { Icon } from '@smui/common';

    // A Material Design Icon path (from the @mdi/js package).
    let { d, size = 24 }: { d: string; size?: number } = $props();
</script>

<Icon tag="svg" viewBox="0 0 24 24" class="mdi-icon" style="width: {size}px; height: {size}px; font-size: {size}px;">
    <path fill="currentColor" d={d} />
</Icon>

<style>
    .mdi-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
    }
</style>
