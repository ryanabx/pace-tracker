import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    ThemeProvider,
    createTheme,
    CssBaseline,
    Box,
    Container,
    Paper,
    Typography,
    useColorScheme,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    BottomNavigation,
    BottomNavigationAction,
    Button,
    Alert,
    Snackbar,
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import SpeedIcon from '@mui/icons-material/Speed';
import HistoryIcon from '@mui/icons-material/History';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import { loadState, saveState, AppState, ThemeMode } from '../core/state';
import {
    formatTime,
    calculateAverage,
    getTimeSinceLastClick,
    addPress,
    clearHistory,
} from '../core/tracker';
import PaceButton from './components/PaceButton';
import HistoryList from './components/HistoryList';
import MetricsDisplay from './components/MetricsDisplay';
import SettingsTab from './components/Settings';

const LIGHT_THEME = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc3545',
        },
        background: {
            default: '#f0f2f5',
        },
    },
    typography: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
        },
    },
});

const DARK_THEME = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#90caf9',
        },
        secondary: {
            main: '#ef5350',
        },
        background: {
            default: '#121212',
            paper: '#1e1e1e',
        },
    },
    typography: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
        },
    },
});

const getTheme = (mode: ThemeMode, systemMode: 'light' | 'dark'): typeof LIGHT_THEME => {
    if (mode === 'dark') return DARK_THEME;
    if (mode === 'light') return LIGHT_THEME;
    return systemMode === 'dark' ? DARK_THEME : LIGHT_THEME;
};

const INITIAL_DISPLAY_COUNT = 5;
const SHOW_MORE_INCREMENT = 10;
const COMMIT_HASH = __COMMIT_HASH__;
const REPO_URL = 'https://github.com/ryanabx/pace-tracker';

const TABS = [
    { label: 'Pace', icon: <SpeedIcon /> },
    { label: 'History', icon: <HistoryIcon /> },
    { label: 'Metrics', icon: <BarChartIcon /> },
    { label: 'Settings', icon: <SettingsIcon /> },
];

type TabName = 'pace' | 'history' | 'metrics' | 'settings';

const App: React.FC = () => {
    const { mode: systemMode, setMode: setSystemMode } = useColorScheme();
    const [state, setState] = useState<AppState>(() => loadState());
    const [activeTab, setActiveTab] = useState<TabName>('pace');
    const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT);
    const [now, setNow] = useState(Date.now());
    const [themeMenuAnchor, setThemeMenuAnchor] = useState<null | HTMLElement>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
        open: false,
        message: '',
        severity: 'info',
    });

    // Persist state to localStorage whenever it changes
    useEffect(() => {
        saveState(state);
    }, [state]);

    // Sync system mode override when user changes theme mode
    useEffect(() => {
        if (state.themeMode === 'auto') {
            setSystemMode((systemMode as 'light' | 'dark' | null) ?? 'light');
        }
    }, [state.themeMode, systemMode, setSystemMode]);

    const handleThemeModeChange = useCallback((mode: ThemeMode) => {
        setState(prev => ({ ...prev, themeMode: mode }));
        setThemeMenuAnchor(null);
        if (mode === 'auto') {
            setSystemMode((systemMode as 'light' | 'dark' | null) ?? 'light');
        } else {
            setSystemMode(mode);
        }
    }, [systemMode, setSystemMode]);

    // Update "now" every second for the "time since last" display
    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setNow(Date.now());
        }, 1000);
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const handlePaceClick = useCallback(() => {
        if (!state.activeTrackerId) return;
        const tracker = state.trackers[state.activeTrackerId];
        addPress(tracker, Date.now());
        setState({ ...state });
    }, [state]);

    const handleClearHistory = useCallback(() => {
        if (!state.activeTrackerId) return;
        const tracker = state.trackers[state.activeTrackerId];
        if (window.confirm('Are you sure you want to clear the history for this tracker? This action cannot be undone.')) {
            clearHistory(tracker);
            setDisplayCount(INITIAL_DISPLAY_COUNT);
            setState({ ...state });
            setSnackbar({ open: true, message: 'History cleared.', severity: 'success' });
        }
    }, [state]);

    const handleNewTracker = useCallback(() => {
        const name = window.prompt('Enter a name for the new tracker:', 'New Pace');
        if (name) {
            const newId = `tracker-${Date.now()}`;
            const newTracker = { name, pressTimes: [] as number[] };
            setState({
                ...state,
                trackers: { ...state.trackers, [newId]: newTracker },
                activeTrackerId: newId,
            });
            setSnackbar({ open: true, message: `Tracker "${name}" created.`, severity: 'success' });
        }
    }, [state]);

    const handleRenameTracker = useCallback(() => {
        if (!state.activeTrackerId) return;
        const tracker = state.trackers[state.activeTrackerId];
        const newName = window.prompt('Enter a new name for this tracker:', tracker.name);
        if (newName && newName.trim()) {
            setState({
                ...state,
                trackers: {
                    ...state.trackers,
                    [state.activeTrackerId]: { ...tracker, name: newName.trim() },
                },
            });
            setSnackbar({ open: true, message: `Tracker renamed to "${newName.trim()}".`, severity: 'success' });
        }
    }, [state]);

    const handleDeleteTracker = useCallback(() => {
        if (!state.activeTrackerId) return;
        const trackerIds = Object.keys(state.trackers);
        if (trackerIds.length <= 1) {
            setSnackbar({ open: true, message: 'Cannot delete the last tracker.', severity: 'error' });
            return;
        }

        const currentTrackerName = state.trackers[state.activeTrackerId].name;
        if (window.confirm(`Are you sure you want to delete the "${currentTrackerName}" tracker?`)) {
            const currentIndex = trackerIds.indexOf(state.activeTrackerId);
            const newTrackers = { ...state.trackers };
            delete newTrackers[state.activeTrackerId!];

            const newTrackerIds = Object.keys(newTrackers);
            const newActiveId = newTrackerIds[currentIndex] || newTrackerIds[newTrackerIds.length - 1];

            setState({
                ...state,
                trackers: newTrackers,
                activeTrackerId: newActiveId,
            });
            setSnackbar({ open: true, message: `Tracker "${currentTrackerName}" deleted.`, severity: 'success' });
        }
    }, [state]);

    const handleSwitchTracker = useCallback((direction: 'next' | 'prev') => {
        if (!state.activeTrackerId) return;
        const trackerIds = Object.keys(state.trackers);
        const currentIndex = trackerIds.indexOf(state.activeTrackerId);
        let nextIndex: number;

        if (direction === 'next') {
            nextIndex = (currentIndex + 1) % trackerIds.length;
        } else {
            nextIndex = (currentIndex - 1 + trackerIds.length) % trackerIds.length;
        }

        setState({
            ...state,
            activeTrackerId: trackerIds[nextIndex],
        });
        setDisplayCount(INITIAL_DISPLAY_COUNT);
    }, [state]);

    const handleSelectTracker = useCallback((trackerId: string) => {
        setState(prev => ({ ...prev, activeTrackerId: trackerId }));
        setDisplayCount(INITIAL_DISPLAY_COUNT);
    }, []);

    const activeTracker = state.activeTrackerId ? state.trackers[state.activeTrackerId] : null;
    const pressTimes = activeTracker?.pressTimes ?? [];

    const theme = getTheme(state.themeMode, systemMode as 'light' | 'dark');
    const activeThemeMode = state.themeMode === 'auto' ? systemMode : state.themeMode;

    const themeMenuItems: { mode: ThemeMode; icon: React.ReactNode; label: string }[] = [
        { mode: 'auto', icon: <WbSunnyIcon />, label: 'Auto (System)' },
        { mode: 'light', icon: <Brightness7Icon />, label: 'Light' },
        { mode: 'dark', icon: <Brightness4Icon />, label: 'Dark' },
    ];

    const timeSinceLast = pressTimes.length > 0 ? getTimeSinceLastClick(pressTimes) : -1;

    const tabContentHeight = {
        height: { xs: 'calc(85dvh - 56px)', sm: 'calc(80dvh - 56px)' },
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box
                sx={{
                    minHeight: '100dvh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    bgcolor: 'background.default',
                    py: { xs: 2, sm: 3 },
                }}
            >
                <Container maxWidth="sm" disableGutters>
                    <Paper
                        elevation={3}
                        sx={{
                            p: { xs: 2, sm: 4 },
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            ...tabContentHeight,
                            overflow: 'hidden',
                        }}
                    >
                        {/* Tracker Header with Navigation and Theme Toggle */}
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                flexShrink: 0,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <IconButton onClick={() => handleSwitchTracker('prev')} sx={{ color: 'primary.main' }}>
                                    <ChevronLeftIcon />
                                </IconButton>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        flexGrow: 1,
                                        textAlign: 'center',
                                        color: 'primary.main',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {activeTracker?.name ?? 'Pace Tracker'}
                                </Typography>
                                <IconButton onClick={() => handleSwitchTracker('next')} sx={{ color: 'primary.main' }}>
                                    <ChevronRightIcon />
                                </IconButton>
                            </Box>
                            <IconButton
                                onClick={(e) => setThemeMenuAnchor(e.currentTarget)}
                                sx={{ color: 'primary.main', ml: 1 }}
                            >
                                {activeThemeMode === 'dark' ? <Brightness4Icon /> : <Brightness7Icon />}
                            </IconButton>
                        </Box>

                        <Menu
                            anchorEl={themeMenuAnchor}
                            open={Boolean(themeMenuAnchor)}
                            onClose={() => setThemeMenuAnchor(null)}
                        >
                            {themeMenuItems.map(({ mode, icon, label }) => (
                                <MenuItem
                                    key={mode}
                                    onClick={() => handleThemeModeChange(mode)}
                                    selected={state.themeMode === mode}
                                >
                                    <ListItemIcon>{icon}</ListItemIcon>
                                    <ListItemText primary={label} />
                                </MenuItem>
                            ))}
                        </Menu>

                        {/* Tab Content */}
                        <Box
                            sx={{
                                flex: 1,
                                overflowY: 'auto',
                                minHeight: 0,
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            {activeTab === 'pace' && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 2,
                                        flex: 1,
                                        py: 2,
                                    }}
                                >
                                    <PaceButton
                                        onPaceClick={handlePaceClick}
                                        elapsed={timeSinceLast}
                                    />
                                </Box>
                            )}

                            {activeTab === 'history' && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 2,
                                        flex: 1,
                                        minHeight: 0,
                                    }}
                                >
                                    {pressTimes.length === 0 ? (
                                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                                                No clicks recorded yet.
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <HistoryList
                                            pressTimes={pressTimes}
                                            displayCount={displayCount}
                                            onShowMore={() => setDisplayCount(prev => prev + SHOW_MORE_INCREMENT)}
                                            onShowLess={() => setDisplayCount(INITIAL_DISPLAY_COUNT)}
                                        />
                                    )}
                                </Box>
                            )}

                            {activeTab === 'metrics' && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 1.5,
                                        flex: 1,
                                        py: 1,
                                    }}
                                >
                                    <MetricsDisplay
                                        pressTimes={pressTimes}
                                        now={now}
                                    />
                                </Box>
                            )}

                            {activeTab === 'settings' && (
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
                            )}
                        </Box>

                        {/* Clear History — always visible, outside scroll */}
                        {activeTab === 'history' && (
                            <Box sx={{ flexShrink: 0 }}>
                                <Button
                                    variant="contained"
                                    color="warning"
                                    size="small"
                                    onClick={handleClearHistory}
                                    disabled={pressTimes.length === 0}
                                    fullWidth
                                >
                                    Clear History
                                </Button>
                            </Box>
                        )}

                        {/* Bottom Navigation */}
                        <BottomNavigation
                            value={activeTab}
                            onChange={(_, newValue) => setActiveTab(newValue as TabName)}
                            sx={{
                                mt: 'auto',
                                borderRadius: 2,
                                bgcolor: 'background.paper',
                                boxShadow: 1,
                            }}
                        >
                            {TABS.map(tab => (
                                <BottomNavigationAction
                                    key={tab.label}
                                    label={tab.label}
                                    value={tab.label.toLowerCase() as TabName}
                                    icon={tab.icon}
                                    sx={{
                                        '&.Mui-selected': {
                                            color: 'primary.main',
                                        },
                                    }}
                                />
                            ))}
                        </BottomNavigation>
                    </Paper>
                </Container>
            </Box>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </ThemeProvider>
    );
};

export default App;
