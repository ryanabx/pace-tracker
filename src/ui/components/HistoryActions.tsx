import React from 'react';
import { Box, Button } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

interface HistoryActionsProps {
    hasPresses: boolean;
    canDelete: boolean;
    onClearHistory: () => void;
    onNewTracker: () => void;
    onDeleteTracker: () => void;
}

const HistoryActions: React.FC<HistoryActionsProps> = ({
    hasPresses,
    canDelete,
    onClearHistory,
    onNewTracker,
    onDeleteTracker,
}) => {
    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr' },
                gap: 1,
                width: '100%',
            }}
        >
            <Button
                variant="contained"
                color="warning"
                size="small"
                onClick={onClearHistory}
                disabled={!hasPresses}
                startIcon={<ClearIcon />}
                fullWidth
            >
                Clear History
            </Button>
            <Button
                variant="contained"
                color="success"
                size="small"
                onClick={onNewTracker}
                startIcon={<AddIcon />}
                fullWidth
            >
                New Tracker
            </Button>
            <Button
                variant="contained"
                color="secondary"
                size="small"
                onClick={onDeleteTracker}
                disabled={!canDelete}
                startIcon={<DeleteIcon />}
                fullWidth
                sx={{ gridColumn: '1 / -1' }}
            >
                Delete Tracker
            </Button>
        </Box>
    );
};

export default HistoryActions;
