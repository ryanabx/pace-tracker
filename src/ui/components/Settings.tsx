import React, { useState } from 'react';
import {
    Box,
    Typography,
    Divider,
    Button,
    MenuItem,
    Select,
    SelectChangeEvent,
    Card,
    CardContent,
    IconButton,
    Tooltip,
    Link,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Tracker, ThemeMode } from '../../core/state';

interface SettingsTabProps {
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
}

const SettingsTab: React.FC<SettingsTabProps> = ({
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
}) => {
    const trackerIds = Object.keys(trackers);
    const [selectAnchor, setSelectAnchor] = useState<null | HTMLElement>(null);

    const themeOptions: { mode: ThemeMode; label: string }[] = [
        { mode: 'auto', label: 'Auto (System)' },
        { mode: 'light', label: 'Light' },
        { mode: 'dark', label: 'Dark' },
    ];

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                flex: 1,
                overflowY: 'auto',
                minHeight: 0,
            }}
        >
            {/* About Section */}
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        About
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <InfoIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                                Version
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', ml: 'auto' }}>
                                {commitHash ? `${commitHash.slice(0, 7)}` : 'dev'}
                            </Typography>
                        </Box>
                        <Link
                            href={repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            underline="hover"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                color: 'primary.main',
                                textDecoration: 'none',
                                fontSize: '0.875rem',
                            }}
                        >
                            <OpenInNewIcon fontSize="small" />
                            {new URL(repoUrl).hostname}/{new URL(repoUrl).pathname.replace(/^\//, '')}
                        </Link>
                    </Box>
                </CardContent>
            </Card>

            {/* Appearance Section */}
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        Appearance
                    </Typography>
                    <Select
                        value={themeMode}
                        onChange={(e: SelectChangeEvent) => onThemeModeChange(e.target.value as ThemeMode)}
                        fullWidth
                        size="small"
                    >
                        {themeOptions.map(opt => (
                            <MenuItem key={opt.mode} value={opt.mode}>
                                {opt.label}
                            </MenuItem>
                        ))}
                    </Select>
                </CardContent>
            </Card>

            {/* Trackers Section */}
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        Trackers
                    </Typography>

                    <Select
                        value={activeTrackerId || ''}
                        onChange={(e: SelectChangeEvent) => onSelectTracker(e.target.value)}
                        fullWidth
                        size="small"
                        sx={{ mb: 2 }}
                    >
                        {trackerIds.map(id => (
                            <MenuItem key={id} value={id}>
                                {trackers[id].name}
                            </MenuItem>
                        ))}
                    </Select>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={onNewTracker}
                            startIcon={<AddIcon />}
                            fullWidth
                        >
                            New
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={onRenameTracker}
                            startIcon={<EditIcon />}
                            fullWidth
                        >
                            Rename
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            size="small"
                            onClick={onDeleteTracker}
                            disabled={trackerIds.length <= 1}
                            startIcon={<DeleteIcon />}
                            fullWidth
                        >
                            Delete
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default SettingsTab;
