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
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { loadState, saveState, AppState, Tracker, ThemeMode } from '../core/state';
import {
    formatTime,
    calculateAverage,
    getTimeSinceLastClick,
    addPress,
    clearHistory,
} from '../core/tracker';
import TrackerHeader from './components/TrackerHeader';
import PaceButton from './components/PaceButton';
import MetricsDisplay from './components/MetricsDisplay';
import HistoryList from './components/HistoryList';
import HistoryActions from './components/HistoryActions';

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

const App: React.FC = () => {
    const { mode: systemMode, setMode: setSystemMode } = useColorScheme();
    const [state, setState] = useState<AppState>(() => loadState());
    const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT);
    const [now, setNow] = useState(Date.now());
    const [themeMenuAnchor, setThemeMenuAnchor] = useState<null | HTMLElement>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
        }
    }, [state]);

    const handleNewTracker = useCallback(() => {
        const name = window.prompt('Enter a name for the new tracker:', 'New Pace');
        if (name) {
            const newId = `tracker-${Date.now()}`;
            const newTracker: Tracker = { name, pressTimes: [] };
            setState({
                ...state,
                trackers: { ...state.trackers, [newId]: newTracker },
                activeTrackerId: newId,
            });
        }
    }, [state]);

    const handleDeleteTracker = useCallback(() => {
        if (!state.activeTrackerId) return;
        const trackerIds = Object.keys(state.trackers);
        if (trackerIds.length <= 1) {
            window.alert('You cannot delete the last tracker.');
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

    const activeTracker = state.activeTrackerId ? state.trackers[state.activeTrackerId] : null;
    const pressTimes = activeTracker?.pressTimes ?? [];

    const theme = getTheme(state.themeMode, systemMode as 'light' | 'dark');
    const activeThemeMode = state.themeMode === 'auto' ? systemMode : state.themeMode;

    const themeMenuItems: { mode: ThemeMode; icon: React.ReactNode; label: string }[] = [
        { mode: 'auto', icon: <WbSunnyIcon />, label: 'Auto (System)' },
        { mode: 'light', icon: <Brightness7Icon />, label: 'Light' },
        { mode: 'dark', icon: <Brightness4Icon />, label: 'Dark' },
    ];

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
                            alignItems: 'center',
                            gap: 2,
                            height: { xs: '85dvh', sm: '80dvh' },
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
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <IconButton onClick={() => handleSwitchTracker('prev')} sx={{ color: 'primary.main' }}>
                                    <ArrowBackIcon />
                                </IconButton>
                                <Typography
                                    variant="h4"
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
                                    <ArrowForwardIcon />
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

                        {/* Main Pace Button */}
                        <PaceButton onPaceClick={handlePaceClick} />

                        {/* Metrics */}
                        <MetricsDisplay
                            pressTimes={pressTimes}
                            now={now}
                        />

                        {/* History List — contained scrolling window */}
                        <Box
                            sx={{
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                flexGrow: 1,
                                minHeight: 0,
                                overflow: 'hidden',
                            }}
                        >
                            <Typography variant="h6" sx={{ mb: 1, textAlign: 'left' }}>
                                History
                            </Typography>
                            <Box
                                sx={{
                                    flexGrow: 1,
                                    overflowY: 'auto',
                                    minHeight: 0,
                                }}
                            >
                                {pressTimes.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                        No clicks recorded yet.
                                    </Typography>
                                ) : (
                                    <HistoryList
                                        pressTimes={pressTimes}
                                        displayCount={displayCount}
                                        onShowMore={() => setDisplayCount(prev => prev + SHOW_MORE_INCREMENT)}
                                        onShowLess={() => setDisplayCount(INITIAL_DISPLAY_COUNT)}
                                    />
                                )}
                            </Box>
                        </Box>

                        {/* Action Buttons */}
                        <HistoryActions
                            hasPresses={pressTimes.length > 0}
                            canDelete={Object.keys(state.trackers).length > 1}
                            onClearHistory={handleClearHistory}
                            onNewTracker={handleNewTracker}
                            onDeleteTracker={handleDeleteTracker}
                        />
                    </Paper>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default App;
