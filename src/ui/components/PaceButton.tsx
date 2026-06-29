import React from 'react';
import { Button } from '@mui/material';
import WatchIcon from '@mui/icons-material/Watch';

interface PaceButtonProps {
    onPaceClick: () => void;
}

const PaceButton: React.FC<PaceButtonProps> = ({ onPaceClick }) => {
    return (
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
    );
};

export default PaceButton;
