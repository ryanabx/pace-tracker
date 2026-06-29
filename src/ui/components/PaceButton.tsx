import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import WatchIcon from '@mui/icons-material/Watch';
import { formatTime } from '../../core/tracker';

interface PaceButtonProps {
    onPaceClick: () => void;
    elapsed?: number;
}

const PaceButton: React.FC<PaceButtonProps> = ({ onPaceClick, elapsed }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Button
                variant="contained"
                size="large"
                onClick={onPaceClick}
                startIcon={<WatchIcon />}
                sx={{
                    minWidth: 200,
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 14px rgba(25, 118, 210, 0.4)',
                    '&:active': {
                        transform: 'scale(0.97)',
                    },
                }}
            >
                Track Pace
            </Button>
            {elapsed !== undefined && elapsed >= 0 && (
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 600,
                        color: 'primary.main',
                        fontFamily: 'monospace',
                    }}
                >
                    {formatTime(elapsed)}
                </Typography>
            )}
        </Box>
    );
};

export default PaceButton;
