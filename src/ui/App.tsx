import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    ThemeProvider,
    createTheme,
    CssBaseline,
    Box,
    Container,
    Paper,
    Typography,
} from '@mui/material';
import { loadState, saveState, AppState, Tracker } from '../core/state';
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

const theme = createTheme({
    palette: {
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

const INITIAL_DISPLAY_COUNT = 5;
const SHOW_MORE_INCREMENT = 10;

const App: React.FC = () => {
    const [state, setState] = useState<AppState>(() => loadState());
    const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT);
    const [now, setNow] = useState(Date.now());
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Persist state to localStorage whenever it changes
    useEffect(() => {
        saveState(state);
    }, [state]);

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
                            minHeight: { xs: '80dvh', sm: '70dvh' },
                            overflow: 'hidden',
                        }}
                    >
                        {/* Tracker Header with Navigation */}
                        <TrackerHeader
                            trackerName={activeTracker?.name ?? 'Pace Tracker'}
                            onPrev={() => handleSwitchTracker('prev')}
                            onNext={() => handleSwitchTracker('next')}
                        />

                        {/* Main Pace Button */}
                        <PaceButton onPaceClick={handlePaceClick} />

                        {/* Metrics */}
                        <MetricsDisplay
                            pressTimes={pressTimes}
                            now={now}
                        />

                        {/* History List */}
                        <HistoryList
                            pressTimes={pressTimes}
                            displayCount={displayCount}
                            onShowMore={() => setDisplayCount(prev => prev + SHOW_MORE_INCREMENT)}
                            onShowLess={() => setDisplayCount(INITIAL_DISPLAY_COUNT)}
                        />

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
